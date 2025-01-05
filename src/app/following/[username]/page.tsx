import {
  getFollowersByUsername,
  getFollowingByUsername,
} from "@/actions/user.action";
import FollowersCard from "./_components/followersCard";

export default async function GetFollowerPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const username = (await params).username;
  const followers = await getFollowingByUsername(username);
  return (
    <div>
      <div className="space-y-6 w-full">
        {followers && <FollowersCard users={followers} />}
      </div>
    </div>
  );
}
