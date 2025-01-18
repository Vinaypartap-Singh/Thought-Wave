"use client";

import { deleteProduct } from "@/actions/store.action";
import { Button } from "@/components/ui/button";

const handleDeleteProduct = async (productId: string) => {
  try {
    await deleteProduct(productId);
  } catch (error) {
    console.log(error);
  }
};

export default function DeleteButton({ productId }: { productId: string }) {
  return (
    <Button
      onClick={() => handleDeleteProduct(productId)}
      className="w-full"
      variant={"outline"}
    >
      Delete Product
    </Button>
  );
}
