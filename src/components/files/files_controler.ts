import { BaseController } from '../../utils/base_controller';
import { uploadFile } from '../../middlewares/multer';
import { FilesService } from './files_service';
import { Request, Response } from 'express';
import { Files } from './files_entity';
import { IServerConfig } from '../../utils/config';
import * as config from '../../../server_config.json';

export class FileController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    try {
      const fileDataFromMulter = uploadFile(req);

      // Create an instance of the ProjectService
      const service = new FilesService();
      const fileData = new Files();
      fileData.file_name = fileDataFromMulter.filename;
      fileData.mime_type = fileDataFromMulter.mimetype;
      fileData.created_by = req?.user?.user_id ? req?.user?.user_id : null;
      fileData.task_id = req.body.task_id;
      const createdFile = await service.create(fileData);

      res.status(createdFile.statusCode).json({ message: 'File uploaded successfully', createdFile });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
  public async getAllHandler(req: Request, res: Response): Promise<void> {}

  public async getOneHandler(req: Request, res: Response): Promise<void> {
    try {
      const service = new FilesService();
      const server_config: IServerConfig = config;

      const result = await service.findOne(req.params.id);
      const file_path = `${server_config.attached_files_path}/${result.data.file_name}`;
      res.sendFile(file_path, (err) => {
        if (err) {
          // Handle errors, such as file not found or permission issues
          console.error('Error sending file:', err);
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).end();
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  public async updateHandler(req: Request, res: Response): Promise<void> {}

  public async deleteHandler(req: Request, res: Response): Promise<void> {}
}
