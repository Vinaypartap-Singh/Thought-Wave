"use server";

import prisma from "@/lib/prisma";

export async function IncrementCounter() {
    try {
        const counter = await prisma.counter.update({
            where: {
                id: 1
            },
            data: {
                count: {
                    increment: 1
                }
            }
        })
    } catch (error) {
        console.log(error)
    }
}


export async function CreateCounter() {
    try {
        const counter = await prisma.counter.create({
            data: {
                count: 0
            }
        })

        return counter
    } catch (error) {
        console.log(error)
    }
}

export async function GetCounter() {
    try {
        const counter = await prisma.counter.findUnique({
            where: {
                id: 1
            }
        })
        return counter
    } catch (error) {
        console.log(error)
    }
}