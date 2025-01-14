"use client";

import { getMessagesForRoom, sendMessage } from "@/actions/room.action";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useRef, useState } from "react";

export default function ChatArea({
  roomId,
  senderId,
}: {
  roomId: string;
  senderId: string;
}) {
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
  const [messageContent, setMessageContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await getMessagesForRoom(roomId);
      console.log(response);
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
  };

  const handleSendMessage = async () => {
    if (messageContent.trim() === "") return;

    setSending(true);
    try {
      await sendMessage(roomId, messageContent);
      setMessageContent("");
    } catch (error) {
      setError("Error sending message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollDown = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
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
          // Fetch messages again upon new message insert
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
    };
  }, [roomId]);

  useEffect(() => {
    scrollDown();
  }, [messages]);

  return (
    <div className="flex flex-col flex-auto bg-card h-[80vh] w-full">
      <div className="flex flex-col flex-auto h-[80vh] p-4">
        <div className="flex flex-col h-[80vh] mb-4">
          <div
            ref={scrollAreaRef}
            className="flex flex-col h-[70vh] overflow-y-auto hide-scrollbar"
          >
            <div className="flex flex-col-reverse">
              {isLoading && (
                <div className="col-span-12 p-3 text-center">
                  Loading messages...
                </div>
              )}
              {error && (
                <div className="col-span-12 p-3 text-center text-red-500">
                  {error}
                </div>
              )}
              {!isLoading && !error && messages.length === 0 && (
                <div className="col-span-12 p-3 text-center">
                  No messages available.
                </div>
              )}
              {!isLoading &&
                !error &&
                messages.length > 0 &&
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`col-start-${
                      message?.senderId === senderId ? 6 : 1
                    } col-end-13 p-3 rounded-lg`}
                  >
                    <div
                      className={`flex ${
                        message?.senderId === senderId
                          ? "flex-row"
                          : "flex-row-reverse"
                      } items-center gap-2`}
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-black flex-shrink-0">
                        {message.sender?.username.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className={`relative ${
                          message?.senderId === senderId ? "mr-3" : "ml-3"
                        } text-sm bg-muted py-2 px-4 shadow rounded-xl border border-border`}
                      >
                        <div className="text-muted-foreground">
                          {message?.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center h-16 rounded-xl bg-muted w-full px-4 border-t border-border">
          <div className="flex-grow ml-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Type a message"
                className="flex w-full border border-border rounded-md focus:outline-none focus:border-primary pl-4 h-10 bg-input text-foreground"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>
          <div className="ml-4">
            <Button onClick={handleSendMessage} disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
