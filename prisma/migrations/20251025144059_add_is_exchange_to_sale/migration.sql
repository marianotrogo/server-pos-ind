-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "isExchange" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "isReturn" BOOLEAN DEFAULT false;
