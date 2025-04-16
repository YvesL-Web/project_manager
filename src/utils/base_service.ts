/**
 * @file base_service.ts
 * @description This file defines a generic `BaseService` class that provides reusable methods for common database operations.
 * It is designed to work with TypeORM repositories and supports CRUD operations, custom queries, and more.
 *
 * @module BaseService
 */

import { Repository, DeepPartial, FindOneOptions } from 'typeorm';

/**
 * @typedef UpdateDataKeys<T>
 * @description A utility type that extracts the keys of an entity that can be updated.
 */
export type UpdateDataKeys<T> = keyof T & keyof DeepPartial<T>;

/**
 * @typedef ApiResponse<T>
 * @description A generic type for API responses, containing status, message, data, and statusCode.
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  statusCode?: number;
}

/**
 * @class BaseService
 * @description A generic service class that provides reusable methods for interacting with the database.
 * It is designed to work with TypeORM repositories and supports CRUD operations, custom queries, and more.
 *
 * @template T - The entity type that the service will operate on.
 */
export class BaseService<T> {
  constructor(private readonly repository: Repository<T>) {}

  /**
   * Creates a new entity using the provided data and saves it to the database.
   * @param {DeepPartial<T>} entity - The data to create the entity with.
   * @returns {Promise<ApiResponse<T>>} - An ApiResponse with the created entity data on success or an error message on failure.
   */
  async create(entity: DeepPartial<T>): Promise<ApiResponse<T>> {
    try {
      const createdEntity = await this.repository.create(entity);
      const savedEntity = await this.repository.save(createdEntity);
      return { statusCode: 201, status: 'success', data: savedEntity };
    } catch (error) {
      if (error.code === '23505') {
        return { statusCode: 409, status: 'error', message: error.detail };
      } else {
        return { statusCode: 500, status: 'error', message: error.message };
      }
    }
  }

  /**
   * Updates an entity with the provided ID using the given update data.
   * @param {string} id - The ID of the entity to be updated.
   * @param {DeepPartial<T>} updateData - The data used to update the entity.
   * @returns {Promise<ApiResponse<T> | undefined>} - An ApiResponse with the updated entity data or an error message.
   */
  async update(id: string, updateData: DeepPartial<T>): Promise<ApiResponse<T> | undefined> {
    try {
      const isExist = await this.findOne(id);
      if (isExist.statusCode === 404) {
        return isExist;
      }

      const where = {};
      const primaryKey: string = this.repository.metadata.primaryColumns[0].databaseName;
      where[primaryKey] = id;

      const validColumns = this.repository.metadata.columns.map((column) => column.propertyName);
      const updateQuery: any = {};
      const keys = Object.keys(updateData) as UpdateDataKeys<T>[];
      for (const key of keys) {
        if (updateData.hasOwnProperty(key) && validColumns.includes(key as string)) {
          updateQuery[key] = updateData[key];
        }
      }

      const result = await this.repository.createQueryBuilder().update().set(updateQuery).where(where).returning('*').execute();

      if (result.affected > 0) {
        return { statusCode: 200, status: 'success', data: result.raw[0] };
      } else {
        return { statusCode: 400, status: 'error', message: 'Invalid Data' };
      }
    } catch (error) {
      return { statusCode: 500, status: 'error', message: error.message };
    }
  }

  /**
   * Finds an entity by its ID.
   * @param {string} id - The ID of the entity to be retrieved.
   * @returns {Promise<ApiResponse<T> | undefined>} - An ApiResponse with the retrieved entity data or an error message.
   */
  async findOne(id: string): Promise<ApiResponse<T> | undefined> {
    try {
      const where = {};
      const primaryKey: string = this.repository.metadata.primaryColumns[0].databaseName;
      where[primaryKey] = id;

      const options: FindOneOptions<T> = { where: where };
      const data = await this.repository.findOne(options);

      if (data) {
        return { statusCode: 200, status: 'success', data: data };
      } else {
        return { statusCode: 404, status: 'error', message: 'Not Found' };
      }
    } catch (error) {
      return { statusCode: 500, status: 'error', message: error.message };
    }
  }

  /**
   * Finds all entities based on the provided query parameters.
   * @param {object} queryParams - The query parameters to filter the entities.
   * @returns {Promise<ApiResponse<T[]>>} - An ApiResponse with an array of retrieved entities or an error message.
   */
  async findAll(queryParams: object): Promise<ApiResponse<T[]>> {
    try {
      let data = [];
      if (Object.keys(queryParams).length > 0) {
        const query = await this.repository.createQueryBuilder();
        for (const field in queryParams) {
          if (queryParams.hasOwnProperty(field)) {
            const value = queryParams[field];
            query.andWhere(`${field} = '${value}'`);
          }
        }
        data = await query.getMany();
      } else {
        data = await this.repository.find();
      }
      return { statusCode: 200, status: 'success', data: data };
    } catch (error) {
      return { statusCode: 500, status: 'error', data: [], message: error.message };
    }
  }

  /**
   * Deletes an entity based on the provided ID.
   * @param {string} id - The ID of the entity to be deleted.
   * @returns {Promise<ApiResponse<T>>} - An ApiResponse indicating success or failure.
   */
  async delete(id: string): Promise<ApiResponse<T>> {
    try {
      const isExist = await this.findOne(id);
      if (isExist.statusCode === 404) {
        return isExist;
      }

      await this.repository.delete(id);
      return { statusCode: 200, status: 'success' };
    } catch (error) {
      return { statusCode: 500, status: 'error', message: error.message };
    }
  }

  /**
   * Retrieves multiple records by their IDs from the database.
   * @param {string[]} ids - An array of IDs used to fetch records.
   * @returns {Promise<ApiResponse<T[]>>} - An ApiResponse containing the retrieved data or an error message.
   */
  async findByIds(ids: string[]): Promise<ApiResponse<T[]>> {
    try {
      const primaryKey: string = this.repository.metadata.primaryColumns[0].databaseName;
      const data = await this.repository.createQueryBuilder().where(`${primaryKey} IN (:...ids)`, { ids: ids }).getMany();
      return { statusCode: 200, status: 'success', data: data };
    } catch (error) {
      return { statusCode: 500, status: 'error', data: [], message: error.message };
    }
  }

  /**
   * Executes a custom query on the database.
   * @param {string} query - The custom query to be executed.
   * @returns {Promise<T[]>} - An array of results from the custom query.
   */
  async customQuery(query: string): Promise<T[]> {
    try {
      const data = await this.repository.createQueryBuilder().where(query).getMany();
      return data;
    } catch (error) {
      console.error(`Error while executing custom query: ${query}`, error);
      return [];
    }
  }
}
