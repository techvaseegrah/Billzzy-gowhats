/*
  Warnings:

  - You are about to alter the column `end_date` on the `organisation` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.

*/
-- AlterTable
ALTER TABLE `organisation` ADD COLUMN `monthlyUsage` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `razorpay_access_token` TEXT NULL,
    ADD COLUMN `razorpay_account_id` VARCHAR(191) NULL,
    ADD COLUMN `razorpay_refresh_token` TEXT NULL,
    ADD COLUMN `razorpay_state` VARCHAR(191) NULL,
    ADD COLUMN `razorpay_state_expires_at` DATETIME(3) NULL,
    ADD COLUMN `razorpay_token_expires_at` DATETIME(3) NULL,
    MODIFY `end_date` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `transaction_record` ADD COLUMN `gst_amount` DOUBLE NULL,
    ADD COLUMN `gst_percent` DOUBLE NULL,
    ADD COLUMN `isEdited` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `payment_id` VARCHAR(191) NULL,
    ADD COLUMN `payment_status` ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `CustomerSubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `organisationId` INTEGER NOT NULL,
    `customerId` INTEGER NULL,
    `notes` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CustomerSubmission_token_key`(`token`),
    INDEX `CustomerSubmission_organisationId_idx`(`organisationId`),
    INDEX `CustomerSubmission_customerId_fkey`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_methods` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('FREE_SHIPPING', 'COURIER_PARTNER') NOT NULL,
    `min_amount` DOUBLE NULL,
    `use_weight` BOOLEAN NOT NULL DEFAULT false,
    `rate_per_kg` DOUBLE NULL,
    `fixed_rate` DOUBLE NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `organisation_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `shipping_methods_organisation_id_fkey`(`organisation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_shipping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` INTEGER NOT NULL,
    `method_name` VARCHAR(191) NOT NULL,
    `method_type` ENUM('FREE_SHIPPING', 'COURIER_PARTNER') NOT NULL,
    `base_rate` DOUBLE NULL,
    `weight_charge` DOUBLE NULL,
    `total_weight` DOUBLE NULL,
    `total_cost` DOUBLE NOT NULL,

    INDEX `transaction_shipping_transaction_id_fkey`(`transaction_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mandates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organisationId` INTEGER NOT NULL,
    `merchantTranId` VARCHAR(191) NOT NULL,
    `bankRRN` VARCHAR(191) NULL,
    `UMN` VARCHAR(191) NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `payerVA` VARCHAR(191) NOT NULL,
    `payerName` VARCHAR(191) NULL,
    `payerMobile` VARCHAR(191) NULL,
    `txnInitDate` DATETIME(3) NULL,
    `txnCompletionDate` DATETIME(3) NULL,
    `responseCode` VARCHAR(191) NULL,
    `respCodeDescription` VARCHAR(191) NULL,

    UNIQUE INDEX `mandates_merchantTranId_key`(`merchantTranId`),
    INDEX `mandates_organisationId_fkey`(`organisationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `active_mandates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organisationId` INTEGER NOT NULL,
    `UMN` VARCHAR(191) NULL,
    `mandateSeqNo` INTEGER NOT NULL DEFAULT 1,
    `amount` DOUBLE NOT NULL,
    `notificationRetries` INTEGER NOT NULL DEFAULT 0,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'INACTIVE',
    `payerVA` VARCHAR(191) NOT NULL,
    `payerName` VARCHAR(191) NULL,
    `payerMobile` VARCHAR(191) NULL,
    `notified` BOOLEAN NOT NULL DEFAULT false,
    `lastAttemptAt` TIMESTAMP(0) NULL,
    `lastNotificationAttempt` TIMESTAMP(0) NULL,

    UNIQUE INDEX `active_mandates_organisationId_key`(`organisationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organisationId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `autoApply` BOOLEAN NOT NULL,

    INDEX `tax_organisationId_idx`(`organisationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mandate_notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organisationId` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mandate_notifications_organisationId_fkey`(`organisationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CustomerSubmission` ADD CONSTRAINT `CustomerSubmission_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomerSubmission` ADD CONSTRAINT `CustomerSubmission_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `organisation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipping_methods` ADD CONSTRAINT `shipping_methods_organisation_id_fkey` FOREIGN KEY (`organisation_id`) REFERENCES `organisation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_shipping` ADD CONSTRAINT `transaction_shipping_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transaction_record`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mandates` ADD CONSTRAINT `mandates_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `organisation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `active_mandates` ADD CONSTRAINT `active_mandates_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `organisation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tax` ADD CONSTRAINT `tax_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `organisation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mandate_notifications` ADD CONSTRAINT `mandate_notifications_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `organisation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `transaction_record` RENAME INDEX `transaction_record_bill_no_key` TO `bill_no`;
