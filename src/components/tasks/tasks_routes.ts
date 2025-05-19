import { Express } from 'express';
import { TaskController } from './tasks_controller';
import { authorize } from '../../middlewares/auth_middleware';
import { validate } from '../../middlewares/validator';
import { updateTaskInput, validId, validTaskInput } from './tasks_validations';

export class TaskRoutes {
  private baseEndPoint = '/api/tasks';
  constructor(app: Express) {
    const controller = new TaskController();
    app.route(this.baseEndPoint).all(authorize).get(controller.getAllHandler).post(validate(validTaskInput), controller.addHandler);
    app
      .route(this.baseEndPoint + '/:id')
      .all(authorize, validate(validId))
      .get(controller.getOneHandler)
      .put(validate(updateTaskInput), controller.updateHandler)
      .delete(controller.deleteHandler);
  }
}
