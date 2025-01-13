import { getChatRequestStatus } from "@/actions/user.action";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function MessageRequestButton({
  userId,
  handleMessageSentRequest,
  sendingChatRequest,
}: {
  userId: string;
  handleMessageSentRequest: (userId: string) => void;
  sendingChatRequest: boolean;
}) {
  const [chatRequestStatus, setChatRequestStatus] = useState<
    string | undefined
  >(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchChatRequestStatus = async () => {
      setLoading(true);
      const response = await getChatRequestStatus(userId);
      if (response.success) {
        setChatRequestStatus(response.status);
      } else {
        setChatRequestStatus(undefined);
      }
      setLoading(false);
    };

    fetchChatRequestStatus();
  }, [userId]);

  const getButtonText = () => {
    if (sendingChatRequest) {
      return "Sending...";
    }

    if (loading) {
      return "Loading...";
    }

    if (!chatRequestStatus) {
      return "Message";
    }

    if (chatRequestStatus === "PENDING") {
      return "Pending";
    }

    if (chatRequestStatus === "ACCEPTED") {
      return "Chat Accepted";
    }

    if (chatRequestStatus === "REJECTED") {
      return "Request Rejected";
    }

    return "Message";
  };

  const getButtonColor = () => {
    if (sendingChatRequest || loading) {
      return "bg-gray-500";
    }

    if (chatRequestStatus === "PENDING") {
      return "bg-yellow-500";
    }

    if (chatRequestStatus === "ACCEPTED") {
      return "bg-green-500";
    }

    if (chatRequestStatus === "REJECTED") {
      return "bg-red-500";
    }

    return "bg-blue-500";
  };

  const getTextColor = () => {
    if (sendingChatRequest || loading) {
      return "text-white";
    }

    if (chatRequestStatus === "PENDING") {
      return "text-black";
    }

    if (chatRequestStatus === "ACCEPTED") {
      return "text-white";
    }

    if (chatRequestStatus === "REJECTED") {
      return "text-white";
    }

    return "text-white";
  };

  return (
    <Button
      className={`w-full md:w-1/2 ${getButtonColor()} ${getTextColor()} hover:text-black`}
      onClick={() => handleMessageSentRequest(userId)}
      disabled={
        chatRequestStatus === "PENDING" || sendingChatRequest || loading
      }
    >
      {getButtonText()}
    </Button>
  );
}
