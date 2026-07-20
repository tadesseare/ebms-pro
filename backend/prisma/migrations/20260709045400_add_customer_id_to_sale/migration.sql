/*
  Warnings:

  - You are about to drop the column `address` on the `customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `inventory` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `purchase` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `sale` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[productId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `supplierId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPerUnit` to the `Purchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerId` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerUnit` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `customer` DROP COLUMN `address`;

-- AlterTable
ALTER TABLE `inventory` DROP COLUMN `updatedAt`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `quantity` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `category`,
    DROP COLUMN `stock`,
    ADD COLUMN `supplierId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `purchase` DROP COLUMN `total`,
    ADD COLUMN `costPerUnit` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `sale` DROP COLUMN `total`,
    ADD COLUMN `customerId` INTEGER NOT NULL,
    ADD COLUMN `pricePerUnit` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `supplier` DROP COLUMN `address`,
    DROP COLUMN `email`,
    ADD COLUMN `contact` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `roleId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` ENUM('admin', 'manager', 'staff') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Inventory_productId_key` ON `Inventory`(`productId`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
