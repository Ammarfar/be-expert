class GetThreadUseCase {
  constructor({
    threadRepository,
  }) {
    this.threadRepository = threadRepository;
  }

  async execute(threadId) {
    const data = await this.threadRepository.getWithCommentsById(threadId);
    data.thread.comments = this.mapDeletedComment(data.thread.comments);

    return data;
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
