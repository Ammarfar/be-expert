class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute({ threadId, commentId, userId }) {
    await this._threadRepository.verifyExistenceById(threadId);

    const owner = await this._commentRepository.getOwnerById(commentId);
    if (owner !== userId) {
      throw new Error("UNAUTHORIZED");
    }

    await this._commentRepository.destroyById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
