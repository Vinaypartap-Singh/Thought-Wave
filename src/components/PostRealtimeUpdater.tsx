"use client";

import { getPosts } from "@/actions/post.action";
import PostCard from "@/components/PostCard";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import Loader from "./Loader";

export default function PostRealtimeUpdater({
  dbUserId,
}: {
  dbUserId: string;
}) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const freshPosts = await getPosts();
      setPosts(freshPosts);
    };

    fetchPosts(); // initial load

    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Post" },
        (payload) => {
          console.log("Change received!", payload);
          fetchPosts(); // re-fetch posts
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        <div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} dbUserId={dbUserId} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Loader />
        </div>
      )}
    </div>
  );
}
