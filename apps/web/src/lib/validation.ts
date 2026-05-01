import { z } from "zod";

export const customerInputSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(8).max(30).optional().or(z.literal(""))
});

export const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99)
});

export const checkoutSchema = z.object({
  customer: customerInputSchema,
  items: z.array(checkoutItemSchema).min(1),
  paymentProvider: z.enum(["MANUAL", "STRIPE", "MIDTRANS", "XENDIT"]).default("MANUAL")
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200)
});

export const bookingCreateSchema = z.object({
  customer: customerInputSchema,
  slotId: z.string().min(1),
  notes: z.string().max(500).optional().or(z.literal(""))
});

export const bookingRuleSchema = z.object({
  title: z.string().min(2).max(120),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDurationMinutes: z.number().int().min(10).max(240),
  capacity: z.number().int().min(1).max(50),
  timezone: z.string().min(3).max(64).default("Asia/Jakarta"),
  isActive: z.boolean().default(true)
});

export const bookingSlotSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  capacity: z.number().int().min(1).max(50),
  isActive: z.boolean().default(true)
});

export const adminProductSchema = z.object({
  slug: z.string().min(3).max(120),
  name: z.string().min(2).max(160),
  description: z.string().min(10).max(5000),
  priceMinor: z.number().int().min(0).max(1000000000),
  currency: z.enum(["IDR", "USD"]).default("IDR"),
  stockQty: z.number().int().min(0).max(1000000),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional().or(z.literal(""))
});

export const resellerApplicationSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(30),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  instagram: z.string().max(120).optional().or(z.literal("")),
  experience: z.enum(["NEW", "SELLER", "STORE"]).default("NEW"),
  message: z.string().max(500).optional().or(z.literal(""))
});

export const journey21ApplicationSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(8).max(30),
  email: z.string().email().optional().or(z.literal(""))
});
