"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";


export async function syncUser() {
    try {
        const { userId } = await auth()
        const user = await currentUser()

        // If User is not logged in, return

        if (!user || !userId) return

        // Check If User Exists in database

        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        })

        if (existingUser) return existingUser

        const dbUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user.firstName || ""} ${user.lastName || ""}`,
                username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
                email: user.emailAddresses[0].emailAddress,
                image: user.imageUrl,
            },
        });

        return dbUser;

    } catch (error) {
        console.error(error)
    }
}


export async function getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({
        where: {
            clerkId,
        },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    posts: true,
                },
            },
        },
    });
}


export async function getDbUserID() {
    const { userId: clerkId } = await auth()

    if (!clerkId) return;

    const user = await getUserByClerkId(clerkId)

    if (!user) return

    return user.id
}


export async function getRandomUsers() {
    try {
        const userId = await getDbUserID();

        if (!userId) return [];

        // get 3 random users exclude ourselves & users that we already follow
        const randomUsers = await prisma.user.findMany({
            where: {
                AND: [
                    { NOT: { id: userId } },
                    {
                        NOT: {
                            followers: {
                                some: {
                                    followerId: userId,
                                },
                            },
                        },
                    },
                ],
                profileType: "PUBLIC",
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                    },
                },
            },
            take: 5,
        });

        return randomUsers;
    } catch (error) {
        console.log("Error fetching random users", error);
        return [];
    }
}

export async function toggleFollow(targetUserId: string) {
    try {
        const userId = await getDbUserID();

        if (!userId) return;

        if (userId === targetUserId) throw new Error("You cannot follow yourself");

        const existingFollow = await prisma.follows.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: targetUserId,
                },
            },
        });

        if (existingFollow) {
            // unfollow
            await prisma.follows.delete({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: targetUserId,
                    },
                },
            });
        } else {
            // follow
            await prisma.$transaction([
                prisma.follows.create({
                    data: {
                        followerId: userId,
                        followingId: targetUserId,
                    },
                }),

                prisma.notification.create({
                    data: {
                        type: "FOLLOW",
                        userId: targetUserId, // user being followed
                        creatorId: userId, // user following
                    },
                }),
            ]);
        }

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.log("Error in toggleFollow", error);
        return { success: false, error: "Error toggling follow" };
    }
}

export async function getFollowersByUsername(username: string) {
    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true, // Retrieve the user ID based on the username
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return prisma.follows.findMany({
        where: {
            followingId: user.id, // Use the user's ID to fetch followers
        },
        select: {
            follower: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    _count: {
                        select: {
                            followers: true
                        }
                    }
                },
            },
        },
    });
}


export async function getFollowingByUsername(username: string) {
    const user = await prisma.user.findUnique({
        where: {
            username: username,
        },
        select: {
            id: true, // Retrieve the user ID based on the username
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    return prisma.follows.findMany({
        where: {
            followerId: user.id, // Fetch users that this user is following
        },
        select: {
            following: {
                select: {
                    id: true,
                    name: true,
                    username: true,
                    image: true,
                    _count: {
                        select: {
                            followers: true, // Count how many followers each user has
                        },
                    },
                },
            },
        },
    });
}


export async function searchUsers(searchQuery: string = "") {
    try {
        const userId = await getDbUserID();

        if (!userId) return [];

        // Default search filter, if no searchQuery is provided, return all users
        const searchFilter: Prisma.UserWhereInput = searchQuery
            ? {
                OR: [
                    { name: { contains: searchQuery, mode: 'insensitive' } }, // 'insensitive' for case-insensitive search
                    { username: { contains: searchQuery, mode: 'insensitive' } },
                ],
            }
            : {}; // Empty filter if no search query is provided

        // Fetch users based on the search criteria or return all users by default
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { NOT: { id: userId } }, // Exclude the current user
                    {
                        NOT: {
                            followers: {
                                some: {
                                    followerId: userId,
                                },
                            },
                        }, // Exclude users that the current user is already following
                    },
                    searchFilter, // Apply the search filter if searchQuery is provided
                ],
                profileType: "PUBLIC", // Ensure only public profiles are shown
            },
            select: {
                id: true,
                name: true,
                username: true,
                image: true,
                _count: {
                    select: {
                        followers: true,
                    },
                },
            },
            take: 3, // Fetch only 3 users
        });

        return users;
    } catch (error) {
        console.log("Error fetching searched users", error);
        return [];
    }
}



// Chat Request Actions

export async function sendChatRequest(receiverId: string) {
    try {
        const userId = await getDbUserID();

        // Validate sender and receiver IDs
        if (!userId) {
            return { success: false, error: "Error getting user ID" };
        }

        if (!receiverId) {
            return { success: false, error: "Receiver ID is required" };
        }

        // Check if the chat request already exists
        const existingRequest = await prisma.chatRequest.findFirst({
            where: {
                senderId: userId,
                receiverId: receiverId,
            },
        });

        // If the request exists, return early
        if (existingRequest) {
            return { success: true, existingRequest };
        }

        // Create a new chat request if none exists
        const createRequest = await prisma.chatRequest.create({
            data: {
                senderId: userId,
                receiverId: receiverId,
                status: "PENDING", // Explicitly set status to PENDING
            },
        });

        // Return success response
        return { success: true, createRequest };

    } catch (error) {
        console.error("Failed to send chat request:", error);
        return { success: false, error: "Failed to send request" };
    }
}

export async function getChatRequestStatus(receiverId: string) {
    try {
        const userId = await getDbUserID();

        if (!userId) {
            return { success: false, error: "Error getting user ID" };
        }

        if (!receiverId) {
            return { success: false, error: "Receiver ID is required" };
        }

        // Check if the chat request exists
        const request = await prisma.chatRequest.findFirst({
            where: {
                senderId: userId,
                receiverId: receiverId,
            },
        });

        // If no request exists, return "NOT_REQUESTED"
        if (!request) {
            return { success: true, status: "NOT_REQUESTED" };
        }

        // Return the status of the request
        return { success: true, status: request.status };

    } catch (error) {
        console.error("Failed to get chat request status:", error);
        return { success: false, error: "Failed to get request status" };
    }
}
