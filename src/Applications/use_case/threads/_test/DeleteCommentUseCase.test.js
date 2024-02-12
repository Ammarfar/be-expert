const AuthorizationError = require("../../../../Commons/exceptions/AuthorizationError");
const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const DeleteCommentUseCase = require("../DeleteCommentUseCase");

describe("DeleteCommentUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the delete comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-123",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyExistenceById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getById = jest
      .fn()
      .mockImplementation(() => Promise.resolve({
        id: "comment-123",
        owner: "user-123",
      }));
    mockCommentRepository.destroyById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(getCommentUseCase.execute(useCasePayload)).resolves.not.toThrowError(Error);
    expect(mockThreadRepository.verifyExistenceById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getById).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.destroyById).toBeCalledWith(useCasePayload.commentId);
  });

  it("should return unauthorized", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
      commentId: "comment-123",
      userId: "user-122",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyExistenceById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.getById = jest
      .fn()
      .mockImplementation(() => Promise.resolve({
        id: "comment-123",
        owner: "user-123",
      }));
    mockCommentRepository.destroyById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(getCommentUseCase.execute(useCasePayload)).rejects.toThrowError(AuthorizationError);
  });
});
