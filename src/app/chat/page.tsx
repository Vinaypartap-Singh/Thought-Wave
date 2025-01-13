"use client";

import getAcceptedChatRequests from "@/actions/user.action";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ChatArea from "./_components/ChatComponent";

export default function ChatPage() {
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
    roomId: string | null; // Add roomId to the Chat interface
  }

  const [acceptedChats, setAcceptedChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null); // State to store roomId

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

  // Handle button click to set the roomId
  const handleChatButtonClick = (roomId: string) => {
    setSelectedRoomId(roomId);
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
                className="w-full rounded-none"
                style={{ padding: "32px" }}
                asChild
                variant={"outline"}
                onClick={() => handleChatButtonClick(chat.roomId || "")} // Set roomId on click
              >
                <div className="flex items-center px-4 py-3 hover:bg-muted">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage
                        src={chat.sender.image || `/avatar.png`}
                        className="object-cover w-10 h-10 rounded-full"
                      />
                    </Avatar>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-card rounded-full" />
                  </div>
                  <div className="ml-3">
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
        {selectedRoomId ? (
          <div className="w-full h-full">
            <ChatArea roomId={selectedRoomId} />
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
