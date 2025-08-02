/*
  Warnings:

  - You are about to drop the column `resetToken` on the `organisation` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `organisation` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `organisation_resetToken_idx` ON `organisation`;

-- DropIndex
DROP INDEX `organisation_resetToken_key` ON `organisation`;

-- AlterTable
ALTER TABLE `organisation` DROP COLUMN `resetToken`,
    DROP COLUMN `resetTokenExpiry`,
    ADD COLUMN `reset_token` VARCHAR(191) NULL,
    ADD COLUMN `reset_token_expiry` DATETIME(3) NULL,
    MODIFY `city` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `organisation_reset_token_idx` ON `organisation`(`reset_token`);
