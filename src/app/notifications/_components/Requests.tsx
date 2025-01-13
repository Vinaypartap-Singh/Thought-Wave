import { acceptChatRequest, rejectChatRequest } from "@/actions/user.action";
import { useChatRequests } from "@/app/hooks/useRequestsRealtime";
import Loader from "@/components/Loader";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useEffect, useState } from "react"; // Import useState for managing local state

export default function RequestsComponent() {
  const { toast } = useToast();
  const { chatRequests, isLoading } = useChatRequests();
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(
    null
  );

  // Function to handle accepting the request
  const handleAcceptRequest = async (requestId: string) => {
    try {
      setLoadingRequestId(requestId); // Set loading state for the clicked request
      const response = await acceptChatRequest(requestId);

      if (response.success) {
        // Optionally, you can handle success, like refetching or updating the state
        toast({
          title: "Request accepted successfully!",
        });
      } else {
        toast({
          title: `Failed to accept request: ${response.error}`,
        });
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "An error occurred while accepting the request.",
      });
    } finally {
      setLoadingRequestId(null); // Reset loading state
    }
  };

  // Function to handle rejecting the request
  const handleRejectRequest = async (requestId: string) => {
    try {
      setRejectingRequestId(requestId);
      const response = await rejectChatRequest(requestId);

      if (response.success) {
        toast({
          title: "Request rejected successfully!",
        });
      } else {
        toast({ title: `Failed to reject request: ${response.error}` });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setRejectingRequestId(null);
    }
  };

  useEffect(() => {
    if (!isLoading && chatRequests.length === 0) {
      console.log("No more requests.");
    }
  }, [chatRequests, isLoading]);

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Requests</CardTitle>
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${chatRequests.length} Requests`}
          </span>
        </div>
      </CardHeader>

      <CardContent className="py-5">
        <ScrollArea className="h-[calc(100vh-20rem)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : chatRequests.length > 0 ? (
            chatRequests.map((request) => (
              <div
                key={request.id}
                className="flex gap-2 items-center justify-between py-2 border-b last:border-none"
              >
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={request?.sender?.image || "/default-avatar.png"}
                      className="object-cover"
                    />
                  </Avatar>
                  <div className="text-sm">
                    <Link
                      href={`/user/${request?.sender?.username}`}
                      className="font-medium cursor-pointer"
                    >
                      {request?.sender?.name || "Unknown User"}
                    </Link>
                    <p className="text-muted-foreground">
                      @{request?.sender?.username}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={"ghost"}
                    onClick={() => handleAcceptRequest(request.id)} // Call the function here
                    disabled={loadingRequestId === request.id} // Disable the button while processing
                  >
                    {loadingRequestId === request.id
                      ? "Accepting..."
                      : "Accept"}
                  </Button>
                  <Button
                    variant={"ghost"}
                    onClick={() => handleRejectRequest(request.id)} // Reject button
                    disabled={rejectingRequestId === request.id}
                  >
                    {rejectingRequestId === request.id
                      ? "Rejecting..."
                      : "Reject"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              No requests found.
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
