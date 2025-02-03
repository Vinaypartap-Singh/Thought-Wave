"use client";

import { getMessagesForRoom, sendMessage } from "@/actions/room.action";
import getAcceptedChatRequests from "@/actions/user.action";
import Loader from "@/components/Loader";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  decryptMessage,
  encryptMessage,
  generateKey,
} from "@/utils/encryption";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ChatPage() {
  const { toast } = useToast();

  interface Chat {
    id: string;
    senderId: string;
    receiverId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "NOT_REQUESTED";
    createdAt: Date;
    senderEncryptionKey?: string | null;
    sender: {
      id: string;
      username: string;
      name: string | null;
      image: string | null;
      encryptionKey: string | null;
    };
    roomId: string | null;
  }

  const [acceptedChats, setAcceptedChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // States for handling Chat Screen and Message Screen Ui

  const [showChatScreen, setShowChatScreen] = useState<boolean>(true);
  const [showMessageScreen, setShowMessageScreen] = useState<boolean>(false);
  const [showCloseIcon, setShowCloseIcon] = useState<boolean>(false);

  interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: Date;
    senderEncryptionKey?: string | null; // Added this field for sender's encryption key
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<{
    roomId: string;
    senderId: string;
    encryptedKey?: string | null;
  } | null>(null);
  const [newMessage, setNewMessage] = useState(""); // state to store the new message
  const [sending, setSending] = useState(false); // state for sending status
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchAcceptedChats() {
      try {
        const { success, acceptedChatRequests, error } =
          await getAcceptedChatRequests();
        if (success) {
          setAcceptedChats(acceptedChatRequests || []);
        } else {
          setError(error || "Failed to fetch chat requests.");
        }
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    fetchAcceptedChats();
  }, []);

  const fetchMessages = async (roomId: string) => {
    setIsLoading(true);
    try {
      const response = await getMessagesForRoom(roomId);

      const decryptedMessages = await Promise.all(
        response.map(async (message: any) => {
          const encryptionKey = message.senderEncryptionKey!;

          if (encryptionKey) {
            const { iv, content } = message;

            const ivArrayBuffer = base64ToArrayBuffer(iv);
            const encryptedContentArrayBuffer = base64ToArrayBuffer(content);
            const encryptionKeyBuffer = base64ToArrayBuffer(encryptionKey);

            const decryptedMessage = await decryptMessage(
              encryptionKeyBuffer,
              ivArrayBuffer,
              encryptedContentArrayBuffer
            );

            return {
              ...message,
              content: decryptedMessage,
              decrypted: true,
            };
          }

          return message;
        })
      );

      setMessages(decryptedMessages);
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

  const fetchMessagesAgain = async (roomId: string) => {
    try {
      const response = await getMessagesForRoom(roomId);

      const decryptedMessages = await Promise.all(
        response.map(async (message: any) => {
          const encryptionKey = message.senderEncryptionKey!;

          if (encryptionKey) {
            const { iv, content } = message;

            const ivArrayBuffer = base64ToArrayBuffer(iv);
            const encryptedContentArrayBuffer = base64ToArrayBuffer(content);
            const encryptionKeyBuffer = base64ToArrayBuffer(encryptionKey);

            const decryptedMessage = await decryptMessage(
              encryptionKeyBuffer,
              ivArrayBuffer,
              encryptedContentArrayBuffer
            );

            return {
              ...message,
              content: decryptedMessage,
              decrypted: true,
            };
          }

          return message;
        })
      );

      setMessages(decryptedMessages);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to fetch messages",
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Handle button click to set the selected chat and fetch messages
  const handleChatButtonClick = (
    roomId: string,
    senderId: string,
    encryptedKey: string
  ) => {
    setSelectedChat({
      roomId: roomId || "",
      senderId: senderId,
      encryptedKey: encryptedKey,
    });
    fetchMessages(roomId);
    setShowChatScreen(false);
    setShowMessageScreen(true);
    setShowCloseIcon(true);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    let encryptionKey =
      selectedChat?.encryptedKey ||
      acceptedChats.find((chat) => chat.senderId === selectedChat?.senderId)
        ?.senderEncryptionKey;

    // If no encryption key found, generate one and store it
    if (!encryptionKey) {
      const key = await generateKey(); // Generate a new key
      encryptionKey = arrayBufferToBase64(
        await crypto.subtle.exportKey("raw", key)
      ); // Convert key to base64 string
    }

    if (!encryptionKey) {
      setError("Encryption key is missing.");
      return;
    }

    setSending(true);
    try {
      const encryptionKeyBuffer = base64ToArrayBuffer(encryptionKey);
      const { iv, encryptedData } = await encryptMessage(
        encryptionKeyBuffer,
        newMessage
      );
      const encryptedContent = arrayBufferToBase64(encryptedData.buffer);
      const ivBase64 = arrayBufferToBase64(iv.buffer);

      const sentMessage = await sendMessage(
        selectedChat?.roomId!,
        encryptedContent,
        ivBase64,
        encryptionKey
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: crypto.randomUUID(),
          senderId: "You",
          content: newMessage,
          createdAt: new Date(),
        },
      ]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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

  const handleShowChatScreen = () => {
    setShowChatScreen(true);
    setShowMessageScreen(false);
    setShowCloseIcon(false);
  };

  useEffect(() => {
    const messagesChannel = supabase
      .channel("custom-insert-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `roomId=eq.${selectedChat?.roomId}`,
        },
        (payload) => {
          fetchMessagesAgain(selectedChat?.roomId || "");
        }
      )
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
    };
  }, [selectedChat?.roomId, messages]);

  const scrollDown = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollDown();
  }, [messages]);

  return (
    <div className="flex flex-col sm:flex-row min-h-[calc(100vh-14rem)] antialiased text-foreground bg-background shadow-md border border-border relative">
      {/* Sidebar */}
      <div
        className={`flex flex-col w-full ${
          showMessageScreen ? "sm:w-0" : "sm:w-64"
        } bg-card text-card-foreground border-r border-border`}
      >
        <div
          className={`flex justify-between items-center h-14 border-b border-border px-4 ${
            showMessageScreen ? "absolute top-0 w-full z-10 bg-background" : ""
          }`}
        >
          <h1 className="text-xl font-bold text-start">Messages</h1>
          {showCloseIcon && (
            <Button variant={"ghost"} onClick={handleShowChatScreen}>
              <X />
            </Button>
          )}
        </div>
        <div
          className={`overflow-y-auto ${showChatScreen ? "block" : "hidden"}`}
        >
          {loading && (
            <div className="p-4 text-center text-muted-foreground">
              Loading...
            </div>
          )}
          {error && <div className="p-4 text-center text-red-500">{error}</div>}
          {!loading && !error && acceptedChats.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No chats available.
            </div>
          )}
          {!loading &&
            !error &&
            acceptedChats.map((chat) => (
              <Button
                key={chat.sender.id}
                className="w-full rounded-none cursor-pointer justify-start"
                style={{ padding: "32px" }}
                asChild
                variant={"outline"}
                onClick={() =>
                  handleChatButtonClick(
                    chat.roomId || "",
                    chat.sender.id,
                    chat.sender.encryptionKey || ""
                  )
                }
              >
                <div className="flex justify-start items-center px-4 py-3 hover:bg-muted">
                  <div>
                    <Avatar>
                      <AvatarImage
                        src={chat.sender.image || `/avatar.png`}
                        className="object-cover rounded-full"
                      />
                    </Avatar>
                  </div>
                  <div className="ml-3 w-[200px]">
                    <div className="font-semibold">{chat.sender.name}</div>
                    <div className="text-sm text-muted-foreground">
                      @{chat.sender.username}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
        </div>
      </div>

      {/* Chat Area */}
      {showMessageScreen ? (
        <div
          className={`flex-1 p-4 min-h-[calc(100vh-14rem)] ${
            showMessageScreen ? "py-16" : ""
          }`}
        >
          {selectedChat ? (
            <div className="w-full h-full">
              <div
                ref={scrollAreaRef}
                className="flex flex-col h-[calc(100vh-20rem)] overflow-y-auto hide-scrollbar"
              >
                {isLoading ? (
                  <div className="h-full flex items-center justify-center gap-4">
                    <Loader /> Loading messages...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message: any, idx: number) => (
                    <div
                      key={message.id}
                      className={`col-start-${
                        message?.senderId === selectedChat?.senderId ? 6 : 1
                      } col-end-13 p-3 rounded-lg`}
                    >
                      <div
                        className={`flex ${
                          message?.senderId === selectedChat?.senderId
                            ? "flex-row"
                            : "flex-row-reverse"
                        } items-center gap-2`}
                      >
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-black flex-shrink-0">
                          {message.sender?.username.charAt(0).toUpperCase()}
                        </div>
                        <div
                          className={`relative ${
                            message?.senderId === selectedChat?.senderId
                              ? "mr-3"
                              : "ml-3"
                          } text-sm bg-muted py-2 px-4 shadow rounded-xl border border-border`}
                        >
                          <div className="text-muted-foreground">
                            {message?.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex justify-center items-center">
                    No messages yet.
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="mt-6 flex items-center gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onKeyDown={handleKeyPress}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 p-2 border border-muted rounded-l-md"
                  placeholder="Type a message"
                />
                <Button
                  variant="default"
                  onClick={handleSendMessage}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex justify-center items-center">
              <div>Select a chat to start messaging</div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 p-4 min-h-[calc(100vh-14rem)]">
          {/* <div className="h-full flex justify-center items-center">
            <div>Select a chat to start messaging</div>
          </div> */}
        </div>
      )}
    </div>
  );
}
