/*
  Warnings:

  - Added the required column `dbUrl` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Client` ADD COLUMN `dbUrl` VARCHAR(191) NOT NULL;
