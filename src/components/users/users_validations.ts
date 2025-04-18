import { body } from 'express-validator';

/**
 * Helper function to validate an array of UUIDs.
 * @param {string[]} value - The array of strings to validate as UUIDs.
 * @throws {Error} If any value in the array is not a valid UUID.
 */
const validateUUIDArray = (value: string[]) => {
  const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error('role_ids must be a non-empty array');
  }
  const isValid = value.every((uuid) => uuidPattern.test(uuid.trim()));
  if (!isValid) {
    throw new Error('Invalid UUIDs in role_ids');
  }
  return true;
};

export const validUserInput = [
  body('username').trim().notEmpty().withMessage('username is required'),
  body('email').isEmail().withMessage('email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('password is required and should be at least 6 characters long')
    .isStrongPassword({ minLowercase: 1, minUppercase: 1, minSymbols: 1, minNumbers: 1 })
    .withMessage('password should contain at least 1 lowercase letter, 1 uppercase letter, 1 special symbol, and 1 number'),
  body('role_ids').isArray().withMessage('role_ids is required and must be an array').custom(validateUUIDArray)
];

export const updateValidUserInput = [body('role_ids').isArray().withMessage('role_ids is required and must be an array').custom(validateUUIDArray)];

export const validChangePassword = [
  body('oldPassword').trim().notEmpty().withMessage('oldPassword is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('password is required and should be at least 6 characters long')
    .isStrongPassword({ minLowercase: 1, minUppercase: 1, minSymbols: 1, minNumbers: 1 })
    .withMessage('password should contain at least 1 lowercase letter, 1 uppercase letter, 1 special symbol, and 1 number'),
  body('role_ids')
];
