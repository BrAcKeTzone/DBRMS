import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
  try {
    const course = await prisma.course.findFirst({
      select: { id: true, code: true, name: true },
    });
    console.log("course:", course);
  } catch (err) {
    console.error("error:", err);
  } finally {
    await prisma.$disconnect();
  }
})();
