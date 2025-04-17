import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { BaseController } from '../../utils/base_controller';
import { UsersService } from './users_service';
import { bcryptCompare, SERVER_CONST } from '../../utils/common';
import { hasPermission } from '../../utils/auth_util';

export class UserController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'add_user')) {
      res.status(403).json({
        statusCode: 403,
        status: 'error',
        message: 'Unauthorized'
      });
      return;
    }
  }
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_all_users')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
  }
  public async getOneHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_details_user')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'edit_user')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
  }
  public async deleteHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'delete_user')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
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
