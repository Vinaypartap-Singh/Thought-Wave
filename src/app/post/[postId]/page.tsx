import { getPostById } from "@/actions/post.action";
import { getDbUserID } from "@/actions/user.action";
import PostCard from "@/components/PostCard";

export default async function Post({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const postId = (await params).postId;
  const post = await getPostById(postId);
  const dbUserId = await getDbUserID();

  return (
    <div>
      <div className="space-y-6 max-w-lg mx-auto w-full">
        <PostCard
          key={post.id}
          post={post}
          dbUserId={dbUserId}
          defaultShowComments={true}
        />
      </div>
    </div>
  );
}
