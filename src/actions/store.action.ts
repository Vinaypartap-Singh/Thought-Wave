"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
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

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                businessProfile: true
            }
        })


        revalidatePath("/setupstore");
        return store;
    } catch (error) {
        console.error("Error creating store:", error);
        throw new Error("Failed to create store.");
    }
}



export async function updateStore(storeName: string, storeImage: string) {
    const userId = await getDbUserID();

    if (!userId) {
        console.error("User ID not found.");
        throw new Error("User not logged in.");
    }


    const existingStore = await prisma.store.findUnique({
        where: {
            ownerId: userId
        }
    });

    if (!existingStore) {
        console.error("Store not found. Please Create One");
        throw new Error("Store not found. Please Create One");
    }

    const updateName = storeName === "" ? existingStore?.name : storeName;
    const updatedImage = storeImage === "" ? existingStore?.image : storeImage;

    try {

        const store = await prisma.store.update({
            where: {
                ownerId: userId
            },
            data: {
                name: updateName,
                image: updatedImage
            }
        });

        return store;
    }
    catch (error) {
        console.error("Error updating store Info", error);
        throw new Error("Failed to update store info.");
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
    const { userId } = await auth();
    const storeid = await getStoreId();


    if (!userId) {
        console.error("User ID is null or undefined.");
        throw new Error("User not found.");
    }

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
                storeId: storeid,
                userId: userId
            }
        });

        revalidatePath("/setupstore");
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


export async function deleteProduct(id: string) {
    try {
        const product = await prisma.product.delete({
            where: {
                id: id
            }
        });

        revalidatePath("/setupstore");
        return product;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Failed to delete product.");

    }
}



// Get All Products For Store

export async function getAllProducts() {
    try {
        const products = await prisma.product.findMany({
            include: {
                store: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        })

        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw new Error("Failed to fetch products.");
    }
}


export async function placeOrder(userId: string, storeId: string, productId: string, quantity: number) {
    try {
        // Validate input parameters
        if (!userId || !storeId || !productId || quantity <= 0) {
            throw new Error("Invalid input data. Ensure all fields are properly provided.");
        }

        console.log("Parameters received:", { userId, storeId, productId, quantity });

        // Fetch product details
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { price: true },
        });

        if (!product) {
            throw new Error(`Product with ID ${productId} not found.`);
        }

        if (product.price === null || product.price === undefined) {
            throw new Error(`Product price is not available for product ID ${productId}.`);
        }

        console.log("Fetched product details:", product);

        // Calculate the total cost
        const total = product.price * quantity;
        console.log("Total cost calculated:", total);

        // Place the order
        const order = await prisma.order.create({
            data: {
                userId,
                storeId,
                total,
                products: {
                    create: {
                        productId,
                        quantity,
                        price: product.price,
                    },
                },
            },
            include: {
                products: true,
            },
        });

        console.log("Order placed successfully:", order);
        return order;

    } catch (error) {
        // Log and return error details
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to Place Order:", errorMessage);
        return { success: false, error: "Failed to Place Order" };
    }
}

export async function updateStatus(id: string, status: OrderStatus) {
    console.log("Updating status:", { id, status });
    try {
        const order = await prisma.order.update({
            where: {
                id: id
            },
            data: {
                status: status
            }
        });

        return order;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to Update Order:", errorMessage);
        return { success: false, error: "Failed to Update Order" };
    }
}