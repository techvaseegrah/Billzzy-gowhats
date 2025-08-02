-- CreateTable
CREATE TABLE `transaction_billing_address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transactionId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `flatNo` VARCHAR(191) NULL,
    `street` VARCHAR(191) NULL,
    `district` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `pincode` VARCHAR(191) NULL,

    UNIQUE INDEX `transaction_billing_address_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction_billing_address` ADD CONSTRAINT `transaction_billing_address_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transaction_record`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
