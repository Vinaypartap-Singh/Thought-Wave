"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { HeartIcon, MessageCircleIcon, UserPlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link"; //

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "LIKE":
      return <HeartIcon className="size-4 text-red-500" />;
    case "COMMENT":
      return <MessageCircleIcon className="size-4 text-blue-500" />;
    case "FOLLOW":
      return <UserPlusIcon className="size-4 text-green-500" />;
    default:
      return null;
  }
};

export default function NotificationsComponent({
  notifications,
}: {
  notifications: any;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>Notifications</CardTitle>
          <span className="text-sm text-muted-foreground">
            {notifications.filter((n: any) => !n.read).length} unread
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-15rem)]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification: any, index: number) => (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 border-b hover:bg-muted/25 transition-colors relative ${
                  !notification.read ? "bg-muted/50" : ""
                }`}
              >
                <Avatar className="mt-1">
                  <AvatarImage
                    src={notification.creator?.image ?? "/avatar.png"}
                    className="object-cover"
                  />
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {getNotificationIcon(notification?.type)}
                    <span>
                      <span className="font-medium">
                        {notification.creator?.name ??
                          notification.creator?.username}
                      </span>{" "}
                      {notification.type === "FOLLOW"
                        ? "started following you"
                        : notification.type === "LIKE"
                        ? "liked your post"
                        : "commented on your post"}
                    </span>
                  </div>

                  {notification.post &&
                    (notification.type === "LIKE" ||
                      notification.type === "COMMENT") && (
                      <div className="pl-6 space-y-2">
                        <div className="text-sm text-muted-foreground rounded-md p-2 bg-muted/30 mt-2">
                          <p>{notification.post?.content}</p>
                          {notification.post?.image && (
                            <Image
                              src={notification.post?.image}
                              alt="Post content"
                              className="mt-2 rounded-md w-full max-w-[200px] h-[250px] object-cover"
                              width={500}
                              height={500}
                            />
                          )}
                        </div>

                        {notification.type === "COMMENT" &&
                          notification.comment && (
                            <div className="text-sm p-2 bg-accent/50 rounded-md">
                              {notification.comment?.content}
                            </div>
                          )}
                      </div>
                    )}

                  <p className="text-sm text-muted-foreground pl-6">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </p>

                  {/* Add View Profile Button for FOLLOW notification */}
                  {notification.type === "FOLLOW" && (
                    <Link
                      href={`/profile/${notification.creator?.username}`}
                      className="mt-2 inline-block text-sm text-blue-500 hover:underline"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
