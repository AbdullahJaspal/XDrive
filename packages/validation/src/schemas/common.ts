import { z } from 'zod';

export const ukPostcodeSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s+/g, ' ').toUpperCase())
  .pipe(
    z
      .string()
      .regex(
        /^([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}|GIR\s?0AA)$/i,
        'Invalid UK postcode format',
      ),
  );

export const ukPhoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ''))
  .pipe(
    z
      .string()
      .regex(/^(\+44|0)[1-9]\d{8,10}$/, 'Invalid UK phone number'),
  );

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1).max(500),
  postcode: ukPostcodeSchema,
  what3words: z.string().max(100).optional(),
});

export const uuidSchema = z.string().uuid();
