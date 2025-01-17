"use client";

import { createStore, getStoreInfo } from "@/actions/store.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase";
import Image from "next/image";
import { useEffect, useState } from "react";

type StoreInfo = {
  name: string;
  image: string | null;
};

export default function StorePage() {
  const { toast } = useToast();
  const [editForm, setEditForm] = useState<StoreInfo>({
    name: "",
    image: "",
  });
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
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

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const data = await getStoreInfo();
        setStoreInfo(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch store information.",
        });
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
          {storeInfo ? (
            <div className="space-y-4">
              <div className="space-y-2 relative">
                {storeInfo.image && (
                  <>
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
                  </>
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
