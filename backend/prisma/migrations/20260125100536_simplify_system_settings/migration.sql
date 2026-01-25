/*
  Warnings:

  - You are about to drop the column `academicYearEnd` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `academicYearStart` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `allowPartialPayment` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `currentAcademicYear` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `documentCategories` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `enableAutoPenalty` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `enableEmailNotifications` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `enableMandatoryContribution` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `minimumMeetingsPerYear` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `monthlyContributionAmount` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `notificationDaysBeforeMeet` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `paymentBasis` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDueDays` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `penaltyGracePeriodDays` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `penaltyRateLate` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `penaltyRatePerAbsence` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `projectContributionMinimum` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `quorumPercentage` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `systemEmail` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `systemName` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `systemPhone` on the `systemsetting` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `systemsetting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `systemsetting` DROP COLUMN `academicYearEnd`,
    DROP COLUMN `academicYearStart`,
    DROP COLUMN `allowPartialPayment`,
    DROP COLUMN `currentAcademicYear`,
    DROP COLUMN `description`,
    DROP COLUMN `documentCategories`,
    DROP COLUMN `enableAutoPenalty`,
    DROP COLUMN `enableEmailNotifications`,
    DROP COLUMN `enableMandatoryContribution`,
    DROP COLUMN `minimumMeetingsPerYear`,
    DROP COLUMN `monthlyContributionAmount`,
    DROP COLUMN `notificationDaysBeforeMeet`,
    DROP COLUMN `paymentBasis`,
    DROP COLUMN `paymentDueDays`,
    DROP COLUMN `penaltyGracePeriodDays`,
    DROP COLUMN `penaltyRateLate`,
    DROP COLUMN `penaltyRatePerAbsence`,
    DROP COLUMN `projectContributionMinimum`,
    DROP COLUMN `quorumPercentage`,
    DROP COLUMN `systemEmail`,
    DROP COLUMN `systemName`,
    DROP COLUMN `systemPhone`,
    DROP COLUMN `value`,
    ADD COLUMN `lastBackup` VARCHAR(191) NULL;
