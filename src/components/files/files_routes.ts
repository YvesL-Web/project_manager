import { Express } from 'express';
import { authorize } from '../../middlewares/auth_middleware';
import { fileUploadMiddleware } from '../../middlewares/multer';
import { FileController } from './files_controler';

export class FileRoutes {
  private baseEndpoint = '/api/files';
  constructor(app: Express) {
    const controller = new FileController();
    app.route(this.baseEndpoint).all(authorize).post(fileUploadMiddleware, controller.addHandler);
    app
      .route(this.baseEndpoint + '/:id')
      .all(authorize)
      .get(controller.getOneHandler);
  }
}
