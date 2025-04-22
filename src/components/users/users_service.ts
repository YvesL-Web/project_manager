/**
 * @file users_service.ts
 * @description This file defines the `UsersService` class, which extends the `BaseService` class to provide database operations for the `Users` entity.
 * It uses TypeORM to interact with the database and provides a repository for the `Users` entity.
 */

import { Repository } from 'typeorm';
import { BaseService } from '../../utils/base_service';
import { DatabaseUtil } from '../../utils/db';
import { Users } from './users_entity';

/**
 * @class UsersService
 * @extends BaseService<Users>
 * @description This service class provides methods to interact with the `Users` entity in the database.
 * It extends the generic `BaseService` class, which provides common CRUD operations.
 */
export class UsersService extends BaseService<Users> {
  /**
   * @constructor
   * @description Initializes the `UsersService` by creating a repository for the `Users` entity using `DatabaseUtil`.
   */
  constructor() {
    let userRepository: Repository<Users> | null = null;

    // Get the repository for the Users entity
    userRepository = new DatabaseUtil().getRepository(Users);

    // Pass the repository to the BaseService constructor
    super(userRepository);
  }
}
