/*
  Warnings:

  - Made the column `contactNumber` on table `Doctor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Doctor" ALTER COLUMN "contactNumber" SET NOT NULL,
ALTER COLUMN "contactNumber" DROP DEFAULT;
