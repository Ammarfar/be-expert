const CommentRepository = require("../../../../Domains/comments/CommentRepository");
const AddedComment = require("../../../../Domains/comments/entities/AddedComment");
const ThreadRepository = require("../../../../Domains/threads/ThreadRepository");
const AddCommentUseCase = require("../AddCommentUseCase");

describe("AddCommentUseCase", () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the add thread action correctly", async () => {
    // Arrange
    const mockUserId = "user-123";
    const mockThreadId = "thread-123";
    const useCasePayload = {
      content: "content",
      thread_id: mockThreadId,
      owner: mockUserId,
    };

    const mockAddedComment = new AddedComment({
      id: "comment-123",
      content: useCasePayload.content,
      thread_id: mockThreadId,
      owner: mockUserId,
    });

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyExistenceById = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const getCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: "comment-123",
        content: useCasePayload.content,
        owner: mockUserId,
      })
    );

    expect(mockThreadRepository.verifyExistenceById).toBeCalledWith(useCasePayload.thread_id);
    expect(mockCommentRepository.addComment).toBeCalledWith(useCasePayload);
  });
});
