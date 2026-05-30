import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import type { ApiResponse } from '@uk-phv/shared-types';

import { AppError, ErrorCode } from '../errors/app.error';

function isPrismaPoolError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('connection pool') ||
    message.includes("can't reach database") ||
    message.includes('timed out fetching a new connection')
  );
}

function mapInfrastructureError(error: unknown): AppError | null {
  if (isPrismaPoolError(error) || error instanceof PrismaClientInitializationError) {
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      'Database is temporarily unavailable. Wait a few seconds and try again.',
      503,
    );
  }
  return null;
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      meta: {
        requestId: randomUUID(),
        timestamp: new Date().toISOString(),
        version: '1',
      },
    },
    { status },
  );
}

export function errorResponse(error: unknown): NextResponse<ApiResponse<never>> {
  const requestId = randomUUID();
  const timestamp = new Date().toISOString();

  const infra = mapInfrastructureError(error);
  if (infra) {
    console.error(error);
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code: infra.code,
          message: infra.message,
        },
        meta: { requestId, timestamp, version: '1' },
      },
      { status: infra.statusCode },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        meta: { requestId, timestamp, version: '1' },
      },
      { status: error.statusCode },
    );
  }

  console.error(error);
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
      },
      meta: { requestId, timestamp, version: '1' },
    },
    { status: 500 },
  );
}

export async function handleApi<T>(
  handler: () => Promise<T>,
  status = 200,
): Promise<NextResponse> {
  try {
    const data = await handler();
    return successResponse(data, status);
  } catch (error) {
    return errorResponse(error);
  }
}

export function mapZodErrors(error: { issues: { path: (string | number)[]; message: string }[] }) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    code: 'VALIDATION',
    message: issue.message,
  }));
}
