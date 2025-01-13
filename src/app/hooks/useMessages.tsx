"use client";

import { getMessagesForRoom } from "@/actions/room.action";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export const useMessages = (roomId: string, senderId: string) => {
  type Message = {
    id: string;
    content: string;
    senderId: string;
    roomId: string;
    createdAt: Date;
    sender: {
      id: string;
      username: string;
      image: string | null;
    };
  };

  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch all messages
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await getMessagesForRoom(roomId);
      setMessages(response); // Update state with messages
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch messages",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch when the component is mounted
    fetchMessages();

    const messagesChannel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen for all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "Message",
          filter: `roomId=eq.${roomId}`, // Filter for messages from the specific room
        },
        async (payload) => {
          // Refetch messages when there's a change
          console.log("Payload received:", payload); // Debugging purpose
          await fetchMessages(); // Refetch messages after a change
        }
      )
      .subscribe();

    // Cleanup on unmount: Unsubscribe from the channel
    return () => {
      messagesChannel.unsubscribe();
    };
  }, [roomId, toast]);

  return { messages, isLoading };
};
