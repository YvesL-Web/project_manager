import { Express } from 'express';
import { ProjectController } from './projects_controller';
import { authorize } from '../../middlewares/auth_middleware';
import { validate } from '../../middlewares/validator';
import { validProjectInput, validProjectID } from './projects_validations';

export class ProjectRoutes {
  private baseEndPoint = '/api/projects';
  constructor(app: Express) {
    const controller = new ProjectController();
    app.route(this.baseEndPoint).all(authorize).get(controller.getAllHandler).post(validate(validProjectInput), controller.addHandler);
    app
      .route(this.baseEndPoint + '/:project_id')
      .all(authorize, validate(validProjectID))
      .get(controller.getOneHandler)
      .put(validate(validProjectInput), controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
