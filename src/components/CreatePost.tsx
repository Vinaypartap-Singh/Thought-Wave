"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { ImageIcon, Loader2Icon, SendIcon, X } from "lucide-react";
import { Button } from "./ui/button";
import { createPost } from "@/actions/post.action";
import { useToast } from "@/hooks/use-toast";
import { uploadImageToSupabase } from "@/lib/uploadImageToSupabase"; // Adjust the path as needed

function CreatePost() {
  const { toast } = useToast();
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

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

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return;

    setIsPosting(true);
    try {
      const result = await createPost(content, imageUrl);
      if (result?.success) {
        // Reset the form
        setContent("");
        setImageUrl("");

        toast({ title: "Post created successfully" });
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast({ title: "Failed to create post", variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  const unSafeImage = user?.unsafeMetadata?.imageUrl;

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex space-x-4">
            <Avatar className="size-12">
              <AvatarImage
                src={
                  (unSafeImage as string) ||
                  (user?.imageUrl as string) ||
                  "/avatar.png"
                }
                className="object-cover"
              />
            </Avatar>
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[100px] resize-none border-none focus-visible:ring-0 p-0 text-base"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
          </div>

          {imageUrl && (
            <div className="relative size-40">
              <img
                src={imageUrl}
                alt="Uploaded"
                className="rounded-md size-40 object-cover"
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

          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary"
                disabled={isUploading || isPosting}
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
            <Button
              className="flex items-center"
              onClick={handleSubmit}
              disabled={
                (!content.trim() && !imageUrl) || isPosting || isUploading
              }
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="size-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <SendIcon className="size-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatePost;
