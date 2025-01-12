import { RequestRejected } from "@/actions/user.action";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export const useRejectedChatRequests = () => {
  type ChatRequest = {
    id: string;
    status: "not_requested" | "pending" | "accepted" | "rejected";
    senderId: string;
    receiverId: string;
    createdAt: Date;
    sender: {
      image: string | null;
      id: string;
      username: string;
      name: string | null;
    };
  };

  const { toast } = useToast();
  const [rejectedRequests, setRejectedRequests] = useState<ChatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRejectedChatRequests = async () => {
      setIsLoading(true);
      try {
        const response = await RequestRejected();

        if (response.success && Array.isArray(response.chatRequests)) {
          setRejectedRequests(
            response.chatRequests.map((request: any) => ({
              ...request,
              status: request.status.toLowerCase(),
            }))
          );
        } else {
          toast({
            variant: "destructive",
            title: "Failed to fetch rejected chat requests",
            description: response.error || "Unknown error",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch rejected chat requests",
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRejectedChatRequests();

    const rejectedChatRequestsChannel = supabase
      .channel("custom-rejected-chat-requests-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ChatRequest" },
        (payload) => {
          const newChatRequest = payload.new as ChatRequest;
          if (newChatRequest.status === "rejected") {
            setRejectedRequests((prevRequests) => [
              ...prevRequests,
              newChatRequest,
            ]);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      rejectedChatRequestsChannel.unsubscribe();
    };
  }, [toast]);

  return { rejectedRequests, isLoading };
};
