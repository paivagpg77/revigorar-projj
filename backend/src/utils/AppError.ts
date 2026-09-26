export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) { super(message); }
  static badRequest(m: string) { return new AppError(m, 400); }
  static unauthorized(m = 'Não autorizado') { return new AppError(m, 401); }
  static notFound(m = 'Não encontrado') { return new AppError(m, 404); }
  static conflict(m: string) { return new AppError(m, 409); }
}
