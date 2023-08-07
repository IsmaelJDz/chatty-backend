import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { UserModel } from '@user/models/user.schema';
// import { UserModel } from '@auth/schemes/user.schema';

class UserService {
  public async addUserData(data: IAuthDocument): Promise<void> {
    await UserModel.create(data);
  }
}

export const userService: UserService = new UserService();
