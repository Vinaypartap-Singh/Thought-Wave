import { useRejectedChatRequests } from "@/app/hooks/useRejectedRequestsRealtime";
import Loader from "@/components/Loader";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useEffect } from "react";

export default function RequestsComponent() {
  const { rejectedRequests, isLoading } = useRejectedChatRequests();

  useEffect(() => {
    if (!isLoading && rejectedRequests.length === 0) {
      console.log("No more requests.");
    }
  }, [rejectedRequests, isLoading]);

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Requests Rejected</CardTitle>
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${rejectedRequests.length} Requests`}
          </span>
        </div>
      </CardHeader>

      <CardContent className="py-5">
        <ScrollArea className="h-[calc(100vh-20rem)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : rejectedRequests.length > 0 ? (
            rejectedRequests.map((request) => (
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
                  <Button variant={"outline"} asChild>
                    <Link href={`/user/${request.sender.username}`}>
                      View Profile
                    </Link>
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
