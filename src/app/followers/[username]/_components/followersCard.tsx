import { getFollowersByUsername } from "@/actions/user.action";
import FollowButton from "@/components/FollowButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

type User = Awaited<ReturnType<typeof getFollowersByUsername>>;

export default function FollowersCard({ users }: { users: any }) {
  return (
    <Card className="p-4 shadow-md rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Your Followers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {users.length > 0 ? (
            <div className="grid gap-4">
              {users.map((user: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-4 items-center justify-between border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/user/${user.follower.username}`}
                      className="shrink-0"
                    >
                      <Image
                        src={user.follower.image ?? "/avatar.png"}
                        alt={`${user.follower.name}'s avatar`}
                        width={48}
                        height={48}
                        className="rounded-full border border-gray-200 h-12 w-12 object-cover object-center"
                      />
                    </Link>
                    <div>
                      <Link
                        href={`/profile/${user.follower.username}`}
                        className="font-semibold text-sm hover:underline"
                      >
                        {user.follower.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        @{user.follower.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.follower._count.followers} followers
                      </p>
                    </div>
                  </div>
                  <FollowButton userId={user.id} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                No Followers Found Currently
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
