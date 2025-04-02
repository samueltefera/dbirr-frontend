// lib/schemas/paymentLinkSchema.ts
import { z } from 'zod';

// Define the available currencies - should match backend Currency enum
export const availableCurrencies = ['SOL', 'USDC'] as const;
export const fiatCurrency = 'ETB' as const; // Hardcode for now, make dynamic if needed

// Define available customer info requirements - match backend RequiredCustomerInfo enum
export const requiredInfoOptions = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'shipping_address', label: 'Shipping Address' },
] as const;

export const paymentLinkSchema = z.object({
  productName: z.string().min(1, { message: "Product name is required." }).max(100),
  productDescription: z.string().max(500).optional(),
  // User enters amount in Fiat
  amountFiat: z.coerce // Use coerce to convert input string/number to number
    .number({ invalid_type_error: "Amount must be a number." })
    .positive({ message: "Amount must be positive." }),
  // Currency selection (SOL or USDC)
  currency: z.enum(availableCurrencies, {
    required_error: "You need to select a payment currency.",
  }),
  remark: z.string().max(200).optional(),
  requiredCustomerInfo: z.array(z.string()) // Array of IDs from requiredInfoOptions
    .optional(),
});

export type PaymentLinkFormData = z.infer<typeof paymentLinkSchema>;