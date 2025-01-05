import Image from "next/image";
import Link from "next/link";

export default function SearchCard({ user }: { user: any }) {
  console.log(user);
  return (
    <Link
      href={`/user/${user.username}`}
      key={user.id}
      className="flex items-center gap-4 mb-4"
    >
      <Image
        src={user.image ?? "/avatar.png"}
        alt={`${user.name}'s avatar`}
        className="w-12 h-12 rounded-full"
        height={40}
        width={40}
      />
      <div>
        <h3 className="font-medium">{user.name}</h3>
        <p className="text-sm text-gray-500">@{user.username}</p>
        <p className="text-sm text-gray-500">
          {user._count.followers} followers
        </p>
      </div>
    </Link>
  );
}
