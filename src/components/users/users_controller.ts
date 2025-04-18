import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { BaseController } from '../../utils/base_controller';
import { UsersService } from './users_service';
import { bcryptCompare, encryptString, SERVER_CONST } from '../../utils/common';
import { hasPermission } from '../../utils/auth_util';
import { RolesUtil } from '../roles/roles_controller';

export class UserController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'add_user')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorised' });
      return;
    }

    try {
      // Create an instance of the UsersService
      const service = new UsersService();

      // Extract user data from the request body
      const user = req.body;

      // Check if the provided role_ids are valid
      const isValidRole = await RolesUtil.checkValidRoleIds(user.role_ids);

      if (!isValidRole) {
        // If role_ids are invalid, send an error response
        res.status(400).json({ statusCode: 400, status: 'error', message: 'Invalid role_ids' });
        return;
      }
      // Convert email and username to lowercase (if present)
      user.email = user.email?.toLowerCase();
      user.username = user.username?.toLowerCase();

      // Encrypt the user's password
      user.password = await encryptString(user.password);

      // If role_ids are valid, create the user
      const createdUser = await service.create(user);
      res.status(createdUser.statusCode).json(createdUser);
    } catch (error) {
      // Handle errors and send an appropriate response
      console.error(`Error while addUser => ${error.message}`);
      res.status(500).json({ statusCode: 500, status: 'error', message: 'Internal server error' });
    }
  }

  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_all_users')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new UsersService();
    const result = await service.findAll(req.query);
    if (result.statusCode === 200) {
      // Remove password field to send in response
      result.data.forEach((i) => delete i.password);
    }
    res.status(result.statusCode).json(result);
    return;
  }
  public async getOneHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_details_user')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new UsersService();
    const result = await service.findOne(req.params.id);
    if (result.statusCode === 200) {
      delete result.data.password;
    }
    res.status(result.statusCode).json(result);
    return;
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'edit_user')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new UsersService();
    const user = req.body;
    // we will not update email and username once inserted so remove it from body
    delete user?.email;
    delete user?.username;
    // we will also not update password from here it will be from changePassword function separate
    delete user?.password;

    const result = await service.update(req.params.id, user);
    if (result.statusCode === 200) {
      delete result.data.password;
    }
    res.status(result.statusCode).json(result);
    return;
  }

  public async deleteHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'delete_user')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new UsersService();
    const result = await service.delete(req.params.id);
    res.status(result.statusCode).json(result);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    const service = new UsersService();
    // Find user by email
    const result = await service.findAll({ email: email });
    if (result.data.length < 1) {
      res.status(404).json({ statusCode: 404, status: 'error', message: 'Email not found' });
      return;
    } else {
      const user = result.data[0];
      // Compare provided password with stored hashed password
      const comparePasswords = await bcryptCompare(password, user.password);
      if (!comparePasswords) {
        res.status(400).json({ statusCode: 400, status: 'error', message: 'Invalid credentials' });
        return;
      }
      // generate access and refresh token
      const accessToken: string = jwt.sign(
        {
          email: user.email,
          username: user.username
        },
        SERVER_CONST.JWTSECRET,
        { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS }
      );
      const refreshToken: string = jwt.sign(
        {
          email: user.email,
          username: user.username
        },
        SERVER_CONST.JWTSECRET,
        { expiresIn: SERVER_CONST.REFRESH_TOKEN_EXPIRY_TIME_SECONDS }
      );

      // send respond with tokens
      res.status(200).json({
        statusCode: 200,
        status: 'success',
        data: {
          accessToken,
          refreshToken
        }
      });
      return;
    }
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    const { oldPassword, newPassword } = req.body;
    const service = new UsersService();
    const findUserResult = await service.findOne(req.params.id);
    if (findUserResult.statusCode !== 200) {
      res.status(404).json({
        statusCode: 404,
        status: 'error',
        message: 'User Not Found'
      });
      return;
    }
    const user = findUserResult.data;
    // check requested user_id and session user_id is same
    if (user?.username !== req.user.username) {
      res.status(401).json({ statusCode: 401, status: 'error', message: 'You are not authorized to do that.' });
      return;
    }
    // verify old password is valid
    const comparePasswords = await bcryptCompare(oldPassword, user.password);
    if (!comparePasswords) {
      res.status(400).json({ statusCode: 400, status: 'error', message: 'Incorrect old password.' });
      return;
    }
    // Encrypt the user's new password
    user.password = await encryptString(newPassword);
    const result = await service.update(req.params.id, user);
    if (result.statusCode === 200) {
      res.status(200).json({ statusCode: 200, status: 'success', message: 'Password updated successfully' });
      return;
    } else {
      res.status(result.statusCode).json(result);
      return;
    }
  }

  public async getAccessTokenFromRefreshToken(req: Request, res: Response): Promise<void> {
    // Get the refresh token from the request body
    const refreshToken = req.body.refreshToken;
    // Verify the refresh token
    jwt.verify(refreshToken, SERVER_CONST.JWTSECRET, (err, user) => {
      if (err) {
        // If refresh token is invalid, send a 403 error response
        res.status(403).json({ statusCode: 403, status: 'error', message: 'Invalid Refresh Token' });
        return;
      }
      // Generate a new access token using user information from the refresh token
      const accessToken = jwt.sign(user, SERVER_CONST.JWTSECRET, { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS });

      res.status(200).json({ statusCode: 200, status: 'success', data: { accessToken } });
      return;
    });
  }
}

export class UsersUtil {
  public static async getUserFromUsername(username: string) {
    try {
      if (username) {
        const service = new UsersService();
        const users = await service.customQuery(`username='${username}'`);
        if (users && users.length > 0) {
          return users[0];
        }
      }
    } catch (error) {
      console.error(`Error while getUserFromToken() => ${error.message}`);
    }
    return null;
  }
}
