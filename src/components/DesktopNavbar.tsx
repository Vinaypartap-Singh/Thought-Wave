"use client";

import { useNotifications } from "@/app/hooks/useNotificationRealtime";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import {
  Bell,
  Home,
  Image,
  LogOut,
  MessageSquareCode,
  PenLine,
  Search,
  ShoppingBag,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function DesktopNavbar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { notifications } = useNotifications();

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  );

  return (
    <header className="hidden md:flex items-center space-x-4">
      <ThemeToggle />

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/">
          <Home className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/feed">
          <Image className="w-4 h-4" />
          <span className="hidden lg:inline">Feed</span>
        </Link>
      </Button>

      {user && (
        <Button variant="ghost" className="flex items-center gap-2" asChild>
          <Link href="/messages">
            <MessageSquareCode className="w-4 h-4" />
            <span className="hidden lg:inline">Messages</span>
          </Link>
        </Button>
      )}

      {user && (
        <Button variant="ghost" className="flex items-center gap-2" asChild>
          <Link href="/store">
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden lg:inline">Store</span>
          </Link>
        </Button>
      )}

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <Link href="/search">
          <Search className="w-4 h-4" />
          <span className="hidden lg:inline">Search</span>
        </Link>
      </Button>

      <Button variant="ghost" className="flex items-center gap-2" asChild>
        <a href="https://daily1blog.netlify.app/" target="_blank">
          <PenLine className="w-4 h-4" />
          <span className="hidden lg:inline">Blogs</span>
        </a>
      </Button>

      {user ? (
        <>
          <Button
            variant="ghost"
            className="flex items-center gap-2 relative"
            asChild
          >
            <Link href="/notifications" className="relative">
              <Bell
                className={`w-5 h-5 ${
                  unreadNotifications.length > 0
                    ? "fill-red-500 text-red-500"
                    : "text-gray-500"
                }`}
              />
              <span className="hidden lg:inline">Your Acivity</span>
              {unreadNotifications.length > 0 && (
                <span className="absolute -right-1 -top-1 bg-red-500 text-white flex items-center justify-center rounded-full text-xs h-4 w-4">
                  {unreadNotifications.length}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <User className="w-4 h-4" />
                Profile
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Account Info</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start  gap-2"
                    asChild
                  >
                    <Link
                      href={`/profile/${
                        user.username ??
                        user.emailAddresses[0].emailAddress.split("@")[0]
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden lg:inline">Your Profile</span>
                    </Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-start  gap-2"
                    asChild
                  >
                    <Link href={`/setupstore`}>
                      <Store className="w-4 h-4" />
                      <span className="hidden lg:inline">Your Store</span>
                    </Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  onClick={() => signOut()}
                  className="cursor-pointer"
                >
                  <Button
                    variant="ghost"
                    className="w-full flex justify-start items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </header>
  );
}
