export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BUSINESS_RULE = 'BUSINESS_RULE',
  COMPLIANCE_BLOCKED = 'COMPLIANCE_BLOCKED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface AppErrorDetail {
  field?: string;
  code: string;
  message: string;
}

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode = 400,
    public readonly details?: AppErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }

  static notFound(resource: string, id?: string): AppError {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    return new AppError(ErrorCode.NOT_FOUND, message, 404);
  }

  static forbidden(message = 'Insufficient permissions'): AppError {
    return new AppError(ErrorCode.FORBIDDEN, message, 403);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
  }

  static complianceBlocked(message: string): AppError {
    return new AppError(ErrorCode.COMPLIANCE_BLOCKED, message, 422);
  }

  static validation(message: string, details?: AppErrorDetail[]): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }
}
