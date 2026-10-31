-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('PRUNING', 'FERTILIZING', 'SOWING', 'PLANTING', 'HARVESTING', 'WATERING', 'MULCHING', 'TREATMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "MonthPart" AS ENUM ('EARLY', 'MID', 'LATE');

-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('ONCE', 'EVERY_DAYS', 'EVERY_WEEKS');

-- CreateTable
CREATE TABLE "Plant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variety" TEXT,
    "location" TEXT,
    "sunExposure" TEXT,
    "soil" TEXT,
    "watering" TEXT,
    "notes" TEXT,
    "photoPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareTask" (
    "id" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "title" TEXT,
    "instructions" TEXT,
    "startMonth" INTEGER NOT NULL,
    "startPart" "MonthPart" NOT NULL,
    "endMonth" INTEGER NOT NULL,
    "endPart" "MonthPart" NOT NULL,
    "recurrence" "Recurrence" NOT NULL DEFAULT 'ONCE',
    "interval" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" TEXT NOT NULL,
    "careTaskId" TEXT NOT NULL,
    "dueDate" DATE NOT NULL,
    "doneAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareTask_plantId_idx" ON "CareTask"("plantId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskCompletion_careTaskId_dueDate_key" ON "TaskCompletion"("careTaskId", "dueDate");

-- AddForeignKey
ALTER TABLE "CareTask" ADD CONSTRAINT "CareTask_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskCompletion" ADD CONSTRAINT "TaskCompletion_careTaskId_fkey" FOREIGN KEY ("careTaskId") REFERENCES "CareTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

