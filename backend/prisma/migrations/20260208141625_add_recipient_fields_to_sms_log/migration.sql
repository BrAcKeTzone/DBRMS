/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `smslog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `smslog` DROP COLUMN `phoneNumber`,
    ADD COLUMN `recipientPhone` VARCHAR(191) NULL;
