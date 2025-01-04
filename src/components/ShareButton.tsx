import { Copy, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function ShareButton({ postId }: { postId: string }) {
  const { toast } = useToast();

  const websiteUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
  const postLink = `${websiteUrl}/${postId}`;

  const copyPostUrl = () => {
    navigator.clipboard
      .writeText(postLink)
      .then(() => {
        toast({
          title: "Link copied",
          description: "The link has been copied to your clipboard.",
        });
      })
      .catch((error) => {
        toast({
          title: "Error copying link",
          description: error.message,
        });
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-2 hover:text-green-500"
        >
          <Send />
          <span>0</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" defaultValue={postId && postLink} readOnly />
          </div>
          <Button
            type="submit"
            size="sm"
            className="px-3"
            onClick={copyPostUrl}
          >
            <span className="sr-only">Copy</span>
            <Copy />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
