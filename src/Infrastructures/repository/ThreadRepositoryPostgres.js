const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");
const AddedThread = require("../../Domains/threads/entities/AddedThread");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { body, title, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, body, title, owner',
      values: [id, title, body, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedThread({ ...result.rows[0] });
  }

  async getById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    return result.rows[0];
  }

  async getWithCommentsById(threadId) {
    const query = {
      text: `
        SELECT t.id, t.title, t.body, t.date, u.username FROM threads t
        LEFT JOIN users u ON u.id = t.owner
        WHERE t.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }

    const comments = {
      text: `
        SELECT
          c.id,
          c.date,
          CASE
            WHEN c.is_delete IS TRUE THEN '**komentar telah dihapus**'
            ELSE content
          END AS content,
          u.username
        FROM comments c
        JOIN users u ON u.id = c.owner
        WHERE c.thread_id = $1
        ORDER BY c.date ASC`,
      values: [threadId],
    }
    const commentResult = await this._pool.query(comments);

    const thread = result.rows[0]
    thread.comments = commentResult.rows;

    return thread;
  }
}

module.exports = ThreadRepositoryPostgres;
