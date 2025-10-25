-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "businessName" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "cuit" TEXT,
    "ivaCondition" TEXT,
    "headerText" TEXT,
    "footerText" TEXT,
    "logoUrl" TEXT,
    "qrLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
