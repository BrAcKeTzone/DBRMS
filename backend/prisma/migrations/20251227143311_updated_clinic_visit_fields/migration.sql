/*
  Warnings:

  - You are about to drop the column `temperatureCelsius` on the `clinicvisit` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `clinicvisit` DROP FOREIGN KEY `ClinicVisit_studentId_fkey`;

-- AlterTable
ALTER TABLE `clinicvisit` DROP COLUMN `temperatureCelsius`,
    ADD COLUMN `temperature` VARCHAR(191) NULL,
    MODIFY `pulseRate` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `ClinicVisit` ADD CONSTRAINT `ClinicVisit_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
