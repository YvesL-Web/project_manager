import { Request, Response } from 'express';
import { hasPermission } from '../../utils/auth_util';
import { TasksService } from './tasks_service';
import { UsersUtil } from '../users/users_util';
import { ProjectsUtil } from '../projects/projects_util';
import { BaseController } from '../../utils/base_controller';

export class TaskController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'add_task')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    try {
      const service = new TasksService();
      const task = req.body;
      const isValidProject = await ProjectsUtil.checkValidProjectIds([task.project_id]);
      if (!isValidProject) {
        res.status(400).json({ statusCode: 400, status: 'error', message: 'Invalid project_id' });
        return;
      }
      const isValidUser = await UsersUtil.checkValidUserIds([task.user_id]);
      if (!isValidUser) {
        res.status(400).json({ statusCode: 400, status: 'error', message: 'Invalid user_id' });
        return;
      }
      const createTask = await service.create(task);
      res.status(createTask.statusCode).json(createTask);
    } catch (error) {
      console.error(`Error while addUser => ${error.message}`);
      res.status(500).json({ statusCode: 500, status: 'error', message: 'Internal server error' });
    }
  }
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    // getAllHandler
  }
  public async getOneHandler(req: Request, res: Response): Promise<void> {
    // getDetailsHandler
  }
  public async updateHandler(req: Request, res: Response): Promise<void> {
    // updateHandler
  }
  public async deleteHandler(req: Request, res: Response): Promise<void> {
    // deleteHandler
  }
}
