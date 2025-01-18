"use client";

import { uploadProductToStore } from "@/actions/store.action"; // Import your action
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase";
import { useState } from "react";

export default function AddProductPage() {
  const { toast } = useToast();
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
  });
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadImageToSupabase(file);
      if (url) {
        setProductForm((prev) => ({ ...prev, image: url }));
        toast({ title: "Image uploaded successfully" });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const addProduct = async () => {
    const { name, description, price, image } = productForm;

    if (!name || !price || !image) {
      toast({
        variant: "destructive",
        title: "Incomplete Details",
        description:
          "Please provide all required fields: name, price, and image.",
      });
      return;
    }

    try {
      await uploadProductToStore(name, description, price, image);
      toast({
        title: "Product Added",
        description: "Your product has been successfully added.",
      });
      setProductForm({ name: "", description: "", price: 0, image: "" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add product.",
      });
    }
  };

  return (
    <div className="max-w-lg w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Add New Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                name="name"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Product name"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                name="description"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Product description (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                name="price"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="Product price"
              />
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
              {productForm.image && (
                <img
                  src={productForm.image}
                  alt="Uploaded Product"
                  className="mt-2 h-auto rounded-md w-full object-cover"
                />
              )}
            </div>

            <div className="space-y-2">
              <Button
                disabled={uploading}
                className="w-full"
                onClick={addProduct}
              >
                {uploading ? "Uploading..." : "Add Product"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
