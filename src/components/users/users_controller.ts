import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { BaseController } from '../../utils/base_controller';
import { UsersService } from './users_service';
import { bcryptCompare, encryptString, SERVER_CONST } from '../../utils/common';
import { hasPermission } from '../../utils/auth_util';
import { Users } from './users_entity';
import * as config from '../../../server_config.json';
import { IServerConfig } from '../../utils/config';
import { sendPasswordResetEmail } from '../../mailtrap/emails';
import { UsersUtil } from './users_util';
import { RolesUtil } from '../roles/roles_util';
import { CacheUtil } from '../../utils/cache_util';

const conf: IServerConfig = config;

export class UserController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'add_user')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
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

      // Convert role_ids to role_id
      user.role_id = user.role_ids[0]; // Use the first role_id
      delete user.role_ids; // Remove role_ids from the user object

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
    // check if user is in cache
    const userFromCache = await CacheUtil.get('User', req.params.id);
    if (userFromCache) {
      res.status(200).json({ statusCode: 200, status: 'success', data: userFromCache });
      return;
    } else {
      const service = new UsersService();
      const result = await service.findOne(req.params.id);
      if (result.statusCode === 200) {
        delete result.data.password;
        // set user in cache
        CacheUtil.set('User', req.params.id, result.data);
      }
      res.status(result.statusCode).json(result);
      return;
    }
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
    // remove user from cache
    CacheUtil.remove('User', req.params.id);
    res.status(result.statusCode).json(result);
  }

  public async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await UsersUtil.getUserByEmail(email);
      if (!user || !(await bcryptCompare(password, user.password))) {
        res.status(401).json({ statusCode: 401, status: 'error', message: 'Invalid credentials' });
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
      // Store access token in HTTP-only cookie
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS
      });
      // Store refresh token in HTTP-only cookie
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SERVER_CONST.REFRESH_TOKEN_EXPIRY_TIME_SECONDS
      });
      // Send access token in the response
      res.status(200).json({
        statusCode: 200,
        status: 'success'
      });
      return;
    } catch (error) {
      console.error(`Error during login => ${error.message}`);
      res.status(500).json({ statusCode: 500, status: 'error', message: 'Internal Server Error' });
      return;
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(200).json({ statusCode: 200, status: 'success', message: 'Logged out successfully' });
    return;
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

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const user: Users = await UsersUtil.getUserByEmail(email);
    if (!user) {
      res.status(404).send({ statusCode: 404, status: 'error', message: 'User Not Found' });
      return;
    }
    // Generate a reset token for the user
    const resetToken: string = jwt.sign({ email: user.email }, SERVER_CONST.JWTSECRET, { expiresIn: '1h' });
    // Generate the reset link
    const resetLink = `${conf.front_app_url}/reset-password?token=${resetToken}`;
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
    // send password reset request email
    const emailStatus = await sendPasswordResetEmail(user.username, user.email, resetLink);
    if (emailStatus) {
      res.status(200).json({ statusCode: 200, status: 'success', message: 'Reset Link sent on your mailId' });
    } else {
      res.status(400).json({ statusCode: 400, status: 'error', message: 'something went wrong try again' });
    }
    return;
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { newPassword, token } = req.body;
    const service = new UsersService();
    try {
      // Décoder et vérifier le token
      const decoded = jwt.verify(token, SERVER_CONST.JWTSECRET);
      const email = decoded['email'];
      if (!email) {
        throw new Error('Invalid Reset Token');
      }
      // Récupérer l'utilisateur par email
      const user = await UsersUtil.getUserByEmail(email);
      if (!user) {
        res.status(404).json({ statusCode: 404, status: 'error', message: 'User not found' });
        return;
      }
      // Mettre à jour le mot de passe de l'utilisateur
      user.password = await encryptString(newPassword);
      const result = await service.update(user.user_id, user);

      if (result.statusCode === 200) {
        res.status(200).json({ statusCode: 200, status: 'success', message: 'Password updated successfully' });
        return;
      }
      res.status(result.statusCode).json(result);
      return;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(400).json({ statusCode: 400, status: 'error', message: 'Reset Token is invalid or expired' });
        return;
      }
      console.error(`Error while resetPassword => ${error.message}`);
      res.status(500).json({ statusCode: 500, status: 'error', message: 'Internal Server error' });
      return;
    }
  }

  public async getAccessTokenFromRefreshToken(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      res.status(401).json({ statusCode: 401, status: 'error', message: 'Missing Refresh Token' });
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, SERVER_CONST.JWTSECRET);
      const accessToken = jwt.sign({ user_id: decoded['user_id'], username: decoded['username'], email: decoded['email'] }, SERVER_CONST.JWTSECRET, {
        expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS
      });

      res.status(200).json({
        statusCode: 200,
        status: 'success',
        data: { accessToken }
      });
      return;
    } catch (error) {
      console.error(`Error while refreshing access token => ${error.message}`);
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Invalid or Expired Refresh Token' });
      return;
    }
  }
}
