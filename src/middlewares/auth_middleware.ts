import * as jwt from 'jsonwebtoken';
import { SERVER_CONST } from '../utils/common';
import { UsersUtil } from '../components/users/users_controller';
import { RolesUtil } from '../components/roles/roles_controller';
import { NextFunction, Request, Response } from 'express';
import { Users } from '../components/users/users_entity';

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
  // Get the access token from the request headers
  const token = req.headers?.authorization ? (req.headers?.authorization?.split('Bearer ')[1] as string) : null;
  if (!token) {
    res.status(401).json({ statusCode: 401, status: 'error', message: 'Missing Authorization Token' });
    return;
  }

  try {
    // Verify the access token
    const decodedToken = jwt.verify(token, SERVER_CONST.JWTSECRET);
    req.user = {};
    req.user.user_id = decodedToken['user_id'] ?? '';
    req.user.username = decodedToken['username'] ?? '';
    req.user.email = decodedToken['email'] ?? '';

    if (req.user.username) {
      const user: Users = await UsersUtil.getUserFromUsername(req.user.username);
      const rights = await RolesUtil.getAllRightsFromRoles([user.role_id]);
      req.user.rights = rights;
    }
    next();
    return;
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ statusCode: 401, status: 'error', message: 'Invalid Token' });
    return;
  }
};
