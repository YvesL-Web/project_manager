import { Express } from 'express';
import { TaskController } from './tasks_controller';
import { authorize } from '../../middlewares/auth_middleware';
import { validate } from '../../middlewares/validator';
import { validTaskInput } from './tasks_validations';
export class TaskRoutes {
  private baseEndPoint = '/api/tasks';
  constructor(app: Express) {
    const controller = new TaskController();
    app.route(this.baseEndPoint).all(authorize).get(controller.getAllHandler).post(validate(validTaskInput), controller.addHandler);
    app
      .route(this.baseEndPoint + '/:id')
      .get(controller.getOneHandler)
      .put(controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
