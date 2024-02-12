const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, thread_id, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, thread_id, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedComment({ ...result.rows[0] });
  }

  async destroyById({ commentId, userId }) {
    const queryCheck = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [commentId],
    };

    const resultCheck = await this._pool.query(queryCheck);
    if (!resultCheck.rows.length) {
      throw new NotFoundError("Gagal menghapus comment. Id tidak ditemukan");
    }

    const { owner } = resultCheck.rows[0];
    if (owner !== userId) {
      throw new AuthorizationError(
        "Gagal menghapus comment. Comment tidak ditemukan"
      );
    }

    const query = {
      text: "UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id",
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getByThreadId(threadId) {
    const comments = {
      text: `
        SELECT
          c.id,
          c.date,
          c.is_delete,
          u.username
        FROM comments c
        JOIN users u ON u.id = c.owner
        WHERE c.thread_id = $1
        ORDER BY c.date ASC`,
      values: [threadId],
    };
    const result = await this._pool.query(comments);

    if (!result.rowCount) {
      throw new NotFoundError("comment tidak ditemukan");
    }

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
