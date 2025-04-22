import { Request, Response } from 'express';
import { hasPermission } from '../../utils/auth_util';
import { ProjectsService } from './projects_service';
import { BaseController } from '../../utils/base_controller';
import { UsersUtil } from '../users/users_util';

export class ProjectController extends BaseController {
  public async addHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'add_project')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    try {
      const service = new ProjectsService();
      const project = req.body;
      const isValidUsers = await UsersUtil.checkValidUserIds(project.user_ids);
      if (!isValidUsers) {
        res.status(400).json({ statusCode: 400, status: 'error', message: 'Invalid user_ids' });
        return;
      }
      const createProject = await service.create(project);
      res.status(createProject.statusCode).json(createProject);
    } catch (error) {
      console.error(`Error while addUser => ${error.message}`);
      res.status(500).json({ statusCode: 500, status: 'error', message: 'Internal server error' });
    }
  }
  public async getAllHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_all_projects')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new ProjectsService();
    const result = await service.findAll(req.query);
    for (const project of result.data) {
      project['users'] = await UsersUtil.getUsernamesById(project.user_ids);
      delete project.user_ids;
    }
    res.status(result.statusCode).json(result);
  }
  public async getOneHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'get_details_project')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new ProjectsService();
    const result = await service.findOne(req.params.project_id);
    if (result.statusCode === 200) {
      result.data['user'] = await UsersUtil.getUsernamesById(result.data['user_ids']);
      delete result.data['user_ids'];
    }
    res.status(result.statusCode).json(result);
    return;
  }
  public async updateHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'edit_project')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const project = req.body;
    const service = new ProjectsService();
    const result = await service.update(req.params.project_id, project);
    res.status(result.statusCode).json(result);
    return;
  }
  public async deleteHandler(req: Request, res: Response): Promise<void> {
    if (!hasPermission(req.user.rights, 'delete_project')) {
      res.status(403).json({ statusCode: 403, status: 'error', message: 'Unauthorized' });
      return;
    }
    const service = new ProjectsService();
    const result = await service.delete(req.params.project_id);
    res.status(result.statusCode).json(result);
  }
}
