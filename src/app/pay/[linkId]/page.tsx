// app/pay/[linkId]/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation'; // Get linkId from URL
import api from '@/lib/api'; // Your backend API client
import { PaymentLink, Transaction } from '@/lib/types'; // Frontend types
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Copy, Loader2, CircleDollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Wallet Adapter Hooks and UI components
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'; // Pre-styled connect button
import { Connection, SystemProgram, Transaction as SolanaTransaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
// Import SPL token functions if needed for constructing USDC transactions
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';


// Helper to format date (copy from links page or centralize)
const formatDate = (dateString: string) => { /* ... same as before ... */
    try {
        return new Date(dateString).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch (e) { return 'Invalid Date'; }
};
// Helper to format currency (copy or centralize)
const formatCurrency = (amount: number | string, currencyCode: string) => { /* ... same as before ... */
    try {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        // Basic non-locale formatting for crypto
        if (currencyCode === 'SOL' || currencyCode === 'USDC') {
            return `${numAmount.toFixed(currencyCode === 'SOL' ? 9 : 6)} ${currencyCode}`; // Adjust decimals if needed
        }
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(numAmount);
    } catch (e) { return `${amount} ${currencyCode}`; }
};
// Helper to copy text (copy or centralize)
const copyToClipboard = (text: string, message: string = "Copied!") => { /* ... same as before ... */
    navigator.clipboard.writeText(text).then(() => toast.success(message), () => toast.error("Failed to copy."));
};


export default function PaymentPage() {
  const params = useParams();
  const linkId = params.linkId as string;

  // Component State
  const [paymentLink, setPaymentLink] = useState<PaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'verifying' | 'success' | 'failed'>('idle');
  const [verifiedTx, setVerifiedTx] = useState<Transaction | null>(null); // Store verified tx details
  const [formData, setFormData] = useState<{ [key: string]: string }>({}); // For customer info
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Wallet Adapter State
  const { connection } = useConnection(); // Solana connection object from provider
  const { publicKey, sendTransaction, connecting, connected, wallet } = useWallet(); // Wallet state and functions

  // Fetch Payment Link Details
  useEffect(() => {
    if (!linkId) return;
    setIsLoading(true);
    setError(null);
    setPaymentStatus('idle'); // Reset payment status on link change

    api.get<PaymentLink>(`/payments/links/${linkId}`)
      .then(response => {
        setPaymentLink(response.data);
        if (response.data.status !== 'active') {
            setError(`This payment link is no longer active (Status: ${response.data.status}).`);
            toast.error("Payment link is not active.");
        }
      })
      .catch(err => {
        console.error("Failed to fetch payment link details:", err);
        const message = err.response?.status === 404
          ? "Payment link not found."
          : "Could not load payment details.";
        setError(message);
        toast.error(message);
      })
      .finally(() => setIsLoading(false));

  }, [linkId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Memoize required fields for stability
   const requiredFields = useMemo(() => {
       return paymentLink?.requiredCustomerInfo || [];
   }, [paymentLink]);

   const isFormComplete = useMemo(() => {
     if (!paymentLink) return false;
     return requiredFields.every(fieldId => formData[fieldId]?.trim());
   }, [formData, paymentLink, requiredFields]);


   const handlePayment = async () => {
     if (!publicKey || !paymentLink || !connection || paymentLink.status !== 'active') {
       toast.error("Cannot proceed with payment. Ensure wallet is connected and link is active.");
       return;
     }
     if (requiredFields.length > 0 && !isFormComplete) {
         toast.error("Please fill in all required customer information.");
         return;
     }
     if (!termsAccepted) {
         toast.error("Please accept the terms of service.");
         return;
     }

     setPaymentStatus('processing');
     toast.info("Preparing transaction...", { id: 'payment-toast' });

     try {
       const recipientAddress = new PublicKey(paymentLink.user.walletAddress as string); // Assuming user.walletAddress is populated
       const amount = parseFloat(paymentLink.amount as string); // Ensure amount is a number
       let transactionSignature: string | undefined = undefined;


       // 1. Get Latest Blockhash
       const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

       // 2. Create Transaction based on currency
       const transaction = new SolanaTransaction({
           feePayer: publicKey,
           blockhash: blockhash,
           lastValidBlockHeight: lastValidBlockHeight,
       });

       if (paymentLink.currency === 'SOL') {
         const lamports = Math.round(amount * LAMPORTS_PER_SOL); // Convert SOL to lamports
         console.log(`Creating SOL transfer: ${lamports} lamports to ${recipientAddress.toBase58()}`);
         transaction.add(
           SystemProgram.transfer({
             fromPubkey: publicKey,
             toPubkey: recipientAddress,
             lamports: lamports,
           })
         );
       } else if (paymentLink.currency === 'USDC') {
         // --- USDC Transaction (Requires correct Mint address) ---
         // !! IMPORTANT: Replace with your ACTUAL USDC Mint Address (Devnet/Mainnet/Local) !!
         const usdcMintAddress = new PublicKey('AycNM7sw7fvmH9utV1Dd6NV3wiv29NPYfwopBLTjfXUx'); // e.g., EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v for Mainnet
         const decimals = 9; // Typical USDC decimals

          // Ensure recipientAddress is valid before getting ATA
         if (!PublicKey.isOnCurve(recipientAddress.toBuffer())) {
             throw new Error("Merchant wallet address is not a valid public key.");
         }

         // Find or create the sender's and receiver's Associated Token Accounts (ATA)
         // Usi requires @solana/spl-token v0.4+
         // Or use the async version: getAssociatedTokenAddress
         // const senderTokenAccountAddress = getAssociatedTokenAddressSync(usdcMintAddress, publicKey); // Payer's ATA
         // const recipientTokenAccountAddress = getAssociatedTokenAddressSync(usdcMintAddress, recipientAddress); // Merchant's ATA

         // Alternative: Use async version (safer)
           const senderTokenAccountAddress = await getAssociatedTokenAddress(usdcMintAddress, publicKey);
           const recipientTokenAccountAddress = await getAssociatedTokenAddress(usdcMintAddress, recipientAddress);


         // Check if the recipient ATA exists, if not, the transfer might fail unless wrapped SOL etc.
         // For simplicity here, we assume it exists or the `transfer` instruction handles it.
         // A robust solution might check and include createATA instruction if needed.

         const tokenAmount = BigInt(Math.round(amount * (10 ** decimals))); // Convert USDC amount to smallest unit

         console.log(`Creating USDC transfer: ${tokenAmount} units from ${senderTokenAccountAddress.toBase58()} to ${recipientTokenAccountAddress.toBase58()}`);

         transaction.add(
           createTransferInstruction(
             senderTokenAccountAddress, // Source ATA
             recipientTokenAccountAddress, // Destination ATA
             publicKey, // Owner of source account (payer's wallet)
             tokenAmount // Amount in smallest units (u64/BigInt)
             // [], // Optional multisigners
             // TOKEN_PROGRAM_ID // Default
           )
         );
       } else {
         throw new Error(`Unsupported currency: ${paymentLink.currency}`);
       }

       // 3. Sign and Send Transaction
       toast.loading("Please approve the transaction in your wallet...", { id: 'payment-toast' });

       // Use the wallet adapter's sendTransaction
       transactionSignature = await sendTransaction(transaction, connection);
       console.log("Transaction sent. Signature:", transactionSignature);
       toast.loading("Confirming transaction on the network...", { id: 'payment-toast' });

       // 4. Confirm Transaction (Optional but recommended for UI feedback)
       const confirmation = await connection.confirmTransaction(
         {
           signature: transactionSignature,
           blockhash: blockhash,
           lastValidBlockHeight: lastValidBlockHeight,
         },
         'confirmed' // Or 'finalized' for higher assurance
       );

       if (confirmation.value.err) {
         console.error("Transaction confirmation failed:", confirmation.value.err);
         throw new Error(`Transaction failed to confirm: ${JSON.stringify(confirmation.value.err)}`);
       }

       console.log("Transaction confirmed:", transactionSignature);
       toast.loading("Verifying payment with merchant...", { id: 'payment-toast' });
       setPaymentStatus('verifying');

       // 5. Verify with Backend
       try {
            const verificationPayload = {
                linkId: linkId,
                transactionSignature: transactionSignature,
                // Include customer info collected
                ...(formData.name && { customerName: formData.name }),
                ...(formData.email && { customerEmail: formData.email }),
                ...(formData.phone && { customerPhone: formData.phone }),
                ...(formData.shipping_address && { customerShippingAddress: formData.shipping_address }),
            };
            console.log("Sending verification payload:", verificationPayload);

           const verifyResponse = await api.post<Transaction>('/payments/verify', verificationPayload);

           if (verifyResponse.data && verifyResponse.data.status === 'confirmed') {
                console.log("Verification successful:", verifyResponse.data);
                toast.success("Payment Successful! Thank you.", { id: 'payment-toast' });
                setPaymentStatus('success');
                setVerifiedTx(verifyResponse.data); // Store details
                // Optionally redirect or update UI further
           } else {
                console.error("Backend verification failed:", verifyResponse.data);
                throw new Error("Payment verification failed after transaction confirmation.");
           }
       } catch (verifyError: any) {
            console.error("Backend verification API call failed:", verifyError);
             const backendMessage = verifyError.response?.data?.message || "Verification with merchant failed.";
             toast.error(`Transaction Sent, Verification Failed: ${backendMessage}`, { id: 'payment-toast' });
             // Even if verification fails, the TX might be on chain. Treat as potentially paid but unverified?
             // Or treat as failed for the user? Depends on business logic.
             setPaymentStatus('failed'); // Set to failed if verification is critical
             setError(`Your transaction (${transactionSignature}) was sent, but we couldn't verify it with the merchant. Please contact support.`);
       }


     } catch (error: any) {
       console.error("Payment failed:", error);
       const message = error.message || "An unknown error occurred during payment.";
       toast.error(`Payment Failed: ${message}`, { id: 'payment-toast' });
       setPaymentStatus('failed');
     }
   };

  // --- Render Logic ---

   if (isLoading) {
     return (
       <div className="flex items-center justify-center min-h-screen p-4 bg-background">
         <Card className="w-full max-w-md shadow-lg">
           <CardHeader className="space-y-4">
             <Skeleton className="h-8 w-3/4 mx-auto" />
             <Skeleton className="h-4 w-1/2 mx-auto" />
           </CardHeader>
           <CardContent className="space-y-6">
             <Skeleton className="h-24 w-full rounded-lg" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
           </CardContent>
         </Card>
       </div>
     );
   }

   if (error) {
     return (
       <div className="flex items-center justify-center min-h-screen p-4 bg-background">
         <Card className="w-full max-w-md shadow-lg border-destructive">
           <CardHeader className="text-center space-y-4">
             <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
               <AlertCircle className="h-6 w-6 text-destructive" />
             </div>
             <CardTitle className="text-xl text-destructive">Payment Link Error</CardTitle>
           </CardHeader>
           <CardContent className="text-center">
             <p className="text-muted-foreground">{error}</p>
           </CardContent>
         </Card>
       </div>
     );
   }

   if (paymentStatus === 'success' && verifiedTx) {
     return (
       <div className="flex items-center justify-center min-h-screen p-4 bg-background">
         <Card className="w-full max-w-md shadow-lg">
           <CardHeader className="text-center space-y-4">
             <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
               <CheckCircle2 className="h-6 w-6 text-green-600" />
             </div>
             <CardTitle className="text-xl text-green-600">Payment Successful!</CardTitle>
             <CardDescription>Your transaction has been completed and verified.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Amount Paid</span>
                 <span className="font-medium">{formatCurrency(verifiedTx.amountPaid, verifiedTx.currency)}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Date</span>
                 <span className="font-medium">{formatDate(verifiedTx.createdAt)}</span>
               </div>
               {paymentLink?.productName && (
                 <div className="flex justify-between items-center">
                   <span className="text-muted-foreground">Product</span>
                   <span className="font-medium">{paymentLink.productName}</span>
                 </div>
               )}
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Transaction ID</span>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={() => copyToClipboard(verifiedTx.blockchainTransactionId!, "Transaction ID copied!")} 
                   className="font-mono text-xs h-auto px-2 py-1 hover:bg-muted"
                 >
                   {verifiedTx.blockchainTransactionId?.substring(0, 6)}...{verifiedTx.blockchainTransactionId?.substring(verifiedTx.blockchainTransactionId.length - 6)}
                   <Copy className="ml-1 h-3 w-3"/>
                 </Button>
               </div>
             </div>
           </CardContent>
         </Card>
       </div>
     );
   }

   // Default Idle/Form state
   return (
     <div className="flex items-center justify-center min-h-screen p-4 bg-background">
       <Card className="w-full max-w-md shadow-lg">
         <CardHeader className="text-center space-y-4">
           <CardTitle className="text-2xl font-bold tracking-tight">
             {paymentLink?.productName || "Payment Request"}
           </CardTitle>
           {paymentLink?.productDescription && (
             <CardDescription className="text-base">
               {paymentLink.productDescription}
             </CardDescription>
           )}
         </CardHeader>
         <CardContent className="space-y-6">
           {/* Amount Due */}
           <div className="rounded-lg border bg-card p-6 space-y-2">
             <p className="text-sm text-muted-foreground text-center">Amount Due</p>
             <p className="text-3xl font-bold tracking-tight text-center">
               {formatCurrency(paymentLink!.amount, paymentLink!.currency)}
             </p>
             <p className="text-sm text-muted-foreground text-center">
               ≈ {formatCurrency(paymentLink!.amountFiat, paymentLink!.fiatCurrencyCode)}
             </p>
           </div>

           {/* Required Customer Info Form */}
           {requiredFields.length > 0 && (
             <div className="space-y-4">
               <h3 className="text-sm font-medium text-center text-muted-foreground">
                 Please provide the following information
               </h3>
               <div className="space-y-4">
                 {requiredFields.map(fieldId => (
                   <div key={fieldId} className="space-y-2">
                     <Label htmlFor={fieldId} className="text-sm font-medium">
                       {fieldId.replace('_', ' ')}
                     </Label>
                     <Input
                       id={fieldId}
                       name={fieldId}
                       type={fieldId === 'email' ? 'email' : fieldId === 'phone' ? 'tel' : 'text'}
                       required
                       value={formData[fieldId] || ''}
                       onChange={handleInputChange}
                       placeholder={`Your ${fieldId.replace('_', ' ')}`}
                       className="h-10"
                     />
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Terms Acceptance */}
           <div className="flex items-start space-x-3">
             <Checkbox 
               id="terms" 
               checked={termsAccepted} 
               onCheckedChange={(checked) => setTermsAccepted(Boolean(checked))}
               className="mt-1"
             />
             <div className="space-y-1">
               <Label 
                 htmlFor="terms" 
                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
               >
                 Accept terms and conditions
               </Label>
               <p className="text-sm text-muted-foreground">
                 You agree to our Terms of Service and Privacy Policy.
               </p>
             </div>
           </div>
         </CardContent>
         <CardFooter className="flex flex-col space-y-4">
           {/* Wallet Connect Button */}
           <WalletMultiButton className="!w-full !h-10 !bg-primary !text-primary-foreground hover:!bg-primary/90" />

           {/* Pay Button */}
           {connected && (
             <Button
               className="w-full h-10"
               onClick={handlePayment}
               disabled={
                 !publicKey ||
                 connecting ||
                 !paymentLink ||
                 paymentLink.status !== 'active' ||
                 paymentStatus === 'processing' ||
                 paymentStatus === 'verifying' ||
                 !termsAccepted ||
                 (requiredFields.length > 0 && !isFormComplete)
               }
             >
               {(paymentStatus === 'processing' || paymentStatus === 'verifying') && (
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               )}
               {paymentStatus === 'processing' 
                 ? 'Processing...' 
                 : paymentStatus === 'verifying' 
                 ? 'Verifying...' 
                 : `Pay ${formatCurrency(paymentLink!.amount, paymentLink!.currency)}`
               }
             </Button>
           )}

           {/* Error Message */}
           {paymentStatus === 'failed' && error && (
             <p className="text-sm text-destructive text-center">{error}</p>
           )}
         </CardFooter>
       </Card>
     </div>
   );
}