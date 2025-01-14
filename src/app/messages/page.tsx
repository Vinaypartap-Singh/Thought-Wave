"use client";

import { getMessagesForRoom, sendMessage } from "@/actions/room.action";
import getAcceptedChatRequests from "@/actions/user.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

export default function ChatPage() {
  const { toast } = useToast();
  interface Chat {
    id: string;
    senderId: string;
    receiverId: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED" | "NOT_REQUESTED";
    createdAt: Date;
    sender: {
      id: string;
      username: string;
      name: string | null;
      image: string | null;
    };
    roomId: string | null;
  }

  const [acceptedChats, setAcceptedChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  interface Message {
    sender: string;
    text: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<{
    roomId: string;
    senderId: string;
  } | null>(null);
  const [newMessage, setNewMessage] = useState(""); // state to store the new message
  const [sending, setSending] = useState(false); // state for sending status

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

  // Fetch messages for the selected chat
  const fetchMessages = async (roomId: string) => {
    setIsLoading(true);
    try {
      const response = await getMessagesForRoom(roomId);
      setMessages(response); // Assuming this is an array of messages
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

  // Handle button click to set the selected chat and fetch messages
  const handleChatButtonClick = (roomId: string, senderId: string) => {
    setSelectedChat({ roomId, senderId });
    fetchMessages(roomId); // Fetch messages for the selected chat
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    setSending(true);
    try {
      await sendMessage(selectedChat?.roomId!, newMessage);

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "You", text: newMessage },
      ]);
      setNewMessage("");
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

  return (
    <div className="flex flex-col sm:flex-row min-h-[calc(100vh-14rem)] antialiased text-foreground bg-background shadow-md border border-border">
      {/* Sidebar */}
      <div className="flex flex-col w-full sm:w-64 bg-card text-card-foreground border-r border-border">
        <div className="flex items-center h-14 border-b border-border px-4">
          <h1 className="text-xl font-bold text-start">Messages</h1>
        </div>
        <div className="overflow-y-auto">
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
                className="w-full rounded-none cursor-pointer"
                style={{ padding: "32px" }}
                asChild
                variant={"outline"}
                onClick={() =>
                  handleChatButtonClick(chat.roomId || "", chat.sender.id)
                }
              >
                <div className="flex justify-start items-center px-4 py-3 hover:bg-muted">
                  <div className="relative w-12 h-12">
                    <Avatar>
                      <AvatarImage
                        src={chat.sender.image || `/avatar.png`}
                        className="object-cover w-full h-full rounded-full"
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
      <div className="flex-1 p-4">
        {selectedChat ? (
          <div className="w-full h-full">
            <div className="flex flex-col-reverse">
              {isLoading ? (
                <p>Loading messages...</p>
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
                <p>No messages found.</p>
              )}
            </div>

            {/* Message Input and Send Button */}
            <div className="flex items-center mt-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-muted rounded-l-md"
              />
              <Button
                className="ml-2"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
              >
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            Click on User Profile To View Chat.
          </div>
        )}
      </div>
    </div>
  );
}
