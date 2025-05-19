import { Repository } from 'typeorm';
import { BaseService } from '../../utils/base_service';
import { DatabaseUtil } from '../../utils/db';
import { Files } from './files_entity';

export class FilesService extends BaseService<Files> {
  constructor() {
    let fileRepository: Repository<Files> | null = null;
    fileRepository = new DatabaseUtil().getRepository(Files);
    super(fileRepository);
  }
}
