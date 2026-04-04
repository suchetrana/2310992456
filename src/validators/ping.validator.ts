import { z } from 'zod';
export const pingSchema = z.object({
    user_id: z.string().min(1)
})