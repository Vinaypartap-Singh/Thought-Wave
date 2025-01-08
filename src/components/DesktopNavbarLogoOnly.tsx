import Link from "next/link";

export default function DesktopNavbarLogoOnly() {
  return (
    <div className="flex items-center">
      <Link href="/" className="text-xl text-primary tracking-wider">
        Thought Wave
      </Link>
    </div>
  );
}
