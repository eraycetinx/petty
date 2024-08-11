/*
  Warnings:

  - You are about to drop the column `province` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `Picture` on the `Pet` table. All the data in the column will be lost.
  - Added the required column `city` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_caregiverUuid_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_customerUuid_fkey";

-- AlterTable
ALTER TABLE "Details" ALTER COLUMN "customerUuid" DROP NOT NULL,
ALTER COLUMN "caregiverUuid" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "province",
DROP COLUMN "street",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "district" TEXT NOT NULL,
ALTER COLUMN "customerUuid" DROP NOT NULL,
ALTER COLUMN "caregiverUuid" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Pet" DROP COLUMN "Picture";

-- CreateTable
CREATE TABLE "Picture" (
    "uuid" VARCHAR(64) NOT NULL,
    "pictureUrl" VARCHAR(120) NOT NULL,
    "customerUuid" VARCHAR(64) NOT NULL,
    "caregiverUuid" VARCHAR(64) NOT NULL,
    "width" INTEGER NOT NULL DEFAULT 0,
    "height" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Picture_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Picture_uuid_key" ON "Picture"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Picture_customerUuid_key" ON "Picture"("customerUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Picture_caregiverUuid_key" ON "Picture"("caregiverUuid");

-- AddForeignKey
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_customerUuid_fkey" FOREIGN KEY ("customerUuid") REFERENCES "Customer"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_caregiverUuid_fkey" FOREIGN KEY ("caregiverUuid") REFERENCES "Caregiver"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_customerUuid_fkey" FOREIGN KEY ("customerUuid") REFERENCES "Details"("customerUuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_caregiverUuid_fkey" FOREIGN KEY ("caregiverUuid") REFERENCES "Details"("caregiverUuid") ON DELETE CASCADE ON UPDATE CASCADE;
