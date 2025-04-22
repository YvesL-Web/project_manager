import moment from 'moment';

export const checkValidateDate = function (value) {
  if (!moment(value, 'YYY-MM-DD HH:mm:ss', true).isValid()) {
    return false;
  }
  return true;
};

export const checkValidUUID = (value: string) => {
  const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const isValid = uuidPattern.test(value);
  if (!isValid) {
    throw new Error('Invalid UUIDs');
  }
  return true;
};

/**
 * Helper function to validate an array of UUIDs.
 * @param {string[]} value - The array of strings to validate as UUIDs.
 * @throws {Error} If any value in the array is not a valid UUID.
 */
export const validateUUIDArray = (value: string[]) => {
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
