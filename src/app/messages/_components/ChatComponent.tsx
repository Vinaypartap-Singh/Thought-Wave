import { sendMessage } from "@/actions/room.action";
import { useMessages } from "@/app/hooks/useMessages";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export default function ChatArea({
  roomId,
  senderId,
}: {
  roomId: string;
  senderId: string;
}) {
  const { messages, isLoading } = useMessages(roomId, senderId); // Use the custom hook for real-time messages
  const [messageContent, setMessageContent] = useState<string>(""); // Message input state
  const [sending, setSending] = useState<boolean>(false); // Sending state
  const [error, setError] = useState<string | null>(null);

  // Ref for the scroll area
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (messageContent.trim() === "") return; // Prevent empty messages
    setSending(true);

    try {
      await sendMessage(roomId, messageContent); // Send the message
      setMessageContent(""); // Clear the input after sending
    } catch (error) {
      setError("Error sending message.");
    } finally {
      setSending(false); // Reset the sending state
    }
  };

  // Handle keypress to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default newline behavior
      handleSendMessage();
    }
  };

  // Scroll down function
  const scrollDown = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  // Call scrollDown whenever messages change
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
                      message.senderId === senderId ? 6 : 1
                    } col-end-13 p-3 rounded-lg`}
                  >
                    <div
                      className={`flex ${
                        message.senderId === senderId
                          ? "flex-row"
                          : "flex-row-reverse"
                      } items-center gap-2`}
                    >
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-black flex-shrink-0">
                        {message.sender.username.charAt(0).toUpperCase()}
                      </div>
                      <div
                        className={`relative ${
                          message.senderId === senderId ? "mr-3" : "ml-3"
                        } text-sm bg-muted py-2 px-4 shadow rounded-xl border border-border`}
                      >
                        <div className="text-muted-foreground">
                          {message.content}
                        </div>
                        {/* <div
                          className={`absolute text-xs bottom-0 ${
                            message.senderId === senderId ? "left-0" : "right-0"
                          } -mb-5 mr-2 text-muted-foreground`}
                        >
                          {message.createdAt ? "Seen" : "Sent"}{" "}
                        </div> */}
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
                className="flex w-full border border-border rounded-md focus:outline-none focus:border-primary pl-4 h-10 bg-input text-foreground"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)} // Update message content
                onKeyDown={handleKeyPress} // Call the keypress handler
              />
            </div>
          </div>
          <div className="ml-4">
            <Button
              onClick={handleSendMessage} // Handle message sending
              disabled={sending} // Disable button while sending
            >
              {sending ? "Sending..." : "Send"} {/* Button text change */}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
