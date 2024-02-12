const ThreadsTableTestHelper = require('../../../../tests/ThreadTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
let owner;

describe('ThreadRepositoryPostgres', () => {
  beforeAll(async () => {
    const registerUser = new RegisterUser({
      username: 'dicoding',
      password: 'secret_password',
      fullname: 'Dicoding Indonesia',
    });
    const fakeIdGenerator = () => '123'; // stub!
    const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

    const registeredUser = await userRepositoryPostgres.addUser(registerUser);
    owner = registeredUser.id;
  })

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'title',
        body: 'body',
        owner,
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      await threadRepositoryPostgres.addThread(newThread);

      // Action & Assert
      const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(thread).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'title',
        body: 'body',
        owner,
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        owner,
      }));
    });
  });

  describe('verifyExistenceById function', () => {
    it('should return existing thread', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'title',
        body: 'body',
        owner,
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(newThread);
      // Action & Assert
      await expect(threadRepositoryPostgres.verifyExistenceById('thread-123')).resolves.not.toThrowError(NotFoundError);
    });

    it('should return not found if there is no thread', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyExistenceById('asdasd')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('getById function', () => {
    it('should return existing thread', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'title',
        body: 'body',
        owner,
      });
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(newThread);

      // Action 
      const thread = await threadRepositoryPostgres.getById('thread-123');

      // Assert
      expect(thread).toHaveProperty('id');
      expect(thread.id).toEqual('thread-123');
    });

    it('should return not found if there is no thread', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action & Assert
      await expect(threadRepositoryPostgres.getById('asdasd')).rejects.toThrowError(NotFoundError);
    });
  });
});
