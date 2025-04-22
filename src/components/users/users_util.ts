/**
 * @file users_util.ts
 * @description Utility class for user-related operations. This file provides static methods to interact with the `UsersService`
 * and perform common operations such as retrieving users by username or email, validating user IDs, and fetching usernames by ID.
 */

import { UsersService } from './users_service';

/**
 * @class UsersUtil
 * @description A utility class that provides static methods for user-related operations.
 * It interacts with the `UsersService` to perform database queries and validations.
 */
export class UsersUtil {
  /**
   * @method getUserFromUsername
   * @description Retrieves a user by their username.
   * @param {string} username - The username of the user to retrieve.
   * @returns {Promise<any | null>} - Returns the user object if found, otherwise `null`.
   */
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
      console.error(`Error while getUserFromUsername() => ${error.message}`);
    }
    return null;
  }

  /**
   * @method getUserByEmail
   * @description Retrieves a user by their email address.
   * @param {string} email - The email address of the user to retrieve.
   * @returns {Promise<any | null>} - Returns the user object if found, otherwise `null`.
   */
  public static async getUserByEmail(email: string) {
    try {
      if (email) {
        const service = new UsersService();
        const users = await service.customQuery(`email='${email}'`);
        if (users && users.length > 0) {
          return users[0];
        }
      }
    } catch (error) {
      console.error(`Error while getUserByEmail() => ${error.message}`);
    }
    return null;
  }

  /**
   * @method checkValidUserIds
   * @description Validates whether all provided user IDs exist in the database.
   * @param {string[]} user_ids - An array of user IDs to validate.
   * @returns {Promise<boolean>} - Returns `true` if all user IDs are valid, otherwise `false`.
   */
  public static async checkValidUserIds(user_ids: string[]) {
    const service = new UsersService();
    const users = await service.findByIds(user_ids);
    return users.data.length === user_ids.length;
  }

  /**
   * @method getUsernamesById
   * @description Retrieves usernames and user IDs for a list of user IDs.
   * @param {string[]} user_ids - An array of user IDs.
   * @returns {Promise<{ username: string; user_id: string }[]>} - Returns an array of objects containing `username` and `user_id`.
   */
  public static async getUsernamesById(user_ids: string[]) {
    const service = new UsersService();
    const queryResult = await service.findByIds(user_ids);
    if (queryResult.statusCode === 200) {
      const users = queryResult.data;
      const usernames = users.map((i) => {
        return { username: i.username, user_id: i.user_id };
      });
      return usernames;
    }
    return [];
  }
}
