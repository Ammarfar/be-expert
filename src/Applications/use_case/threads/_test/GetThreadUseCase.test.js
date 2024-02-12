const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const GetThreadUseCase = require("../GetThreadUseCase");

describe("AddUserUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the get thread action correctly", async () => {
    // Arrange
    const threadId = "thread-123";

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    const mockThreadRepositoryResult = {
      thread: {
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2021-08-08T07:19:09.775Z",
        username: "dicoding",
        comments: [
          {
            id: "comment-_pby2_tmXV6bcvcdev8xk",
            username: "johndoe",
            date: "2021-08-08T07:22:33.555Z",
            is_delete: false,
            content: "sebuah comment",
          },
          {
            id: "comment-yksuCoxM2s4MMrZJO-qVD",
            username: "dicoding",
            date: "2021-08-08T07:26:21.338Z",
            is_delete: true,
            content: "sebuah comment lainnya",
          },
        ],
      },
    }
    mockThreadRepository.getWithCommentsById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockThreadRepositoryResult));

    /** creating use case instance */
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const thread = await getThreadUseCase.execute(threadId);

    // Assert
    expect(thread).toStrictEqual({
      thread: {
        id: "thread-123",
        title: "sebuah thread",
        body: "sebuah body thread",
        date: "2021-08-08T07:19:09.775Z",
        username: "dicoding",
        comments: [
          {
            id: "comment-_pby2_tmXV6bcvcdev8xk",
            username: "johndoe",
            date: "2021-08-08T07:22:33.555Z",
            content: "sebuah comment",
          },
          {
            id: "comment-yksuCoxM2s4MMrZJO-qVD",
            username: "dicoding",
            date: "2021-08-08T07:26:21.338Z",
            content: "**komentar telah dihapus**",
          },
        ],
      },
    });
    expect(mockThreadRepository.getWithCommentsById).toBeCalledWith(threadId);
  });
});
