import { z } from "zod";

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const ProductSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/i, "slug can contain letters, numbers and hyphens"),
  description: z.string().min(10),
  price: z.number().int().positive(), // rupees in UI, will convert to paise
  stock: z.number().int().nonnegative(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  affiliateCommission: z.number().int().min(0).max(100).optional(),
});

export const OrderItemInput = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const AddressSchema = z.object({
  name: z.string().min(2),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  country: z.string().min(2),
  phone: z.string().min(8),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemInput).min(1),
  shippingAddress: AddressSchema,
});
