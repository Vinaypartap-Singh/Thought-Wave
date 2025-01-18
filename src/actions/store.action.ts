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


export async function getStoreId() {
    const userId = await getDbUserID();

    if (!userId) {
        console.error("User ID not found.");
        throw new Error("User not logged in.");
    }

    try {
        const store = await prisma.store.findUnique({
            where: {
                ownerId: userId
            },
        });

        return store?.id;
    } catch (error) {
        console.error("Error fetching store ID:", error);
        throw new Error("Failed to fetch store ID.");
    }
}


// Upload Products to the store

export async function uploadProductToStore(
    name: string,
    description: string,
    price: number,
    image: string
) {
    const storeid = await getStoreId();

    if (!storeid) {
        console.error("Store ID is null or undefined.");
        throw new Error("No store found for the user.");
    }


    try {
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                image,
                storeId: storeid
            }
        });

        return product;
    } catch (error) {
        console.error("Error uploading product:", error);
        throw new Error("Failed to upload product.");
    }
}

// Fetch all products in the store

export async function getProductsofStore() {
    const storeId = await getStoreId()

    if (!storeId) {
        console.error("Store ID is null or undefined.");
        throw new Error("No store found for the user.");
    }


    try {
        const products = await prisma.product.findMany({
            where: {
                storeId: storeId
            }
        })

        return products;

    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products.");
    }
}