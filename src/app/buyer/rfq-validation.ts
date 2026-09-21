import { z } from "zod";

export const rfqSchema = z.object({
  title: z.string().trim().min(3).max(120),
  categoryId: z.string().uuid(),
  description: z.string().trim().min(10).max(5000),
  quantity: z.coerce.number().int().positive(),
  unit: z.string().trim().min(1).max(30),
  deliveryLocation: z.string().trim().min(3).max(500),
  deliveryLatitude: z.coerce
    .number()
    .min(-90)
    .max(90)
    .optional()
    .or(z.literal("")),
  deliveryLongitude: z.coerce
    .number()
    .min(-180)
    .max(180)
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,/, "Choose a valid image")
    .max(800_000)
    .optional()
    .or(z.literal("")),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a deadline")
    .transform((value) => new Date(`${value}T23:59:59`))
    .refine((date) => date > new Date(), "Choose a future deadline"),
});
