export default class ErroResponse extends Error {
  private statusCode: number;
  private constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
