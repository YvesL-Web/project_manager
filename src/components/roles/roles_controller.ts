import { Request, Response } from 'express';
import { BaseController } from '../../utils/base_controller';
import { Rights } from '../../utils/common';
import { RolesService } from './roles_service';
import { Roles } from './roles_entity';
import { hasPermission } from '../../utils/auth_util';

export class RoleController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'add_role')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const role = req.body;
    const service = new RolesService();
    const result = await service.create(role);
    res.status(result.statusCode).json(result);
    return;
  }
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_all_roles')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new RolesService();
    const result = await service.findAll(req.query);
    res.status(result.statusCode).json(result);
  }
  public async getOneHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_details_role')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new RolesService();
    const result = await service.findOne(req.params.id);
    res.status(result.statusCode).json(result);
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'edit_role')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const role = req.body;
    const service = new RolesService();
    const result = await service.update(req.params.id, role);
    res.status(result.statusCode).json(result);
  }
  public async deleteHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'delete_role')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new RolesService();
    const result = await service.delete(req.params.id);
    res.status(result.statusCode).json(result);
  }
}

export class RolesUtil {
  /**
   * Retrieves all possible permissions from the defined rights in the Rights object.
   * @returns {string[]} An array of permissions
   */
  public static getAllPermissionsFromRights(): string[] {
    // Initialize an empty array to collect values;
    let permissions = [];

    // Iterate through each section of the Rights object
    for (const module in Rights) {
      // Check if rights for ALL are defined for the current module
      if (Rights[module]['ALL']) {
        let sectionValues = Rights[module]['ALL'];
        sectionValues = sectionValues.split(',');
        permissions = [...permissions, ...sectionValues];
      }
    }
    // Return the collected permissions
    return permissions;
  }

  public static async checkValidRoleIds(role_ids: string[]) {
    const roleService = new RolesService();
    // Query the database to check if all role_ids are valid
    const roles = await roleService.findByIds(role_ids);
    // Check if all role_ids are found in the database
    return roles.data.length === role_ids.length;
  }

  /**
   * Retrieves all unique rights associated with the provided role IDs.
   *
   * @async
   * @function getAllRightsFromRoles
   * @param {string[]} role_ids - An array of role IDs for which the rights need to be retrieved.
   * @returns {Promise<string[]>} - A promise that resolves to an array of unique rights associated with the roles.
   *
   * @description
   * This method takes an array of role IDs, queries the database to fetch the corresponding roles,
   * and extracts the rights associated with each role. The rights are returned as a unique array of strings.
   *
   * ### Workflow:
   * 1. **Service Initialization**: Creates an instance of `RolesService` to interact with the database.
   * 2. **Database Query**: Uses `findByIds` to fetch roles corresponding to the provided `role_ids`.
   * 3. **Rights Extraction**: Iterates through the fetched roles, splits the `rights` field (comma-separated string) into an array,
   *    and accumulates all rights into a single array.
   * 4. **Deduplication**: Ensures that the returned array contains only unique rights using `Set`.
   *
   * ### Use Case:
   * This method is useful for scenarios where you need to determine the cumulative permissions or rights
   * granted to a user based on their assigned roles.
   *
   * ### Example:
   * ```typescript
   * const roleIds = ['role1', 'role2'];
   * const rights = await RolesUtil.getAllRightsFromRoles(roleIds);
   * console.log(rights); // Output: ['read', 'write', 'delete']
   * ```
   */
  public static async getAllRightsFromRoles(role_ids: string[]): Promise<string[]> {
    // Create an instance of RolesService to interact with the roles
    const roleService = new RolesService();

    // Initialize an array to store the collected rights
    let rights: string[] = [];

    // Query the database to validate the provided role_ids
    const queryData = await roleService.findByIds(role_ids);
    const roles: Roles[] = queryData.data ? queryData.data : [];

    // Extract rights from each role and add them to the rights array
    roles.forEach((role) => {
      const rightFromRole: string[] = role?.rights?.split(',');
      rights = [...new Set(rights.concat(rightFromRole))];
    });

    // Return the accumulated rights
    return rights;
  }
}
