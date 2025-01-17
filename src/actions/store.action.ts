"use server";

import prisma from "@/lib/prisma";
import { getDbUserID } from "./user.action";

export async function getStoreInfo() {
    const userId = await getDbUserID();

    try {
        const store = await prisma.store.findUnique({
            where: {
                ownerId: userId
            },
        });

        return store;
    } catch (error) {
        console.error("Error fetching store info:", error);
        throw new Error("Failed to fetch store info.");
    }
}

export async function createStore(storeName: string, storeImage: string) {
    const userId = await getDbUserID();

    if (!userId) {
        throw new Error("User not found.");
    }

    try {
        const store = await prisma.store.create({
            data: {
                name: storeName,
                image: storeImage,
                ownerId: userId
            }
        });

        return store;
    } catch (error) {
        console.error("Error creating store:", error);
        throw new Error("Failed to create store.");
    }
}