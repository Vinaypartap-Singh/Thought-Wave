"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserID } from "./user.action";

export async function createPost(
  content: string,
  image: string,
  youtubeUrl: string
) {
  try {
    const userId = await getDbUserID();

    if (!userId) return;

    const post = await prisma.post.create({
      data: {
        content,
        image,
        youtubeUrl,
        authorId: userId,
      },
    });

    revalidatePath("/"); // purge the cache for the home page
    return { success: true, post };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPosts(page: number = 1, pageSize: number = 10) {
  try {
    const posts = await prisma.post.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        author: {
          profileType: "PUBLIC",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        shares: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.log("Error in getPosts", error);
    throw new Error("Failed to fetch posts");
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: postId, // Use the postId to fetch a specific post
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            profileType: true, // Include profileType in the author data
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        shares: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    });

    // Check if the post exists and if the author has a public profile
    if (!post || post.author.profileType !== "PUBLIC") {
      throw new Error("Post not found or author is not public");
    }

    return post;
  } catch (error) {
    console.log("Error in getPostById", error);
    throw new Error("Failed to fetch post");
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserID();
    if (!userId) return;

    // check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      // unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // like and create notification (only if liking someone else's post)
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId, // recipient (post author)
                  creatorId: userId, // person who liked
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like:", error);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserID();

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      // Create notification if commenting on someone else's post
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserID();

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId)
      throw new Error("Unauthorized - no delete permission");

    await prisma.post.delete({
      where: { id: postId },
    });

    revalidatePath("/"); // purge the cache
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function updatePost(
  postId: string,
  content?: string,
  image?: string,
  youtubeUrl?: string
) {
  try {
    const userId = await getDbUserID();

    // Fetch the post to check existence and ownership, and retrieve current values
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, content: true, image: true, youtubeUrl: true },
    });

    if (!post) throw new Error("Post not found");
    if (post.authorId !== userId)
      throw new Error("Unauthorized - no update permission");

    // Fallback to existing values if new ones are not provided
    const updatedContent = content === "" ? post.content : content;
    const updatedImage = image === "" ? post.image : image;
    const updatedYoutubebUrl = youtubeUrl === "" ? post.youtubeUrl : youtubeUrl;

    // Perform the update with the updated values
    await prisma.post.update({
      where: { id: postId },
      data: {
        content: updatedContent,
        image: updatedImage,
        youtubeUrl: updatedYoutubebUrl,
      },
    });

    revalidatePath(`/`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update post:", error);
    return { success: false, error: "Failed to update post" };
  }
}

export async function sharePostCount(postId: string, userId: string) {
  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) throw new Error("Post not found");

    // Create a new share record
    await prisma.share.create({
      data: {
        postId,
        userId,
      },
    });

    // Optionally return the updated share count
    const shareCount = await prisma.share.count({
      where: { postId },
    });

    return { success: true, shareCount };
  } catch (error) {
    console.error("Failed to update share count:", error);
    return { success: false, error: "Failed to update share count" };
  }
}

export async function getFeedPosts() {
  try {
    const posts = await prisma.post.findMany({
      where: {
        AND: [
          {
            image: {
              not: "",
            },
          },
          {
            author: {
              profileType: "PUBLIC",
            },
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        content: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            profileType: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.log("Error in getPosts", error);
    throw new Error("Failed to fetch posts");
  }
}
