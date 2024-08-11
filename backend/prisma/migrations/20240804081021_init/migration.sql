/*
  Warnings:

  - You are about to drop the `Caregiver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Picture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Details" DROP CONSTRAINT "Details_caregiverUuid_fkey";

-- DropForeignKey
ALTER TABLE "Details" DROP CONSTRAINT "Details_customerUuid_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_caregiverUuid_fkey";

-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_customerUuid_fkey";

-- DropForeignKey
ALTER TABLE "Pet" DROP CONSTRAINT "Pet_ownerUuid_fkey";

-- DropForeignKey
ALTER TABLE "Picture" DROP CONSTRAINT "Picture_caregiverUuid_fkey";

-- DropForeignKey
ALTER TABLE "Picture" DROP CONSTRAINT "Picture_customerUuid_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_caregiverUuid_fkey";

-- DropTable
DROP TABLE "Caregiver";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Details";

-- DropTable
DROP TABLE "Location";

-- DropTable
DROP TABLE "Pet";

-- DropTable
DROP TABLE "Picture";

-- DropTable
DROP TABLE "Review";

-- DropEnum
DROP TYPE "Gender";
