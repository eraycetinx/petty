/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `Caregiver` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `deviceToken` to the `Caregiver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Caregiver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceToken` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Caregiver" DROP COLUMN "avatarUrl",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deviceToken" VARCHAR(255) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "avatarUrl",
ADD COLUMN     "deviceToken" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
