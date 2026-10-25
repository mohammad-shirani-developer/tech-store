import { z } from "zod";

export const shippingFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full name must be at least 3 characters"),
  email: z
    .string()
    .trim()
    .pipe(z.email("Please enter a valid email address")),
  phone: z
    .string()
    .trim()
    .regex(
      /^(\+98|0098|98|0)?9\d{9}$/,
      "Please enter a valid Iranian phone number (e.g. 09123456789)",
    ),
  address: z
    .string()
    .trim()
    .min(10, "Address must be at least 10 characters"),
  city: z.string().trim().min(2, "City must be at least 2 characters"),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Postal code must be exactly 10 digits"),
});

export type ShippingFormValues = z.infer<typeof shippingFormSchema>;
