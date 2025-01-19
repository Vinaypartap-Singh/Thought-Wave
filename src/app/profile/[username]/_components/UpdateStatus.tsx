"use client";

import { updateStatus } from "@/actions/store.action";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { OrderStatus } from "@prisma/client";
import { useState } from "react";

export default function UpdateStatus({ orderId }: { orderId: string }) {
  const id = orderId;
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus | null>(null); // Use OrderStatus here
  const handleStatusUpdate = async () => {
    if (!status) return;
    try {
      await updateStatus(id, status); // Pass the correct type
      window.location.reload();
      toast({
        title: "Status Updated",
        description: "Order status has been updated.",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "An Error Occurred",
        description: "Failed to update status.",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full mt-3">
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Mark the Order As{" "}
            {status &&
              status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="">
            <Select
              name="profileType"
              onValueChange={(value) => setStatus(value as OrderStatus)} // Cast to OrderStatus
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderStatus.COMPLETED}>Complete</SelectItem>
                <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleStatusUpdate}>Update Status</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
