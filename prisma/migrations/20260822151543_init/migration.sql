-- CreateTable
CREATE TABLE `KnowledgeEntry` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `question` TEXT NOT NULL,
    `answer` TEXT NOT NULL,
    `category` VARCHAR(64) NULL,
    `embedding` JSON NOT NULL,
    `createdBy` VARCHAR(32) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `KnowledgeEntry_category_idx`(`category`),
    FULLTEXT INDEX `KnowledgeEntry_question_answer_idx`(`question`, `answer`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
