/*
  Warnings:

  - You are about to drop the column `text` on the `Review` table. All the data in the column will be lost.
  - Added the required column `comment` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "text",
ADD COLUMN     "comment" TEXT NOT NULL;
