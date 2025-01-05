import { SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Bell, Home, PenLine, Search, User } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

export default async function DesktopNavbar() {
  const user = await currentUser();

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
          <Button variant="ghost" className="flex items-center gap-2" asChild>
            <Link href="/notifications">
              <Bell className=" w-4 h-4" />
              <span className="hidden lg:inline">Notifications</span>
            </Link>
          </Button>
          <Button variant="ghost" className="flex items-center gap-2" asChild>
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
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default">Sign In</Button>
        </SignInButton>
      )}
    </header>
  );
}
