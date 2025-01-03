// Dummy Data here

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
