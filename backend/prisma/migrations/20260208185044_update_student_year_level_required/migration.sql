/*
  Warnings:

  - Made the column `yearLevel` on table `student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `student` MODIFY `yearEnrolled` VARCHAR(191) NULL,
    MODIFY `yearLevel` VARCHAR(50) NOT NULL;
