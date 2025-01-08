import {
  getProfileByUsername,
  getPublicUserInfo,
  getUserLikedPosts,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ProfilePageClient from "./ProfilePageClient";

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

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  const profileImageCurrent = await currentUser();

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
      currentProfileImage={profileImageCurrent?.imageUrl}
    />
  );
}

export default ProfilePageServer;
