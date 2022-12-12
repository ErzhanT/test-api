-- CreateTable
CREATE TABLE `UserModel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TokenModel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `refreshToken` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `TokenModel_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FileModel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `originalname` VARCHAR(191) NOT NULL,
    `filename` VARCHAR(191) NOT NULL,
    `mimetype` VARCHAR(191) NOT NULL,
    `contentSize` INTEGER NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TokenModel` ADD CONSTRAINT `TokenModel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserModel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
