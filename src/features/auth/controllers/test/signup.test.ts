import { Request, Response } from 'express';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { SignUp } from '@auth/controllers/signup';
import { CustomError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { UserCache } from '@service/redis/user.cache';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');

// first argument is session, in this case is not necessary
// body is the second argument === user data

describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'ismaelbr87@gmail.com',
        password: '12345677',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'
      }
    ) as Request;
    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username is less than minimum length', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ma',
        email: 'ismaelbr87@gmail.com',
        password: '12345677',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'
      }
    ) as Request;
    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if email is not valid', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ismael',
        email: 'ismaelbr87@gmail',
        password: '12345677',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'
      }
    ) as Request;
    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if email is not available', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ismael',
        email: '',
        password: '12345677',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'
      }
    ) as Request;
    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('should throw an unauthorized error if user already exist', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'danny',
        password: '12345678',
        email: 'ismaebr87@gmail.com',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'
      }
    ) as Request;
    const res: Response = authMockResponse() as Response;

    jest.spyOn(authService, 'getUserByUserNameOrEmail').mockResolvedValue(authMock);
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('User already exist. Try again.');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'danny',
        password: '12345678',
        email: 'ismaebr87@gmail.com',
        avatarColor: 'red',
        avatarImage: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D'
      }
    ) as Request;
    const res: Response = authMockResponse() as Response;

    jest.spyOn(authService, 'getUserByUserNameOrEmail').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest
      .spyOn(cloudinaryUploads, 'uploads')
      .mockImplementation((): any => Promise.resolve({ version: '123', public_id: '123' }));

    await SignUp.prototype.create(req, res);

    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt
    });
  });
});
