export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(message, 400, details);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictException extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super(message, 409, details);
  }
}

export class NotImplementedException extends AppError {
  constructor(message = "Not implemented yet") {
    super(message, 501);
  }
}
