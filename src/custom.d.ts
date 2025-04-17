/**
 * @file custom.d.ts
 * @description This file extends the TypeScript definitions for the Express `Request` object.
 * It adds a custom `user` property to the `Request` interface, which can be used to store user-related information
 * such as `username`, `email`, `rights`, and `user_id`.
 *
 * This is particularly useful in middleware or route handlers where user data is attached to the request object
 * after authentication or authorization processes.
 */

declare namespace Express {
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
