import type { FileEntityType } from '@prisma/client';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';

import { getStoragePath } from '../config';
import { AppError } from '../errors/app.error';
import { prisma } from '../db';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const storageService = {
  async storeFile(input: {
    entityType: FileEntityType;
    entityId: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    buffer: Buffer;
    uploadedBy?: string;
    complianceDocumentId?: string;
  }) {
    if (!ALLOWED_MIME.has(input.mimeType)) {
      throw AppError.validation(`MIME type not allowed: ${input.mimeType}`);
    }
    if (input.sizeBytes > MAX_SIZE_BYTES) {
      throw AppError.validation('File exceeds maximum size of 10MB');
    }

    const basePath = getStoragePath();
    const storageKey = `${input.entityType.toLowerCase()}/${input.entityId}/${randomUUID()}-${input.originalName}`;
    const fullPath = join(basePath, storageKey);
    const dir = join(fullPath, '..');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    await pipeline(Readable.from(input.buffer), createWriteStream(fullPath));

    return prisma.storedFile.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        originalName: input.originalName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storageKey,
        uploadedBy: input.uploadedBy,
        complianceDocumentId: input.complianceDocumentId,
      },
    });
  },

  listForDriverLicence(driverId: string) {
    return prisma.storedFile.findMany({
      where: { entityType: 'DRIVER_LICENCE', entityId: driverId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        complianceDocumentId: true,
      },
    });
  },
};
