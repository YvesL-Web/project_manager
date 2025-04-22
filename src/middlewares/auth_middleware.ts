import * as jwt from 'jsonwebtoken';
import { SERVER_CONST } from '../utils/common';
import { NextFunction, Request, Response } from 'express';
import { Users } from '../components/users/users_entity';
import { UsersUtil } from '../components/users/users_util';
import { RolesUtil } from '../components/roles/roles_util';

declare global {
  namespace Express {
    /**
     * Extends the Express `Request` interface to include a `user` property.
     */
    interface Request {
      /**
       * Custom `user` property to store user-related information.
       * This property is optional and may not always be present on the request object.
       */
      user?: {
        /**
         * The username of the authenticated user.
         * @type {string | undefined}
         */
        username?: string;

        /**
         * The email address of the authenticated user.
         * @type {string | undefined}
         */
        email?: string;

        /**
         * An array of rights or permissions assigned to the user.
         * @type {string[] | undefined}
         */
        rights?: string[];

        /**
         * The unique identifier of the authenticated user.
         * @type {string | undefined}
         */
        user_id?: string;
      };
    }
  }
}

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
  // Get the access token from the request headers
  const access_token = req.cookies?.access_token;
  const refresh_token = req.cookies?.refresh_token;

  if (!access_token && !refresh_token) {
    res.status(401).json({ statusCode: 401, status: 'error', message: 'Missing Authorization Tokens' });
    return;
  }

  try {
    // Verify the access token
    const decodedToken = jwt.verify(access_token, SERVER_CONST.JWTSECRET);
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
    console.error('Access token invalid or expired:', error.message);
    // Si l'access_token est invalide ou expiré, vérifier le refresh_token
    if (!refresh_token) {
      res.status(401).json({ statusCode: 401, status: 'error', message: 'Access token expired and no refresh token provided' });
      return;
    }

    try {
      // Vérifier le refresh_token
      const decodedRefreshToken = jwt.verify(refresh_token, SERVER_CONST.JWTSECRET);
      // Générer un nouveau access_token
      const newAccessToken = jwt.sign(
        {
          user_id: decodedRefreshToken['user_id'],
          username: decodedRefreshToken['username'],
          email: decodedRefreshToken['email']
        },
        SERVER_CONST.JWTSECRET,
        { expiresIn: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS } // 1 heure
        // Mettre à jour le cookie avec le nouveau access_token
      );
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SERVER_CONST.ACCESS_TOKEN_EXPIRY_TIME_SECONDS
      });
      // Ajouter les informations utilisateur à req.user
      req.user = {
        user_id: decodedRefreshToken['user_id'],
        username: decodedRefreshToken['username'],
        email: decodedRefreshToken['email']
      };
      // Charger les droits de l'utilisateur
      if (req.user.username) {
        const user: Users = await UsersUtil.getUserFromUsername(req.user.username);
        const rights = await RolesUtil.getAllRightsFromRoles([user.role_id]);
        req.user.rights = rights;
      }
      next();
      return;
    } catch (error) {
      console.error('Refresh token invalid or expired:', error.message);
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Invalid or expired refresh token' });
      return;
    }
  }
};
