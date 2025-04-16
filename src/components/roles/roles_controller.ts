import { Request, Response } from 'express';
import { BaseController } from '../../utils/base_controller';
import { Rights } from '../../utils/common';
import { RolesService } from './roles_service';

export class RoleController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    const role = req.body;
    const service = new RolesService();
    const result = await service.create(role);
    res.status(result.statusCode).json(result);
    return;
  }
  public getAllHandler(req: Request, res: Response) {}
  public async getOneHandler(req: Request, res: Response) {}
  public getDetailsHandler(req: Request, res: Response) {}
  public async updateHandler(req: Request, res: Response) {}
  public async deleteHandler(req: Request, res: Response) {}
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
}
