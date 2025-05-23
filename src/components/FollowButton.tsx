"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toggleFollow } from "@/actions/user.action";
// import toast from "react-hot-toast";
// import { toggleFollow } from "@/actions/user.action";

function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFollow = async () => {
    setIsLoading(true);

    try {
      await toggleFollow(userId);
      toast({
        title: "User followed",
        description: "You are now following this user",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to follow user",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : "Follow"}
    </Button>
  );
}
export default FollowButton;
