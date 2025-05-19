/**
 * @file cache_util.ts
 * @description Utility class for managing caching operations using Redis. This file provides static methods to interact with a Redis cache,
 * including retrieving, setting, and removing cached data.
 */

import * as redis from 'redis';

/**
 * @class CacheUtil
 * @description A utility class for interacting with a Redis cache. It provides static methods for common caching operations such as
 * retrieving, setting, and deleting cached data.
 */
export class CacheUtil {
  /**
   * @property {redis.RedisClientType} client
   * @description A static Redis client instance used for interacting with the Redis server.
   */
  private static client: redis.RedisClientType;

  /**
   * @constructor
   * @description Initializes the Redis client. This constructor is called when the class is instantiated.
   */
  constructor() {
    CacheUtil.client = redis.createClient({
      url: 'redis://127.0.0.1:6379',
      database: 1
    });
    // Handle connection events
    CacheUtil.client.on('connect', () => {
      console.log('Connected to Redis (db1)');
    });
    CacheUtil.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
    // Connect the client
    CacheUtil.client.connect();
  }

  /**
   * @method get
   * @description Retrieves a value from the cache based on the provided cache name and key.
   * @param {string} cacheName - The name of the cache (used as a namespace).
   * @param {string} key - The key of the cached value to retrieve.
   * @returns {Promise<any | null>} - Returns the cached value if found, otherwise `null`.
   * @example
   * const data = await CacheUtil.get('users', 'user123');
   * console.log(data); // Output: Cached data for user123
   */
  public static async get(cacheName: string, key: string) {
    try {
      const data = await CacheUtil.client.get(`${cacheName}:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting cache: ${error}`);
      return null;
    }
  }

  /**
   * @method set
   * @description Stores a value in the cache with the specified cache name and key.
   * @param {string} cacheName - The name of the cache (used as a namespace).
   * @param {string} key - The key to associate with the cached value.
   * @param {any} value - The value to store in the cache.
   * @returns {Promise<void>}
   * @example
   * await CacheUtil.set('users', 'user123', { name: 'John Doe', age: 30 });
   */
  public static async set(cacheName: string, key: string, value: any) {
    try {
      await CacheUtil.client.set(`${cacheName}:${key}`, JSON.stringify(value));
    } catch (err) {
      console.error(`Error setting cache: ${err}`);
    }
  }

  /**
   * @method remove
   * @description Removes a value from the cache based on the provided cache name and key.
   * @param {string} cacheName - The name of the cache (used as a namespace).
   * @param {string} key - The key of the cached value to remove.
   * @returns {Promise<void>}
   * @example
   * await CacheUtil.remove('users', 'user123');
   */
  public static async remove(cacheName: string, key: string) {
    try {
      await CacheUtil.client.del(`${cacheName}:${key}`);
    } catch (err) {
      console.error(`Error deleting cache: ${err}`);
    }
  }
}
