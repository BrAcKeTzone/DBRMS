/*
  Warnings:

  - The values [CLINIC_ADMIN] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('CLINIC_STAFF', 'PARENT_GUARDIAN') NOT NULL DEFAULT 'PARENT_GUARDIAN';
