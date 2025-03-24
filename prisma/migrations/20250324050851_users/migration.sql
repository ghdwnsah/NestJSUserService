-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(30) NOT NULL,
    `email` VARCHAR(60) NOT NULL,
    `password` VARCHAR(30) NOT NULL,
    `signupVerifyToken` VARCHAR(60) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
