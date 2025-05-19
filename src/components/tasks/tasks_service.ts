/**
 * @file tasks_service.ts
 * @description This file defines the `TasksService` class, which extends the `BaseService` class to provide database operations for the `Tasks` entity.
 * It uses TypeORM to interact with the database and provides methods for querying tasks with advanced filtering and relationships.
 */

import { Repository } from 'typeorm';
import { ApiResponse, BaseService } from '../../utils/base_service';
import { DatabaseUtil } from '../../utils/db';
import { Tasks } from './tasks_entity';

/**
 * @class TasksService
 * @extends BaseService<Tasks>
 * @description Service class for managing tasks. It provides methods to interact with the `Tasks` entity in the database.
 * This class overrides the `findAll` method from the `BaseService` class to include advanced filtering and relationships.
 */
export class TasksService extends BaseService<Tasks> {
  private taskRepository: Repository<Tasks> | null = null;

  /**
   * @constructor
   * @description Initializes the `TasksService` by creating a repository for the `Tasks` entity using `DatabaseUtil`.
   */
  constructor() {
    let taskRepository: Repository<Tasks> | null = null;
    taskRepository = new DatabaseUtil().getRepository(Tasks);
    super(taskRepository);
    this.taskRepository = taskRepository;
  }

  /**
   * @method findAll
   * @override
   * @description Retrieves all tasks from the database with optional filtering based on query parameters.
   * This method joins the `Tasks` entity with related `Projects` and `Users` entities to include additional details.
   *
   * @param {object} queryParams - An object containing optional search parameters for filtering tasks.
   * @returns {Promise<ApiResponse<Tasks[]>>} - Returns a list of tasks along with their associated project and user details.
   *
   * ### Query Parameters:
   * - `username`: Filters tasks by the username of the assigned user (case-insensitive).
   * - `projectname`: Filters tasks by the project name (case-insensitive).
   * - `project_id`: Filters tasks by the project ID.
   *
   * ### Example Response:
   * ```json
   * {
   *   "statusCode": 200,
   *   "status": "success",
   *   "data": [
   *     {
   *       "task_id": "1",
   *       "name": "Task 1",
   *       "projectDetails": {
   *         "project_id": "101",
   *         "name": "Project A"
   *       },
   *       "userDetails": {
   *         "user_id": "201",
   *         "username": "john_doe",
   *         "email": "john.doe@example.com"
   *       }
   *     }
   *   ]
   * }
   * ```
   */
  override async findAll(queryParams: object): Promise<ApiResponse<Tasks[]>> {
    const queryBuilder = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.project_id', 'project')
      .leftJoin('task.user_id', 'user')
      .addSelect(['task.*', 'task.project_id as project', 'project.project_id', 'project.name', 'user.user_id', 'user.username', 'user.email']);

    // Build the WHERE clause conditionally based on the search parameters
    if (queryParams['username']) {
      queryBuilder.andWhere('user.username ILIKE :username', {
        username: `%${queryParams['username']}%`
      });
    }
    if (queryParams['projectname']) {
      queryBuilder.andWhere('project.name ILIKE :projectName', {
        projectName: `%${queryParams['projectname']}%`
      });
    }
    if (queryParams['project_id']) {
      queryBuilder.andWhere('task.project_id = :projectId', {
        projectId: queryParams['project_id']
      });
    }

    // Execute the query and process the results
    const data = await queryBuilder.getMany();
    data.forEach((item) => {
      item['projectDetails'] = item.project_id;
      item['userDetails'] = item.user_id;
      delete item.project_id;
      delete item.user_id;
    });

    return { statusCode: 200, status: 'success', data: data };
  }

  override async findOne(id: string): Promise<ApiResponse<Tasks>> {
    try {
      // Build the WHERE condition based on the primary key
      const where = {};
      const primaryKey: string = this.taskRepository.metadata.primaryColumns[0].databaseName;
      where[primaryKey] = id;
      // Use the repository to find the entity based on the provided ID
      const data = await this.taskRepository
        .createQueryBuilder('task')
        .leftJoin('task.project_id', 'project')
        .leftJoin('task.user_id', 'user')
        .addSelect(['task.*', 'task.project_id as project', 'project.project_id', 'project.name', 'user.user_id', 'user.username', 'user.email'])
        .where(where)
        .getOne();
      if (data) {
        data['projectDetails'] = data.project_id;
        data['userDetails'] = data.user_id;
        delete data.project_id;
        delete data.user_id;
        return { statusCode: 200, status: 'success', data: data };
      } else {
        return { statusCode: 404, status: 'error', message: 'Not Found' };
      }
    } catch (error) {
      return { statusCode: 500, status: 'error', message: error.message };
    }
  }
}
