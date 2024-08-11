-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateTable
CREATE TABLE "Customer" (
    "uuid" VARCHAR(64) NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "email" VARCHAR(70) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "avatarUrl" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Details" (
    "uuid" VARCHAR(64) NOT NULL,
    "firstName" VARCHAR(64) NOT NULL,
    "lastName" VARCHAR(64) NOT NULL,
    "phoneNumber" VARCHAR(10) NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthday" TIMESTAMP(3) NOT NULL,
    "isVerifed" BOOLEAN NOT NULL DEFAULT false,
    "customerUuid" VARCHAR(64) NOT NULL,
    "caregiverUuid" VARCHAR(64) NOT NULL,

    CONSTRAINT "Details_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Pet" (
    "uuid" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "kind" VARCHAR(64) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "Picture" VARCHAR(255) NOT NULL,
    "ownerUuid" VARCHAR(64) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Caregiver" (
    "uuid" VARCHAR(64) NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "email" VARCHAR(70) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "avatarUrl" VARCHAR(255) NOT NULL,
    "rating" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "Caregiver_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Review" (
    "uuid" TEXT NOT NULL,
    "caregiverUuid" TEXT NOT NULL,
    "customerUuid" VARCHAR(64) NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Location" (
    "uuid" VARCHAR(64) NOT NULL,
    "country" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "customerUuid" VARCHAR(64) NOT NULL,
    "caregiverUuid" VARCHAR(64) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_uuid_key" ON "Customer"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Details_uuid_key" ON "Details"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Details_customerUuid_key" ON "Details"("customerUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Details_caregiverUuid_key" ON "Details"("caregiverUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_uuid_key" ON "Pet"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_ownerUuid_key" ON "Pet"("ownerUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Caregiver_uuid_key" ON "Caregiver"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Caregiver_username_key" ON "Caregiver"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Caregiver_email_key" ON "Caregiver"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Location_uuid_key" ON "Location"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Location_customerUuid_key" ON "Location"("customerUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Location_caregiverUuid_key" ON "Location"("caregiverUuid");

-- AddForeignKey
ALTER TABLE "Details" ADD CONSTRAINT "Details_customerUuid_fkey" FOREIGN KEY ("customerUuid") REFERENCES "Customer"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Details" ADD CONSTRAINT "Details_caregiverUuid_fkey" FOREIGN KEY ("caregiverUuid") REFERENCES "Caregiver"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerUuid_fkey" FOREIGN KEY ("ownerUuid") REFERENCES "Customer"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_caregiverUuid_fkey" FOREIGN KEY ("caregiverUuid") REFERENCES "Caregiver"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_customerUuid_fkey" FOREIGN KEY ("customerUuid") REFERENCES "Customer"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_caregiverUuid_fkey" FOREIGN KEY ("caregiverUuid") REFERENCES "Caregiver"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
