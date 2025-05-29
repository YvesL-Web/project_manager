import { QueueWorker } from '../../workers/queue_worker';
import { UsersUtil } from '../users/users_util';

export class TasksUtil {
  public static async notifyUsers(project, task, action) {
    if (project) {
      const userIds = project.user_ids;
      let subject = '';
      let body = '';
      if (action === 'add') {
        subject = 'New Task Created';
        body = `A new task has been created with the name ${task.name} and description ${task.description}.`;
      } else if (action === 'update') {
        subject = 'Task updated';
        body = `A task has been updated with the name ${task.name} and description ${task.description}.`;
      } else if (action === 'delete') {
        subject = 'Task Deleted';
        body = `A task has been deleted with the name ${task.name} and description ${task.description}.`;
      }

      for (const userId of userIds) {
        const user = await UsersUtil.getUserById(userId);
        if (user) {
          await QueueWorker.enqueueEmail(user.email, subject, body);
        }
      }
    }
  }
}
