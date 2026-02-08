-- AlterTable
ALTER TABLE `smslog` ADD COLUMN `phoneNumber` VARCHAR(191) NULL,
    ADD COLUMN `recipientName` VARCHAR(191) NULL;
