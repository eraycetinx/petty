-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Customer', 'Caregiver');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateTable
CREATE TABLE "User" (
    "uuid" VARCHAR(64) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(64) NOT NULL,
    "password" VARCHAR(64) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'Customer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Details" (
    "uuid" VARCHAR(64) NOT NULL,
    "userUuid" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "lastName" VARCHAR(64) NOT NULL,
    "phone" VARCHAR(64) NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "gender" "Gender" NOT NULL,

    CONSTRAINT "Details_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Review" (
    "uuid" VARCHAR(64) NOT NULL,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewerUuid" VARCHAR(64) NOT NULL,
    "revieweeUuid" VARCHAR(64) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Pet" (
    "uuid" VARCHAR(64) NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "breed" VARCHAR(64) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "ownerUuid" VARCHAR(64) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Location" (
    "uuid" VARCHAR(64) NOT NULL,
    "country" VARCHAR(64) NOT NULL,
    "city" VARCHAR(64) NOT NULL,
    "district" VARCHAR(64) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "Picture" (
    "uuid" VARCHAR(64) NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "userUuid" VARCHAR(64) NOT NULL,

    CONSTRAINT "Picture_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uuid_key" ON "User"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Details_uuid_key" ON "Details"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Details_userUuid_key" ON "Details"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Review_uuid_key" ON "Review"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Pet_uuid_key" ON "Pet"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Location_uuid_key" ON "Location"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Picture_uuid_key" ON "Picture"("uuid");

-- AddForeignKey
ALTER TABLE "Details" ADD CONSTRAINT "Details_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerUuid_fkey" FOREIGN KEY ("reviewerUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_revieweeUuid_fkey" FOREIGN KEY ("revieweeUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Pet" ADD CONSTRAINT "Pet_ownerUuid_fkey" FOREIGN KEY ("ownerUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_uuid_fkey" FOREIGN KEY ("uuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Picture" ADD CONSTRAINT "Picture_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
