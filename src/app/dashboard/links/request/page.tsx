// app/dashboard/links/request/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentLinkSchema, PaymentLinkFormData, availableCurrencies, fiatCurrency, requiredInfoOptions } from '@/lib/schemas/paymentLinkSchema';
import api from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Info, Copy, Check, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PaymentLinkDisplay } from "@/components/ui/payment-link-display";

export default function RequestPaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  // Add state for estimated crypto amount if needed later
  const [estimatedCrypto, setEstimatedCrypto] = useState<string | null>(null);

  const form = useForm<PaymentLinkFormData>({
    resolver: zodResolver(paymentLinkSchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      amountFiat: undefined, // Initialize as undefined for number input
      currency: undefined, // No default currency selected
      remark: '',
      requiredCustomerInfo: [],
    },
  });

  const copyToClipboard = async (text: string) => {
    try {   
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Payment link copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
      console.error('Could not copy text: ', err);
    }
  };

  const onSubmit = async (data: PaymentLinkFormData) => {
    setIsLoading(true);
    setEstimatedCrypto(null); // Clear any previous estimate

    try {
      const payload = {
        ...data,
        fiatCurrencyCode: fiatCurrency, // Add the hardcoded fiat currency
        // Ensure amountFiat is sent as a number
        amountFiat: Number(data.amountFiat),
        // Backend will calculate the crypto amount (amount)
      };
      console.log("Submitting payload:", payload); // Debug log

      const response = await api.post('/payments/links', payload);
      const link = `${window.location.origin}/pay/${response.data.linkId}`;
      setPaymentLink(link);
      setShowSuccessDialog(true);
      form.reset(); // Clear the form

    } catch (error: any) {
      console.error("Failed to create payment link:", error);
      const errorMessage = error.response?.data?.message || "Failed to create link. Please try again.";
      toast.error("Link Creation Failed", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Optional: Function to estimate crypto amount on the fly (requires backend endpoint or frontend logic)
//   const handleAmountChange = async (fiatAmount: number | string, cryptoCurrency?: 'SOL' | 'USDC') => {
//     // ... implementation to call backend /payments/calculate-crypto or similar ...
//     setEstimatedCrypto(result);
//   };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Links
        </Button>
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/links')}>
          View All Links
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request a Payment</CardTitle>
          <CardDescription>Fill in the details to generate a unique payment link.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Product Name */}
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product/Service Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Design Consultation, T-Shirt XL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Description */}
              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add details about the product or service..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Currency Selection */}
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Currency *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crypto (e.g., SOL)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableCurrencies.map(curr => (
                          <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The cryptocurrency your customer will pay with.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount in Fiat (ETB) */}
              <FormField
                control={form.control}
                name="amountFiat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ({fiatCurrency}) *</FormLabel>
                    <FormControl>
                      {/* Use type="number" but handle string conversion via coerce */}
                      <Input type="number" step="0.01" placeholder="e.g., 1500.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the price in {fiatCurrency}. The crypto amount will be calculated.
                      {/* {estimatedCrypto && ` ≈ ${estimatedCrypto} ${form.watch('currency')}`} */}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

               {/* Remark (Optional) */}
              <FormField
                control={form.control}
                name="remark"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remark (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Internal note or memo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              {/* Required Customer Information */}
              <FormField
                control={form.control}
                name="requiredCustomerInfo"
                render={() => (
                  <FormItem>
                     <div className="mb-4">
                        <FormLabel className="text-base">Required Customer Information (Optional)</FormLabel>
                        <FormDescription>
                          Select any details you need to collect from the customer on the payment page.
                        </FormDescription>
                      </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {requiredInfoOptions.map((item) => (
                           <FormField
                             key={item.id}
                             control={form.control}
                             name="requiredCustomerInfo"
                             render={({ field }) => {
                               return (
                                 <FormItem
                                   key={item.id}
                                   className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3"
                                 >
                                   <FormControl>
                                     <Checkbox
                                       checked={field.value?.includes(item.id)}
                                       onCheckedChange={(checked) => {
                                         return checked
                                           ? field.onChange([...(field.value ?? []), item.id])
                                           : field.onChange(
                                               field.value?.filter(
                                                 (value) => value !== item.id
                                               )
                                             );
                                       }}
                                     />
                                   </FormControl>
                                   <FormLabel className="font-normal leading-snug">
                                     {item.label}
                                   </FormLabel>
                                 </FormItem>
                               );
                             }}
                           />
                        ))}
                     </div>
                     <FormMessage />
                  </FormItem>
                )}
              />


              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Payment Link
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setShowSuccessDialog(false);
        }
      }}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="space-y-3 text-center">
            <DialogTitle className="text-xl">Payment Link Created!</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your payment link has been generated successfully. Share it with your customer.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 mb-6">
            <PaymentLinkDisplay link={paymentLink} />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="default"
              className="w-full bg-black text-white hover:bg-black/90"
              onClick={() => {
                setShowSuccessDialog(false);
                form.reset();
              }}
            >
              Create Another Link
            </Button>
            <Button
              variant="secondary"
              className="w-full bg-neutral-100 hover:bg-neutral-200 text-black"
              onClick={() => {
                setShowSuccessDialog(false);
                router.push('/dashboard/links');
              }}
            >
              View All Links
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(paymentLink, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}