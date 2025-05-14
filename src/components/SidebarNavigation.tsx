"use client";

import { useNotifications } from "@/app/hooks/useNotificationRealtime";
import Logo from "@/assets/1.png";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  Bell,
  Home,
  Image as ImageIcon,
  PenLine,
  Search,
  Settings,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export default function SidebarNavigation() {
  const { user } = useUser();
  const { notifications } = useNotifications();

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  );

  return (
    <header className="hidden md:grid md:grid-cols-1 md:gap-4 md:items-start">
      <Link href="/" className="flex items-center">
        <Image
          src={Logo}
          alt="Thought Wave Logo"
          width={128}
          height={40}
          className="w-40 h-auto brightness-95"
          priority
        />
      </Link>
      <Button
        variant="ghost"
        className="flex items-center justify-start gap-2"
        asChild
      >
        <Link href="/">
          <Home className="w-4 h-4" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center justify-start gap-2"
        asChild
      >
        <Link href="/feed">
          <ImageIcon className="w-4 h-4" />
          <span className="hidden lg:inline">Feed</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center justify-start gap-2"
        asChild
      >
        <Link href="/search">
          <Search className="w-4 h-4" />
          <span className="hidden lg:inline">Search</span>
        </Link>
      </Button>

      <Button
        variant="ghost"
        className="flex items-center justify-start  gap-2"
        asChild
      >
        <a href="https://daily1blog.netlify.app/" target="_blank">
          <PenLine className="w-4 h-4" />
          <span className="hidden lg:inline">Blogs</span>
        </a>
      </Button>

      {user ? (
        <>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 relative"
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
              <span className="hidden lg:inline">Notifications</span>
              {unreadNotifications.length > 0 && (
                <span className="absolute -right-1 -top-1 bg-red-500 text-white flex items-center justify-center rounded-full text-xs h-4 w-4">
                  {unreadNotifications.length}
                </span>
              )}
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2"
            asChild
          >
            <Link
              href={`/profile/${
                user.username ??
                user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden lg:inline">Profile</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2"
            asChild
          >
            <Link
              href={`/profile/${
                user.username ??
                user.emailAddresses[0].emailAddress.split("@")[0]
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">Manage Account</span>
            </Link>
          </Button>
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </header>
  );
}
