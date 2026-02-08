/*
  Warnings:

  - You are about to drop the column `yearEnrolled` on the `student` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `Student_courseId_fkey`;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `yearEnrolled`,
    ADD COLUMN `studentLevel` ENUM('HIGH_SCHOOL', 'COLLEGE') NULL,
    MODIFY `courseId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
