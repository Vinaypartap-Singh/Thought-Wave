"use client";

import { placeOrder } from "@/actions/store.action";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type PlaceOrderButtonProps = {
  userId: string;
  storeId: string;
  productId: string;
  quantity: number;
};

export default function PlaceOrderButton({
  userId,
  storeId,
  productId,
  quantity,
}: PlaceOrderButtonProps) {
  const { toast } = useToast();

  const handlePlaceOrder = async (
    userId: string,
    storeId: string,
    productId: string,
    quanitity: number
  ) => {
    try {
      await placeOrder(userId, storeId, productId, quanitity);
      toast({
        title: "Order Placed",
        description:
          "Your order has been placed successfully. The order will be visible in your profile. ",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Order Failed",
        description: "Failed to place your order. Please try again.",
      });
    }
  };

  return (
    <Button
      onClick={async () =>
        await handlePlaceOrder(userId!, storeId!, productId!, quantity!)
      }
    >
      Place Order
    </Button>
  );
}
