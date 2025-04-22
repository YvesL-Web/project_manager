import { Repository } from 'typeorm';
import { BaseService } from '../../utils/base_service';
import { DatabaseUtil } from '../../utils/db';
import { Tasks } from './tasks_entity';

export class TasksService extends BaseService<Tasks> {
  constructor() {
    let taskRepository: Repository<Tasks> | null = null;
    taskRepository = new DatabaseUtil().getRepository(Tasks);
    super(taskRepository);
  }
}
