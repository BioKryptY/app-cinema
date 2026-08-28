/*
  Warnings:

  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('ADMIN', 'USUARIO', 'VISITANTE');

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profile" "ProfileType" NOT NULL DEFAULT 'USUARIO';

-- DropTable
DROP TABLE "Profile";
