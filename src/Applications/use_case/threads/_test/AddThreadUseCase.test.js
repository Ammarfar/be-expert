const AuthenticationRepository = require("../../../../Domains/authentications/AuthenticationRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const AddedThread = require("../../../../Domains/threads/entities/AddedThread");
const NewThread = require("../../../../Domains/threads/entities/NewThread");
const AuthenticationTokenManager = require("../../../security/AuthenticationTokenManager");
const AddTheadUseCase = require("../AddThreadUseCase");

describe("AddUserUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      title: "title",
      body: "body",
    };

    const userId = "user-123";

    const mockAddedThread = new AddedThread({
      id: "thread-123",
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: userId,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedThread));

    /** creating use case instance */
    const getThreadUseCase = new AddTheadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await getThreadUseCase.execute(useCasePayload, userId);

    // Assert
    expect(addedThread).toStrictEqual(
      new AddedThread({
        id: "thread-123",
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: userId,
      })
    );

    expect(mockThreadRepository.addThread).toBeCalledWith(
      new NewThread({
        title: "title",
        body: "body",
        owner: userId,
      })
    );
  });
});
