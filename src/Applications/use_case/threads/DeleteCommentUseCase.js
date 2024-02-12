const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, commentId, userId }) {
    await this._threadRepository.verifyExistenceById(threadId);

    const comment = await this._commentRepository.getById(commentId);
    if (comment.owner !== userId) {
      throw new AuthorizationError(
        "Gagal menghapus comment. Anda tidak memiliki akses"
      );
    }

    await this._commentRepository.destroyById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
