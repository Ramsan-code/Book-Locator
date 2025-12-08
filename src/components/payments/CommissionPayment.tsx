"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { transactionService } from "@/services";
import { useAuth } from "@/contexts/AuthContext";

interface CommissionPaymentProps {
  transaction: any;
  onPaymentComplete: () => void;
  role: 'buyer' | 'seller';
}

export function CommissionPayment({ transaction, onPaymentComplete, role }: CommissionPaymentProps) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const commissionAmount = transaction.commissionAmount || (transaction.price * 0.08);

  const handlePayment = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock payment ID
      const mockPaymentId = `pay_${Math.random().toString(36).substring(7)}`;
      
      // Call API to record payment
      await transactionService.payCommission(token, transaction._id, mockPaymentId, role);
      
      setIsSuccess(true);
      toast.success("Commission payment successful!");
      
      // Close after a brief delay to show success state
      setTimeout(() => {
        setIsOpen(false);
        onPaymentComplete();
        // Reset state after closing
        setTimeout(() => {
          setIsSuccess(false);
        }, 500);
      }, 2000);
      
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-success hover:bg-success/90">
          Pay Rs. {commissionAmount.toFixed(2)} Commission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Commission Fee</DialogTitle>
          <DialogDescription>
            To receive contact details, a small platform fee is required.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-success animate-in zoom-in duration-300" />
            <p className="text-lg font-medium text-success">Payment Successful!</p>
            <p className="text-sm text-muted-foreground text-center">
              Thank you for your payment. We'll verify it shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
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
            
            <div className="text-xs text-muted-foreground bg-info/10 text-info p-3 rounded border border-info/20">
              <strong>Note:</strong> This is a secure payment for the platform fee only. The book price (Rs. {transaction.price}) will be paid directly to the {role === 'buyer' ? 'seller' : 'buyer'} when you meet.
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-start">
          {!isSuccess && (
            <Button 
              type="button" 
              className="w-full bg-success hover:bg-success/90" 
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
