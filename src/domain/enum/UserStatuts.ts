export enum UserStatus {
  STUDENT = "student",
  NORMAL = "normal",
}

export function isValidStatus(value: string): value is UserStatus {
  return Object.values(UserStatus).includes(value as UserStatus);
}
