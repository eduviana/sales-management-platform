-- CreateTable
CREATE TABLE "monthly_target" (
    "id" SERIAL NOT NULL,
    "levelId" INTEGER NOT NULL,
    "targetSales" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_target_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_target_levelId_key" ON "monthly_target"("levelId");

-- AddForeignKey
ALTER TABLE "monthly_target" ADD CONSTRAINT "monthly_target_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
