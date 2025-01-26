"use client";

import { updatePost } from "@/actions/post.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase";
import { ImageIcon, Loader2Icon, NotebookPen, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export default function UpdatePost({
  postId,
  oldContent,
}: {
  postId: string;
  oldContent: string;
}) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const url = await uploadImageToSupabase(file);
      if (url) {
        setImageUrl(url);
        toast({ title: "Image uploaded successfully" });
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdatePost = async () => {
    if (isUpdating) return;
    try {
      setIsUpdating(true);
      const result = await updatePost(postId, newContent, imageUrl);
      if (result.success) {
        toast({
          title: "Post updated",
          description: "Your post has been updated successfully",
        });
      } else throw new Error(result.error);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update post",
        description:
          (error as Error)?.message ||
          "An error occurred while updating your post",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-red-500 -mr-2"
        >
          {isUpdating ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <NotebookPen className="size-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Post</DialogTitle>
          <DialogDescription className="mt-5"></DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-y-4">
            <Label htmlFor="name">New Content</Label>
            <Textarea
              placeholder={oldContent ?? "Write something..."}
              id="name"
              value={newContent ? newContent : oldContent}
              className="col-span-3"
              onChange={(e) => setNewContent(e.target.value)}
            />
          </div>

          {imageUrl && (
            <div className="relative size-40">
              <Image
                src={imageUrl}
                alt="New Image"
                className="rounded-md w-full object-cover"
                width={500}
                height={500}
              />
              <button
                onClick={() => setImageUrl("")}
                className="absolute top-0 right-0 p-1 bg-red-500 rounded-full shadow-sm"
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary"
              disabled={isUpdating || isUploading}
            >
              <label className="cursor-pointer flex items-center">
                <ImageIcon className="size-4 mr-2" />
                <span>Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleUpdatePost}
            className="bg-gray-200 hover:bg-gray-300"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
