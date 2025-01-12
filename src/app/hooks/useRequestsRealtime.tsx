"use client";

import { getChatRequests } from "@/actions/user.action";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export const useChatRequests = () => {
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
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChatRequests = async () => {
      setIsLoading(true);
      try {
        const response = await getChatRequests();

        if (response.success && Array.isArray(response.chatRequests)) {
          setChatRequests(
            response.chatRequests.map((request: any) => ({
              ...request,
              status: request.status.toLowerCase(),
            }))
          );
        } else {
          toast({
            variant: "destructive",
            title: "Failed to fetch chat requests",
            description: response.error || "Unknown error",
          });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch chat requests",
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatRequests();

    const chatRequestsChannel = supabase
      .channel("custom-chat-requests-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ChatRequest" },
        (payload) => {
          const newChatRequest = payload.new as ChatRequest;
          setChatRequests((prevChatRequests) => [
            ...prevChatRequests,
            newChatRequest,
          ]);
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      chatRequestsChannel.unsubscribe();
    };
  }, [toast]);

  return { chatRequests, isLoading };
};
