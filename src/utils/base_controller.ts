/**
 * @file base_controller.ts
 * @description This file defines an abstract class `BaseController` that serves as a blueprint for other controller classes.
 * It enforces a consistent structure for handling CRUD operations across different controllers in the application.
 *
 * @module BaseController
 */

import { Request, Response } from 'express';

/**
 * @abstract
 * @class BaseController
 * @description Abstract class that defines the structure for controller classes.
 * Any class extending `BaseController` must implement the following abstract methods:
 * - `addHandler`
 * - `getAllHandler`
 * - `getOneHandler`
 * - `updateHandler`
 * - `deleteHandler`
 *
 * This ensures that all controllers maintain consistent method names and parameters,
 * while allowing flexibility in their specific implementations.
 */
export abstract class BaseController {
  /**
   * Handles the creation of a new resource.
   * @abstract
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  public abstract addHandler(req: Request, res: Response): void;

  /**
   * Handles fetching all resources.
   * @abstract
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  public abstract getAllHandler(req: Request, res: Response): void;

  /**
   * Handles fetching a single resource by its identifier.
   * @abstract
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  public abstract getOneHandler(req: Request, res: Response): void;

  /**
   * Handles updating an existing resource.
   * @abstract
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  public abstract updateHandler(req: Request, res: Response): void;

  /**
   * Handles deleting a resource.
   * @abstract
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  public abstract deleteHandler(req: Request, res: Response): void;
}
