import { Rights } from '../../utils/common';
import { Roles } from './roles_entity';
import { RolesService } from './roles_service';

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
