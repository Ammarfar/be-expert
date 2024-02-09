class GetThreadUseCase {
  constructor({
    threadRepository,
  }) {
    this.threadRepository = threadRepository;
  }

  async execute(threadId) {
    return this.threadRepository.getWithCommentsById(threadId);
  }
}

module.exports = GetThreadUseCase;
