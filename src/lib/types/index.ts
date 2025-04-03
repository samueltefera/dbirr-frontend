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
    user: User; // User details might be included but often not needed for the list
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

  export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    brandColor: string;
    useDefaultTheme: boolean;
    toggleDarkMode: boolean;
    useDevnet: boolean;
    walletAddress: string | null;
  }

  export interface Transaction {
    id: string; // Backend internal ID
    paymentLinkId: string;
    blockchainTransactionId: string | null; // The on-chain signature
    amountPaid: number | string; // Use parseFloat if string
    currency: 'SOL' | 'USDC';
    status: 'pending' | 'confirmed' | 'failed' | 'refunded'; // Match backend enum
    payerAddress: string | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    customerShippingAddress: string | null;
    createdAt: string; // ISO date string
    // Consider adding relation to PaymentLink if backend includes it
    // paymentLink?: { productName: string; linkId: string };
  }