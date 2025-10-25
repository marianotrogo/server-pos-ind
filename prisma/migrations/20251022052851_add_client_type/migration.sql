-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('CONSUMIDOR_FINAL');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "type" "ClientType" NOT NULL DEFAULT 'CONSUMIDOR_FINAL';
