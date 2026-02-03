import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateRoles() {
  try {
    console.log("Updating users with role CLINIC_ADMIN to CLINIC_STAFF...");
    const result = await prisma.user.updateMany({
      where: {
        role: "CLINIC_ADMIN",
      },
      data: {
        role: "CLINIC_STAFF",
      },
    });
    console.log(`Updated ${result.count} users.`);
  } catch (error) {
    console.error("Migration script failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateRoles();
