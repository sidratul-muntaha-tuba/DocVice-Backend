/*
  Warnings:

  - You are about to drop the column `doctorId` on the `DoctorSchedule` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DoctorSchedule" DROP CONSTRAINT "DoctorSchedule_doctorId_fkey";

-- DropIndex
DROP INDEX "DoctorSchedule_doctorId_key";

-- AlterTable
ALTER TABLE "DoctorSchedule" DROP COLUMN "doctorId";

-- AddForeignKey
ALTER TABLE "DoctorSchedule" ADD CONSTRAINT "DoctorSchedule_id_fkey" FOREIGN KEY ("id") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
