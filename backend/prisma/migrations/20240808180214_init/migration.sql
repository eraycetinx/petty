-- CreateTable
CREATE TABLE "Request" (
    "uuid" VARCHAR(64) NOT NULL,
    "petUuid" VARCHAR(64) NOT NULL,
    "caregiverUuid" VARCHAR(64) NOT NULL,
    "ownerUuid" VARCHAR(64) NOT NULL,
    "status" VARCHAR(64) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Request_uuid_key" ON "Request"("uuid");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_petUuid_fkey" FOREIGN KEY ("petUuid") REFERENCES "Pet"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_caregiverUuid_fkey" FOREIGN KEY ("caregiverUuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_ownerUuid_fkey" FOREIGN KEY ("ownerUuid") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
