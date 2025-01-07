import { getFollowingByUsername } from "@/actions/user.action";
import FollowButton from "@/components/FollowButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

type User = Awaited<ReturnType<typeof getFollowingByUsername>>;

export default function followingsCard({ users }: { users: any }) {
  console.log(users);
  return (
    <Card className="p-4 shadow-md rounded-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Your followings</CardTitle>
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
                      href={`/user/${user.following.username}`}
                      className="shrink-0"
                    >
                      <Image
                        src={user.following.image ?? "/avatar.png"}
                        alt={`${user.following.name}'s avatar`}
                        width={48}
                        height={48}
                        className="rounded-full border border-gray-200 h-12 w-12 object-cover object-center"
                      />
                    </Link>
                    <div>
                      <Link
                        href={`/profile/${user.following.username}`}
                        className="font-semibold text-sm hover:underline"
                      >
                        {user.following.name}
                      </Link>
                      <p className="text-xs text-gray-500">
                        @{user.following.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.following._count.followings
                          ? user.following._count.following
                          : 0}{" "}
                        followings
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
                No followings Found Currently
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
