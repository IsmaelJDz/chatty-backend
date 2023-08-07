import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ServerError } from '@global/helpers/error-handler';

const log: Logger = config.createLogger('redisConnection');

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async saveUserToCache(
    key: string,
    userId: string,
    createdUser: IUserDocument
  ): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
      avatarColor,
      blocked,
      blockedBy,
      postsCount,
      profilePicture,
      followersCount,
      followingCount,
      notifications,
      work,
      location,
      school,
      quote,
      bgImageId,
      bgImageVersion,
      social
    } = createdUser;
    const dataToSave = {
      _id: `${_id}`,
      uId: `${uId}`,
      username: `${username}`,
      email: `${email}`,
      avatarColor: `${avatarColor}`,
      createdAt: `${createdAt}`,
      postsCount: `${postsCount}`,
      blocked: JSON.stringify(blocked),
      blockedBy: JSON.stringify(blockedBy),
      profilePicture: `${profilePicture}`,
      followersCount: `${followersCount}`,
      followingCount: `${followingCount}`,
      notifications: JSON.stringify(notifications),
      social: JSON.stringify(social),
      work: `${work}`,
      location: `${location}`,
      school: `${school}`,
      quote: `${quote}`,
      bgImageVersion: `${bgImageVersion}`,
      bgImageId: `${bgImageId}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.ZADD('user', { score: parseInt(userId, 10), value: `${key}` });
      await this.client.HSET(`user:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Error saving user to cache');
    }
  }
}
