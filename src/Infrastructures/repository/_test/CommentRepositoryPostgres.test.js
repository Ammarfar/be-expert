const CommentsTableTestHelper = require("../../../../tests/CommentTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const NewComment = require("../../../Domains/comments/entities/NewComment");
const NewThread = require("../../../Domains/threads/entities/NewThread");
const RegisterUser = require("../../../Domains/users/entities/RegisterUser");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const UserRepositoryPostgres = require("../UserRepositoryPostgres");
let thread_id;
let owner;

describe("CommentRepositoryPostgres", () => {
  beforeAll(async () => {
    const registerUser = new RegisterUser({
      username: "dicoding",
      password: "secret_password",
      fullname: "Dicoding Indonesia",
    });
    const fakeIdGenerator = () => "123"; // stub!
    const userRepositoryPostgres = new UserRepositoryPostgres(
      pool,
      fakeIdGenerator
    );

    const registeredUser = await userRepositoryPostgres.addUser(registerUser);
    owner = registeredUser.id;

    const newThread = new NewThread({
      title: "title",
      body: "body",
      owner,
    });

    const threadRepositoryPostgres = new ThreadRepositoryPostgres(
      pool,
      fakeIdGenerator
    );

    const addedThread = await threadRepositoryPostgres.addThread(newThread);
    thread_id = addedThread.id;
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await pool.end();
  });

  describe("addComment function", () => {
    it("should persist new comment and return added comment correctly", async () => {
      // Arrange
      const newComment = new NewComment({
        content: "content",
        thread_id,
        owner,
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentsById(
        "comment-123"
      );
      expect(comment).toHaveLength(1);
    });

    it("should return added comment correctly", async () => {
      // Arrange
      const newComment = new NewComment({
        content: "content",
        thread_id,
        owner,
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        newComment
      );

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-123",
          content: "content",
          thread_id,
          owner,
        })
      );
    });
  });

  describe("destroyById function", () => {
    it("should update is_delete field to true", async () => {
      // Arrange
      const newComment = new NewComment({
        content: "content",
        thread_id,
        owner,
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await commentRepositoryPostgres.addComment(newComment);

      // Action & assert
      await expect(
        commentRepositoryPostgres.destroyById({
          commentId: "comment-123",
          userId: owner,
        })
      ).resolves.not.toThrowError(Error);
    });

    it("should return not authorized", async () => {
      // Arrange
      const newComment = new NewComment({
        content: "content",
        thread_id,
        owner,
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      await commentRepositoryPostgres.addComment(newComment);

      // Action & Assert
      await expect(
        commentRepositoryPostgres.destroyById({
          commentId: "comment-123",
          userId: "asd",
        })
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should return not found", async () => {
      // Arrange
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      await expect(
        commentRepositoryPostgres.destroyById({
          commentId: "comment-123",
          userId: "asd",
        })
      ).rejects.toThrowError(NotFoundError);
    });
  });
});
