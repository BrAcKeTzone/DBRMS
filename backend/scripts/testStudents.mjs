import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  try {
    const students = await prisma.student.findMany({
      include: {
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            phone: true,
          },
        },
        course: { select: { id: true, code: true, name: true } },
      },
      take: 1,
    });
    console.log("students:", students);
  } catch (err) {
    console.error("error:", err);
  } finally {
    await prisma.$disconnect();
  }
})();
