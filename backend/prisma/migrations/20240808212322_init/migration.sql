-- CreateTable
CREATE TABLE "Favorite" (
    "uuid" VARCHAR(64) NOT NULL,
    "ownerUuid" VARCHAR(64) NOT NULL,
    "caregiverUuid" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_uuid_key" ON "Favorite"("uuid");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_ownerUuid_fkey" FOREIGN KEY ("ownerUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_caregiverUuid_fkey" FOREIGN KEY ("caregiverUuid") REFERENCES "User"("uuid") ON DELETE CASCADE ON UPDATE NO ACTION;
