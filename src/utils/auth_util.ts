export const hasPermission = (rights: string[], desired_rights: string): boolean => {
  if (rights?.includes(desired_rights)) {
    return true;
  } else {
    return false;
  }
};
