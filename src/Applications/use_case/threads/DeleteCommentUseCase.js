class DeleteCommentUseCase {
  constructor({
    commentRepository,
    threadRepository,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.getById(useCasePayload.threadId);
    await this._commentRepository.destroyById(useCasePayload);
  }
}

module.exports = DeleteCommentUseCase;
