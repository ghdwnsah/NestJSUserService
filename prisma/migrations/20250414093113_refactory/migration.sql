/*
  Warnings:

  - A unique constraint covering the columns `[clientCode]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientCode` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Client` ADD COLUMN `clientCode` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Client_clientCode_key` ON `Client`(`clientCode`);
