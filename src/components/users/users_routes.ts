import { Express } from 'express';
import { UserController } from './users_controller';
import { validate } from '../../middlewares/validator';
import { authorize } from '../../middlewares/auth_middleware';
import { updateValidUserInput, validChangePassword, validUserInput } from './users_validations';

export class UserRoutes {
  private baseEndPoint = '/api/users';
  constructor(app: Express) {
    const controller = new UserController();
    app
      .route(this.baseEndPoint)
      .all(authorize) // Apply authorization middleware to all routes under this endpoint
      .get(controller.getAllHandler)
      .post(validate(validUserInput), controller.addHandler);
    app
      .route(this.baseEndPoint + '/:id')
      .all(authorize) // Apply authorization middleware to all routes under this endpoint
      .get(controller.getOneHandler)
      .put(validate(updateValidUserInput), controller.updateHandler)
      .delete(controller.deleteHandler);
    app
      .route(this.baseEndPoint + '/change_password/:id')
      .all(authorize)
      .post(validate(validChangePassword), controller.changePassword);
    app.route('/api/login').post(controller.login);
    app.route('/api/refresh_token').post(controller.getAccessTokenFromRefreshToken);
  }
}
