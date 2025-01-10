import { syncUser } from "@/actions/user.action";
import { isSidebarNavigation } from "@/data/navItems";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

async function Navbar() {
  const user = await currentUser();
  if (user) await syncUser(); // POST

  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className={`${
            isSidebarNavigation
              ? "md:hidden"
              : "flex items-center justify-between h-16"
          }`}
        >
          <div className="flex items-center">
            <Link href="/" className="text-xl text-primary tracking-wider">
              Thought Wave
            </Link>
          </div>

          {!isSidebarNavigation && <DesktopNavbar />}
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
