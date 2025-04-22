import { checkValidateDate, checkValidUUID } from '../../utils/common_validations';
import { body, check, param } from 'express-validator';

export const validProjectInput = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('user_ids').isArray().withMessage('user_ids is an array'),
  body('start_time').custom((value) => {
    if (!checkValidateDate(value)) {
      throw new Error('Invalid date format YYY-MM-DD HH:mm:ss');
    }
    const startTime = new Date(value);
    const currentTime = new Date();
    if (startTime <= currentTime) {
      throw new Error('start time must be greater than the current time !');
    }
    return true;
  }),
  body('end_time').custom((value, { req }) => {
    if (!checkValidateDate(value)) {
      throw new Error('Invalid date format YYY-MM-DD HH:mm:ss');
    }
    const startTime = new Date(req.body.start_time);
    const endTime = new Date(value);
    if (endTime <= startTime) {
      throw new Error('end time must be greater than the start time !');
    }
    return true;
  })
];

export const validProjectID = [param('project_id').notEmpty().withMessage('project_id is required and must be a valid uuid').custom(checkValidUUID)];
