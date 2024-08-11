/*
  Warnings:

  - A unique constraint covering the columns `[reuqestUuid]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reuqestUuid` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "reuqestUuid" VARCHAR(64) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Review_reuqestUuid_key" ON "Review"("reuqestUuid");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reuqestUuid_fkey" FOREIGN KEY ("reuqestUuid") REFERENCES "Request"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
