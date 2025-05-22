// components/PostFeed.tsx
"use client";

import { getPosts } from "@/actions/post.action";
import { useEffect, useState, useTransition } from "react";
import { useInView } from "react-intersection-observer";
import Loader from "./Loader";
import PostCard from "./PostCard";

type Posts = Awaited<ReturnType<typeof getPosts>>;

export default function PostFeed({
  initialPosts,
  dbUserId,
}: {
  initialPosts: Posts;
  dbUserId: string | undefined;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!inView || !hasMore) return;

    startTransition(async () => {
      const newPosts = await getPosts(page);
      if (!newPosts || newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev: Posts) => [...prev, ...newPosts]);
        setPage((prev) => prev + 1);
      }
    });
  }, [inView]);

  return (
    <div className="space-y-6">
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} dbUserId={dbUserId} />
      ))}
      {hasMore && (
        <div ref={ref} className="text-center py-4 text-sm text-gray-500">
          {isPending ? <Loader /> : "Scroll to load more"}
        </div>
      )}
    </div>
  );
}
