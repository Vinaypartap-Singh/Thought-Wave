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

export async function sendMessage(senderId: string, receiverId: string, content: string) {
    try {
        // Create or fetch the room based on senderId and receiverId
        const room = await createRoom(senderId, receiverId);

        // Create the message
        const message = await prisma.message.create({
            data: {
                roomId: room.id,
                senderId,
                content,
            },
        });

        return message;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}


export async function getMessagesForRoom(senderId: string, receiverId: string) {
    try {
        // Fetch room by senderId and receiverId
        const roomId = [senderId, receiverId].sort().join('-');
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
