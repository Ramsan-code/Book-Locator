"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { transactionService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_51ScfXORTB2YkuQm7cuJeotgUQI32T2ymJeG3LmFJUO0bi10uLc0LKg49i30j1W9Fk7nZjiOAQmaPQ0oJ0ObSGlTv00jEbrsvW3");

interface CommissionPaymentProps {
  transaction: any;
  onPaymentComplete: () => void;
  role: 'buyer' | 'seller';
}

function CheckoutForm({ transaction, role, onPaymentComplete, clientSecret }: CommissionPaymentProps & { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { token } = useAuth();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "An unexpected error occurred.");
        setIsLoading(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded, now record it in backend
        await transactionService.payCommission(token, transaction._id, paymentIntent.id, role);
        
        setIsSuccess(true);
        toast.success("Commission payment successful!");
        
        setTimeout(() => {
          onPaymentComplete();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("An error occurred while processing your payment.");
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-4">
        <CheckCircle2 className="h-16 w-16 text-success animate-in zoom-in duration-300" />
        <p className="text-lg font-medium text-success">Payment Successful!</p>
        <p className="text-sm text-muted-foreground text-center">
          Thank you for your payment. We'll verify it shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
          {errorMessage}
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full bg-success hover:bg-success/90"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay Rs. ${(transaction.commissionAmount || (transaction.price * 0.08)).toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export function CommissionPayment({ transaction, onPaymentComplete, role }: CommissionPaymentProps) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [isLoadingSecret, setIsLoadingSecret] = React.useState(false);

  const commissionAmount = transaction.commissionAmount || (transaction.price * 0.08);

  React.useEffect(() => {
    if (isOpen && token && !clientSecret) {
      const fetchClientSecret = async () => {
        setIsLoadingSecret(true);
        try {
          const data = await transactionService.createPaymentIntent(token, transaction._id, role);
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error("Error fetching payment intent:", error);
          toast.error("Failed to initialize payment. Please try again.");
          setIsOpen(false);
        } finally {
          setIsLoadingSecret(false);
        }
      };
      
      fetchClientSecret();
    }
  }, [isOpen, token, transaction._id, role, clientSecret]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-success hover:bg-success/90">
          Pay Rs. {commissionAmount.toFixed(2)} Commission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay Commission Fee</DialogTitle>
          <DialogDescription>
            To receive contact details, a small platform fee is required.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3 border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Book Price:</span>
              <span className="font-medium">Rs. {transaction.price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Commission (8%):</span>
              <span className="font-medium">Rs. {commissionAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total to Pay:</span>
              <span className="text-success">Rs. {commissionAmount.toFixed(2)}</span>
            </div>
          </div>
          
          {isLoadingSecret ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                transaction={transaction} 
                role={role} 
                onPaymentComplete={() => {
                  onPaymentComplete();
                  setTimeout(() => setIsOpen(false), 2000);
                }} 
                clientSecret={clientSecret}
              />
            </Elements>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Initializing payment...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
