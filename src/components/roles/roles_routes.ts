import { Express } from 'express';
import { RoleController } from './roles_controller';
import { validate } from '../../middlewares/validator';
import { body, param } from 'express-validator';
import { authorize } from '../../middlewares/auth_middleware';
import { RolesUtil } from './roles_util';

const validRoleInput = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').isLength({ max: 200 }).withMessage("description can't be more than 200 characters"),
  body('rights').custom((value: string) => {
    const accessRights = value?.split(',');
    if (accessRights?.length > 0) {
      const validRights = RolesUtil.getAllPermissionsFromRights();
      const areAllRightsValid = accessRights.every((right) => validRights.includes(right));
      if (!areAllRightsValid) {
        throw new Error('Invalid permission');
      }
    }
    return true; // Validation passed
  })
];

const validGetOneInput = [param('id').isUUID().withMessage('The ID must be a valid UUID')];

export class RoleRoutes {
  private baseEndpoint = '/api/roles';
  constructor(app: Express) {
    const controller = new RoleController();
    app.route(this.baseEndpoint).all(authorize).get(controller.getAllHandler).post(validate(validRoleInput), controller.addHandler);
    app
      .route(this.baseEndpoint + '/:id')
      .all(authorize)
      .get(validate(validGetOneInput), controller.getOneHandler)
      .put(validate(validRoleInput), controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
