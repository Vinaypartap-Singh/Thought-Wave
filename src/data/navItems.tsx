// Dummy Data here

import { getPublicUserInfo } from "@/actions/profile.action";
import { currentUser } from "@clerk/nextjs/server";
import { Bell, House, User } from "lucide-react";

interface NavItems {
  name: string;
  link: string;
  icon: React.ReactNode;
}

export const NavItems: NavItems[] = [
  {
    name: "Home",
    link: "/",
    icon: <House className="size-5" />,
  },
  {
    name: "Notifications",
    link: "/notifications",
    icon: <Bell className="size-5" />,
  },
  {
    name: "Profile",
    link: "/profile",
    icon: <User className="size-5" />,
  },
];

export const user = await currentUser();
export const currentLoggedIn = async (username: string) => {
  await getPublicUserInfo(username);
};

export const isSidebarNavigation = false;
