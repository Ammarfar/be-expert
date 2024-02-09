const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentTableTestHelper");
let token;
let threadId;

describe("/threads endpoint", () => {
  beforeAll(async () => {
    const server = await createServer(container);

    // add user
    await server.inject({
      method: "POST",
      url: "/users",
      payload: {
        username: "dicoding",
        password: "secret",
        fullname: "Dicoding Indonesia",
      },
    });

    // login user
    const loginResponse = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: {
        username: "dicoding",
        password: "secret",
      },
    });
    const {
      data: { refreshToken },
    } = JSON.parse(loginResponse.payload);

    // login
    const response = await server.inject({
      method: "PUT",
      url: "/authentications",
      payload: {
        refreshToken,
      },
    });

    const responseJson = JSON.parse(response.payload);
    token = responseJson.data.accessToken;

    // create tread
    const thread = await server.inject({
      method: "POST",
      url: "/threads",
      payload: {
        title: "title",
        body: "body",
      },
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const threadJson = JSON.parse(thread.payload);
    threadId = threadJson.data.addedThread.id;
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  describe("when POST /comments", () => {
    it("should response 201 and persisted comment", async () => {
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: {
          content: "content",
        },
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it("should response 200 and delete comment", async () => {
      const server = await createServer(container);

      // Arrange
      const postResponse = await server.inject({
        method: "POST",
        url: `/threads/${threadId}/comments`,
        payload: {
          content: "content",
        },
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
      const postResponseJson = JSON.parse(postResponse.payload);
      const commentId = postResponseJson.data.addedComment.id;

      // action
      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(responseJson.status).toEqual("success");
    });
  });
});
