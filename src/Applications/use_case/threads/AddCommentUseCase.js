const NewComment = require("../../../Domains/comments/entities/NewComment");

class AddCommentUseCase {
  constructor({
    commentRepository,
    threadRepository,
  }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.getById(useCasePayload.thread_id);
    const newComment = new NewComment(useCasePayload);
    const addedComment = await this._commentRepository.addComment(newComment);
    return addedComment;
  }
}

module.exports = AddCommentUseCase;
