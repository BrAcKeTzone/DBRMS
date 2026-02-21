-- AlterTable
ALTER TABLE `otp` ADD COLUMN `phone` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Otp_phone_idx` ON `Otp`(`phone`);
