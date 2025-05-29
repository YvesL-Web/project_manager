import { ProjectsService } from './projects_service';

export class ProjectsUtil {
  public static async checkValidProjectIds(project_ids: string[]) {
    const service = new ProjectsService();
    // Query the database to check if all project_ids are valid
    const projects = await service.findByIds(project_ids);
    // Check if all project_ids are found in the database
    return projects.data.length === project_ids.length;
  }

  public static async getProjectByProjectId(project_ids: string) {
    const service = new ProjectsService();
    const project = await service.findOne(project_ids);
    return project.data;
  }
}
