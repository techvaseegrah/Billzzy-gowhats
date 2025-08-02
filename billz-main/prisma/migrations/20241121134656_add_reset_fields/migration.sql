/*
  Warnings:

  - A unique constraint covering the columns `[resetToken]` on the table `organisation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `organisation` ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpiry` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `organisation_resetToken_key` ON `organisation`(`resetToken`);

-- CreateIndex
CREATE INDEX `organisation_resetToken_idx` ON `organisation`(`resetToken`);
