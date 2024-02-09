const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentTableTestHelper");
let token;

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

    // Action
    const response = await server.inject({
      method: "PUT",
      url: "/authentications",
      payload: {
        refreshToken,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    token = responseJson.data.accessToken;
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  describe("when POST /threads", () => {
    it("should response 201 and persisted thread", async () => {
      // Arrange
      const requestPayload = {
        title: "title",
        body: "body",
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it("should response 400 when request payload not contain needed property", async () => {
      // Arrange
      const requestPayload = {
        title: "title",
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: "POST",
        url: "/threads",
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada"
      );
    });
  });

  describe("when GET /threads/threadId", () => {
    it("should response 200 and get its comment", async () => {
      // Arrange
      const server = await createServer(container);

      const postResponse = await server.inject({
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
      const postResponseJson = JSON.parse(postResponse.payload);
      const { id } = postResponseJson.data.addedThread;

      await server.inject({
        method: "POST",
        url: `/threads/${id}/comments`,
        payload: {
          content: "content",
        },
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      // Action
      const response = await server.inject({
        method: "GET",
        url: `/threads/${id}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(1);
    });
  });
});
