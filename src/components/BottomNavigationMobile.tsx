import { currentUser } from "@clerk/nextjs/server";
import { Bell, Home, Image, Search, User } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { getNotifications } from "@/actions/notification.action";

export default async function BottomNavigation() {
  const user = await currentUser();
  const notifications = await getNotifications();

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  );

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full bg-background/95 border-t border-gray-200 dark:border-gray-700 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex justify-between h-full max-w-lg grid-cols-6 mx-auto font-medium">
        <Button
          variant={"link"}
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          asChild
        >
          <Link href={`/`}>
            <span className="flex items-center flex-col text-sm text-gray-500 dark:text-gray-400 dark:group-hover:text-red-500">
              <Home className="size-4" />
            </span>
          </Link>
        </Button>

        <Button
          variant={"link"}
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          asChild
        >
          <Link href={`/feed`}>
            <span className="flex items-center flex-col text-sm text-gray-500 dark:text-gray-400 dark:group-hover:text-red-500">
              <Image className="size-4" />
            </span>
          </Link>
        </Button>

        <Button
          variant={"link"}
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          asChild
        >
          <Link href={`/search`}>
            <span className="flex items-center flex-col text-sm text-gray-500 dark:text-gray-400 dark:group-hover:text-red-500">
              <Search className="size-4" />
            </span>
          </Link>
        </Button>

        <Button
          variant="link"
          type="button"
          className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group relative"
          asChild
        >
          <Link href={`/notifications`}>
            <span className="flex items-center flex-col text-sm text-gray-500 dark:text-gray-400 dark:group-hover:text-red-500 relative">
              <Bell
                className={`w-5 h-5 ${
                  unreadNotifications.length > 0
                    ? "fill-red-500 text-red-500"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              />
              {unreadNotifications.length > 0 && (
                <span className="absolute -right-2 -top-1 bg-red-500 text-white flex items-center justify-center rounded-full text-xs h-4 w-4">
                  {unreadNotifications.length}
                </span>
              )}
            </span>
          </Link>
        </Button>

        {user ? (
          <Button
            variant={"link"}
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            asChild
          >
            <Link
              href={`/profile/${
                user.username ??
                user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <span className="flex items-center flex-col text-sm text-gray-500 dark:text-gray-400 dark:group-hover:text-red-500">
                <User className="size-4" />
              </span>
            </Link>
          </Button>
        ) : (
          <Button
            variant={"link"}
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            asChild
          >
            <Link href={`/sign-in`}>
              <span className="flex items-center flex-col text-sm text-gray-500 dark:text-gray-400 dark:group-hover:text-red-500">
                <User className="size-4" />
              </span>
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
