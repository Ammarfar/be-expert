class GetThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
  }) {
    this.threadRepository = threadRepository;
    this.commentRepository = commentRepository;
  }

  async execute(threadId) {
    const thread = await this.threadRepository.getById(threadId);
    const comments = await this.commentRepository.getByThreadId(threadId);
    thread.comments = this.mapDeletedComment(comments);

    return thread;
  }

  mapDeletedComment(data) {
    return data.map(v => ({
      id: v.id,
      username: v.username,
      date: v.date,
      content: v.is_delete ? "**komentar telah dihapus**" : v.content,
    }))
  }
}

module.exports = GetThreadUseCase;
