"use client";

import { getMessagesForRoom } from "@/actions/room.action";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useCallback, useEffect, useState } from "react";

export const useMessages = (roomId: string) => {
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

  // Function to fetch messages
  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMessagesForRoom(roomId);
      setMessages(response);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch messages",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  }, [roomId, toast]);

  // Function to handle new messages
  const handleNewMessage = (newMessage: Message) => {
    setMessages((prevMessages) => {
      // Avoid duplicates in case of re-inserted messages
      if (prevMessages.some((msg) => msg.id === newMessage.id)) {
        return prevMessages;
      }
      return [...prevMessages, newMessage];
    });
  };

  useEffect(() => {
    // Fetch initial messages
    fetchMessages();

    // Subscribe to real-time updates
    const messagesChannel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `roomId=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          handleNewMessage(newMessage);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      messagesChannel.unsubscribe();
    };
  }, [fetchMessages, roomId]); // No `messages` dependency here

  return { messages, isLoading };
};
