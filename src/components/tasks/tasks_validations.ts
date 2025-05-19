import { body, param } from 'express-validator';
import { checkValidateDate, checkValidUUID } from '../../utils/common_validations';

export const validTaskInput = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('project_id').trim().notEmpty().withMessage('project_id is required').custom(checkValidUUID),
  body('user_id').trim().notEmpty().withMessage('user_id is required'),
  body('estimated_start_time')
    .notEmpty()
    .withMessage('estimated_start_time is required')
    .trim()
    .custom((value) => {
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
  body('estimated_end_time')
    .notEmpty()
    .withMessage('estimated_end_time is required')
    .trim()
    .custom((value, { req }) => {
      if (!checkValidateDate(value)) {
        throw new Error('Invalid date format YYY-MM-DD HH:mm:ss');
      }
      const startTime = new Date(req.body.estimate_start_time);
      const endTime = new Date(value);
      if (endTime <= startTime) {
        throw new Error('end time must be greater than the start time !');
      }
      return true;
    })
];

export const updateTaskInput = [
  body('estimated_start_time').custom((value) => {
    if (value && !checkValidateDate(value)) {
      throw new Error('Invalid date format YYYY-MM-DD HH:mm:ss');
    }
    const startTime = new Date(value);
    const currentTime = new Date();
    if (startTime <= currentTime) {
      throw new Error('Start time must be greater than the current time');
    }
    return true;
  }),

  body('estimated_end_time').custom((value, { req }) => {
    if (value && !checkValidateDate(value)) {
      throw new Error('Invalid date format YYYY-MM-DD HH:mm:ss');
    }
    const startTime = new Date(req.body.start_time);
    const endTime = new Date(value);
    if (endTime <= startTime) {
      throw new Error('End time must be greater than the start time');
    }
    return true;
  })
];

export const validId = [param('id').custom(checkValidUUID)];
