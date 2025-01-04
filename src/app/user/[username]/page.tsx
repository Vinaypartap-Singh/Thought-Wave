import { notFound } from "next/navigation";
import {
  getProfileByUsername,
  getPublicUserInfo,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import UserProfile from "./UserProfileClient";

// Metadata generation
export async function generateMetadata({ params }: any) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}

// Server component
async function ProfilePageServer({ params }: any) {
  const user = await getPublicUserInfo(params.username);

  if (!user) notFound();

  const isPublic = user.profileType === "PUBLIC";

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    isPublic ? getUserPosts(user.id) : Promise.resolve([]),
    isPublic ? getUserLikedPosts(user.id) : Promise.resolve([]),
    isPublic ? isFollowing(user.id) : Promise.resolve(false),
  ]);

  return (
    <UserProfile
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}

export default ProfilePageServer;
