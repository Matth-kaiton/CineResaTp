import ErrorResponse from "../errorResponse";

export default class SeatCounts {
  static readonly MAX = 6;
  constructor(readonly value: number) {
    if (!Number.isInteger(value) || value < 1 || value > SeatCounts.MAX) {
      throw new ErrorResponse(
        "Le nombres de siège dois entre entre 1 et 6",
        400,
      );
    }
  }

  isGroup() {
    return this.value >= 4;
  }
}
