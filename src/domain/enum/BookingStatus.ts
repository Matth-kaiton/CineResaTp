export enum BookingStatus {
  CONFIRMED = "confirm",
  CANCELLED = "cancel",
}

export function isValidStatus(value: string): value is BookingStatus {
  return Object.values(BookingStatus).includes(value as BookingStatus);
}
