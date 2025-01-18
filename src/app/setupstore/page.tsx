"use client";

import {
  createStore,
  getProductsofStore,
  getStoreInfo,
} from "@/actions/store.action"; // Import your actions
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase";
import { formatPrice } from "@/utils/formatPrice";
import { CirclePlus, Shirt } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AddProductPage from "./_components/AddProductToStore";

type StoreInfo = {
  name: string;
  image: string | null;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string;
};

export default function StorePage() {
  const { toast } = useToast();
  const [editForm, setEditForm] = useState<StoreInfo>({
    name: "",
    image: "",
  });
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const url = await uploadImageToSupabase(file);
      if (url) {
        setEditForm((prev) => ({ ...prev, image: url }));
        toast({ title: "Image uploaded successfully" });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const setupStore = async () => {
    if (!editForm.name || !editForm.image) {
      toast({
        variant: "destructive",
        title: "Please Fill The Details",
        description: "Please fill the store name and upload a store image.",
      });
      return;
    }

    try {
      await createStore(editForm.name, editForm.image);
      toast({
        title: "Store Created",
        description: "Your store has been successfully created.",
      });
      setStoreInfo(editForm);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set up the store.",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      const productData = await getProductsofStore();
      setProducts(productData || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch products.",
      });
    }
  };

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        setLoading(true);
        const data = await getStoreInfo();
        setStoreInfo(data);

        if (data) {
          await fetchProducts();
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch store information.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStoreInfo();
  }, []);

  return (
    <div className="max-w-lg w-full">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Welcome to {storeInfo?.name ? storeInfo.name : "Your Store"}
          </CardTitle>
          <p className="text-muted-foreground mb-4">
            {storeInfo ? "Your Store Details" : "Setup Your Store"}
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader />
            </div>
          ) : storeInfo ? (
            <div className="space-y-4">
              <div className="space-y-2">
                {storeInfo.image && (
                  <div>
                    <div className="relative">
                      <Image
                        src={storeInfo.image}
                        alt="Store"
                        height={700}
                        width={700}
                        className="mt-2 h-auto rounded-md w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-md"></div>
                      <p className="absolute bottom-5 left-5 font-bold text-white">
                        {storeInfo.name}
                      </p>
                    </div>

                    <Tabs defaultValue="products" className="w-full mt-5">
                      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger
                          value="products"
                          className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
                        >
                          <Shirt className="size-4" />
                          Your Products
                        </TabsTrigger>
                        <TabsTrigger
                          value="newProduct"
                          className="flex items-center gap-2 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary
               data-[state=active]:bg-transparent px-6 font-semibold"
                        >
                          <CirclePlus className="size-4" />
                          Add New Product
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="products" className="mt-6">
                        <div className="space-y-6 flex gap-4">
                          {products?.length > 0 ? (
                            products.map((product: any) => (
                              <div
                                key={product.id}
                                className="w-1/2 flex flex-col gap-4"
                              >
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={700}
                                  height={700}
                                  className="rounded-md object-cover w-full"
                                />
                                <div>
                                  <h3 className="font-bold text-sm">
                                    {product.name}
                                  </h3>
                                  <p className="text-primary text-sm">
                                    Price: {formatPrice(product.price)}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground">
                              No products available yet. Start adding products
                              to showcase your store's offerings!
                            </p>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="newProduct" className="mt-6">
                        <div className="space-y-6">
                          <AddProductPage />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Store Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Your store name"
                />
              </div>

              <div className="space-y-2">
                <Label>Store Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {editForm.image && (
                  <img
                    src={editForm.image}
                    alt="Uploaded Store"
                    className="mt-2 h-auto rounded-md w-full object-cover"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Button
                  disabled={uploading}
                  className="w-full"
                  onClick={setupStore}
                >
                  {uploading ? "Uploading..." : "Setup Store"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
