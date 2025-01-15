/*
  Warnings:

  - You are about to drop the column `senderEncrytpionKey` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "senderEncrytpionKey",
ADD COLUMN     "senderEncryptionKey" TEXT;
