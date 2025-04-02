// lib/types/index.ts

// Match the backend PaymentLink entity structure closely
export interface PaymentLink {
    id: string; // Internal UUID
    linkId: string; // Shareable short ID
    userId: string;
    productName: string;
    productDescription: string | null;
    amount: number | string; // Backend might send decimal as string
    currency: 'SOL' | 'USDC'; // Use enum/string literal union
    amountFiat: number | string; // Backend might send decimal as string
    fiatCurrencyCode: string; // e.g., 'ETB'
    remark: string | null;
    requiredCustomerInfo: ('name' | 'email' | 'phone' | 'shipping_address')[];
    status: 'active' | 'paid' | 'expired' | 'inactive'; // Match backend enum
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    // user?: User; // User details might be included but often not needed for the list
    // transactions?: Transaction[]; // Transaction details likely fetched separately
  }
  
  // Add other types as needed (e.g., Transaction)
  export interface Transaction {
      id: string;
      paymentLinkId: string;
      blockchainTransactionId: string | null;
      amountPaid: number | string;
      currency: 'SOL' | 'USDC';
      status: 'pending' | 'confirmed' | 'failed' | 'refunded';
      payerAddress: string | null;
      customerName: string | null;
      customerEmail: string | null;
      customerPhone: string | null;
      customerShippingAddress: string | null;
      createdAt: string;
  }