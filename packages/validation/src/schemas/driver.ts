import { z } from 'zod';

export const updateDriverAvailabilitySchema = z.object({
  onDuty: z.boolean(),
});

export type UpdateDriverAvailabilityInput = z.infer<typeof updateDriverAvailabilitySchema>;
