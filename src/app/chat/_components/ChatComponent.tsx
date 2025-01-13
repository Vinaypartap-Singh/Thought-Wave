import { getMessagesForRoom } from "@/actions/room.action";
import { useEffect, useState } from "react";

export default function ChatArea({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<any[]>([]); // Store messages in state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const fetchedMessages = await getMessagesForRoom(roomId);
        setMessages(fetchedMessages);
      } catch (err) {
        console.error(err);
        setError("Error fetching messages.");
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [roomId]); // Re-fetch when roomId changes

  return (
    <div className="flex flex-col flex-auto bg-card h-full">
      <div className="flex flex-col flex-auto h-full p-4">
        <div className="flex flex-col h-full overflow-x-auto mb-4">
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-12 gap-y-2">
              {loading && (
                <div className="col-span-12 p-3 text-center">
                  Loading messages...
                </div>
              )}
              {error && (
                <div className="col-span-12 p-3 text-center text-red-500">
                  {error}
                </div>
              )}
              {!loading && !error && messages.length === 0 && (
                <div className="col-span-12 p-3 text-center">
                  No messages available.
                </div>
              )}
              {!loading &&
                !error &&
                messages.length > 0 &&
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`col-start-${
                      message.senderId === roomId ? 6 : 1
                    } col-end-13 p-3 rounded-lg`}
                  >
                    <div
                      className={`flex ${
                        message.senderId === roomId
                          ? "flex-row-reverse"
                          : "flex-row"
                      } items-center`}
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-black flex-shrink-0">
                        {message.sender.username.charAt(0)}
                      </div>
                      <div
                        className={`relative ${
                          message.senderId === roomId ? "mr-3" : "ml-3"
                        } text-sm bg-muted py-2 px-4 shadow rounded-xl border border-border`}
                      >
                        <div className="text-muted-foreground">
                          {message.content}
                        </div>
                        <div className="absolute text-xs bottom-0 right-0 -mb-5 mr-2 text-muted-foreground">
                          {message.createdAt ? "Seen" : "Sent"}{" "}
                          {/* Adjust based on message status */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="flex flex-row items-center h-16 rounded-xl bg-muted w-full px-4 border-t border-border">
          <div className="flex-grow ml-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Type a message"
                className="flex w-full border border-border rounded-xl focus:outline-none focus:border-primary pl-4 h-10 bg-input text-foreground"
              />
            </div>
          </div>
          <div className="ml-4">
            <button className="flex items-center justify-center bg-primary hover:bg-primary/90 rounded-xl text-primary-foreground px-4 py-1 flex-shrink-0">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
