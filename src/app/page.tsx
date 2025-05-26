import { getPosts } from "@/actions/post.action";
import { getDbUserID } from "@/actions/user.action";
import CounterCard from "@/components/CounterCard";
import CreatePost from "@/components/CreatePost";
import PostFeed from "@/components/PostFeed";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserID();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost /> : null}

        <div className="space-y-6">
          {posts && <PostFeed initialPosts={posts} dbUserId={dbUserId} />}
        </div>
      </div>

      <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-6">
        <CounterCard />
        <WhoToFollow />
      </div>
    </div>
  );
}
