import { Request, Response } from 'express';
import { hasPermission } from '../../utils/auth_util';
import { TasksService } from './tasks_service';
import { UsersUtil } from '../users/users_util';
import { ProjectsUtil } from '../projects/projects_util';
import { BaseController } from '../../utils/base_controller';
import { TasksUtil } from './tasks_util';

export class TaskController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'add_task')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    try {
      const service = new TasksService();
      const task = req.body;
      // Get the project
      const project = await ProjectsUtil.getProjectByProjectId(task.project_id);
      // check if the provided project_id is valid
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

      // Notify the users of the project that a new task has been created
      await TasksUtil.notifyUsers(project, task, 'add');
    } catch (error) {
      console.error(`Error while addUser => ${error.message}`);
      res.status(500).json({ statusCode: 500, status: 'error', message: 'Internal server error' });
    }
  }
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_all_tasks')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new TasksService();
    const result = await service.findAll(req.query);
    res.status(result.statusCode).json(result);
  }
  public async getOneHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_details_task')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new TasksService();
    const result = await service.findOne(req.params.id);
    res.status(result.statusCode).json(result);
  }
  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'edit_task')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const task = req.body;
    const service = new TasksService();
    const result = await service.update(req.params.id, task);
    res.status(result.statusCode).json(result);
  }
  public async deleteHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'delete_task')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new TasksService();
    const result = await service.delete(req.params.id);
    res.status(result.statusCode).json(result);
  }
}
