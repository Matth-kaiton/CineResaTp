import ErrorResponse from "../errorResponse";

export default class Email {
  readonly value: string;
  constructor(raw: string) {
    const value = raw.toLowerCase().trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      throw new ErrorResponse("Email invalide", 400);
    }
    this.value = value;
  }
}
