"use server";


import { revalidatePath } from "next/cache";
import { getDbUserID } from "./user.action";

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function createRoom(senderId: string, receiverId: string) {
    try {
        // Generate roomId based on senderId and receiverId
        const roomId = [senderId, receiverId].sort().join('-'); // Sorting ensures consistency

        // Check if the room already exists
        const existingRoom = await prisma.room.findUnique({
            where: {
                id: roomId,
            },
        });

        if (existingRoom) {
            return existingRoom; // Return the existing room if it already exists
        }

        // Create a new room if it doesn't exist
        const room = await prisma.room.create({
            data: {
                id: roomId, // The unique roomId
                name: `${senderId} - ${receiverId}`, // Custom room name
            },
        });

        // Add the users to the room
        await prisma.roomMember.createMany({
            data: [
                { userId: senderId, roomId: room.id },
                { userId: receiverId, roomId: room.id },
            ],
            skipDuplicates: true, // Ensure users aren't added twice if they're already members
        });

        return room;
    } catch (error) {
        console.error('Error creating room:', error);
        throw new Error('Error creating room');
    }
}

export async function sendMessage(roomId: string, content: string, ivBase64: string, senderKey: string) {
    try {
        // Get senderId from the database using getDbUserID
        const senderId = await getDbUserID();

        if (!senderId) {
            throw new Error("User is not authenticated");
        }

        if (!roomId || !content) {
            throw new Error("Room ID or content is invalid");
        }

        // Create the message in the database
        const message = await prisma.message.create({
            data: {
                roomId,
                senderId,
                content,
                iv: ivBase64,  // Store the IV as Base64
                senderEncryptionKey: senderKey
            },
        });

        // Revalidate the path after creating the message
        revalidatePath("/messages");
        return message;
    } catch (error) {
        // Log error with more detail
        if (error instanceof Error) {
            console.error("Error in sendMessage:", error.message);
            return { success: false, error: error.message };
        } else {
            console.error("Unknown error in sendMessage:", error);
            return { success: false, error: "Unknown error occurred while sending message." };
        }
    }
}

export async function getMessagesForRoom(roomId: string) {
    try {

        const messages = await prisma.message.findMany({
            where: {
                roomId,
            },
            include: {
                sender: true, // Optionally include sender details in the response
            },
            orderBy: {
                createdAt: 'asc', // Sort messages by creation date
            },
        });

        return messages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw error;
    }
}
