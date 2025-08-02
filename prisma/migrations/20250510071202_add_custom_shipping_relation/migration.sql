-- AlterTable
ALTER TABLE `transaction_record` ADD COLUMN `shippingCost` DOUBLE NULL,
    ADD COLUMN `shippingMethodId` INTEGER NULL;

-- CreateTable
CREATE TABLE `custom_shippings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `price` DOUBLE NOT NULL,
    `name` VARCHAR(191) NULL,
    `organisationId` INTEGER NOT NULL,

    INDEX `custom_shippings_organisationId_idx`(`organisationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `custom_shippings` ADD CONSTRAINT `custom_shippings_organisationId_fkey` FOREIGN KEY (`organisationId`) REFERENCES `organisation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
