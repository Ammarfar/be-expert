const NewThread = require("../../../Domains/threads/entities/NewThread");

class AddTheadUseCase {
  constructor({
    threadRepository,
  }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, owner) {
    const newThread = new NewThread({ ...useCasePayload, owner });
    const addedThread = await this._threadRepository.addThread(newThread);
    return addedThread;
  }
}

module.exports = AddTheadUseCase;
