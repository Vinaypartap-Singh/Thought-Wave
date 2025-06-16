import { getFeedPosts } from "@/actions/post.action";
import { UnAuthenticatedSidebar } from "@/components/Sidebar";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

export default async function FeedPage() {
  const feed = await getFeedPosts();

  const user = await currentUser();

  if (!user) {
    return (
      <div>
        <p>Please Login Your Account to Access This Page</p>
        <div className="md:hidden">
          <UnAuthenticatedSidebar message="Login To View Posts Shared By Other" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">Feed</h1>
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {feed.map((post) => (
          <Link
            href={`/post/${post.id}`}
            key={post.id}
            className="break-inside-avoid mb-4 block rounded-lg overflow-hidden"
          >
            <Image
              className="w-full h-auto object-cover rounded-lg"
              src={post.image ?? ""}
              alt={`Post by ${post.author.name}`}
              width={600}
              height={600}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
