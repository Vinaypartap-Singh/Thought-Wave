"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getDbUserID } from "./user.action";
import { ProfileType } from "@/app/profile/[username]/ProfilePageClient";

export async function getProfileByUsername(username: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { username: username },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                image: true,
                location: true,
                website: true,
                createdAt: true,
                profileType: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true,
                    },
                },
            },
        });

        return user;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw new Error("Failed to fetch profile");
    }
}

export async function getPublicUserInfo(username: string) {
    try {
        // Fetch the user's profile type first
        const userProfileType = await prisma.user.findUnique({
            where: { username: username },
            select: { profileType: true },
        });

        if (!userProfileType) {
            throw new Error("User not found");
        }

        // Define the query based on the profile type
        const isPublic = userProfileType.profileType === "PUBLIC";

        const user = await prisma.user.findUnique({
            where: { username: username },
            select: {
                id: true,
                name: true,
                username: true,
                bio: true,
                image: true,
                location: true,
                website: true,
                createdAt: true,
                profileType: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        posts: true,
                    },
                },
                // Include all posts data if the profile is public
                ...(isPublic && {
                    posts: {
                        select: {
                            id: true,
                            content: true,   // Full post content
                            image: true,     // If the post includes an image
                            createdAt: true, // Post creation date
                            updatedAt: true, // Post update date
                            comments: {
                                select: {
                                    id: true,
                                    content: true,
                                    createdAt: true,
                                },
                            },
                            likes: {
                                select: {
                                    userId: true,
                                    createdAt: true,
                                },
                            },
                            shares: {
                                select: {
                                    userId: true,
                                    createdAt: true,
                                },
                            },
                            _count: {
                                select: {
                                    likes: true,
                                    comments: true,
                                    shares: true,
                                },
                            }
                        },
                    },
                }),
            },
        });

        return user;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw new Error("Failed to fetch profile");
    }
}



export async function getUserPosts(userId: string) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                authorId: userId,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
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
                        shares: true
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return posts;
    } catch (error) {
        console.error("Error fetching user posts:", error);
        throw new Error("Failed to fetch user posts");
    }
}

export async function getUserLikedPosts(userId: string) {
    try {
        const likedPosts = await prisma.post.findMany({
            where: {
                likes: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        image: true,
                    },
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                                image: true,
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
                        shares: true
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return likedPosts;
    } catch (error) {
        console.error("Error fetching liked posts:", error);
        throw new Error("Failed to fetch liked posts");
    }
}

export async function updateProfile(formData: FormData) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) throw new Error("Unauthorized");

        const name = formData.get("name") as string;
        const bio = formData.get("bio") as string;
        const location = formData.get("location") as string;
        const website = formData.get("website") as string;
        const profileType = formData.get("profileType") as ProfileType;

        const user = await prisma.user.update({
            where: { clerkId },
            data: {
                name,
                bio,
                location,
                website,
                profileType,
            },
        });

        revalidatePath("/profile");
        return { success: true, user };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Failed to update profile" };
    }
}

export async function isFollowing(userId: string) {
    try {
        const currentUserId = await getDbUserID();
        if (!currentUserId) return false;

        const follow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: userId,
                },
            },
        });

        return !!follow;
    } catch (error) {
        console.error("Error checking follow status:", error);
        return false;
    }
}