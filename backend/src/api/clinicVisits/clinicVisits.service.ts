import prisma from "../../configs/prisma";
import { sendSMS } from "../../utils/smsService";

export const createClinicVisit = async (data: any) => {
  const visit = await prisma.clinicVisit.create({
    data,
    include: {
      student: {
        include: {
          parent: true,
        },
      },
    },
  });

  // Trigger SMS notification if parent is linked and has a phone number
  if (visit.student.parent && visit.student.parent.phone) {
    const parentPhone = visit.student.parent.phone;
    const studentName = `${visit.student.firstName} ${visit.student.lastName}`;
    const dateStr = new Date(visit.visitDateTime).toLocaleString();
    const symptoms = visit.symptoms;

    // Fetch template from settings
    const settings = await prisma.systemSetting.findUnique({
      where: { key: "system_config" },
      select: { defaultTemplate: true },
    });

    let message = "";
    if (settings?.defaultTemplate) {
      // Replace placeholders: {student}, {date}, {reason}
      message = settings.defaultTemplate
        .replace(/{student}/g, studentName)
        .replace(/{date}/g, dateStr)
        .replace(/{reason}/g, symptoms);
    } else {
      // Fallback message
      message = `Clinic Alert: Your child ${studentName} visited the clinic on ${dateStr}. Symptoms: ${symptoms}. Diagnosis: ${visit.diagnosis || "Pending"}.`;
    }

    try {
      const smsResult = await sendSMS(parentPhone, message);

      // Log the SMS in the database
      await prisma.smsLog.create({
        data: {
          clinicVisitId: visit.id,
          message: message,
          status: smsResult.success ? "SENT" : "FAILED",
          sentAt: smsResult.success ? new Date() : null,
          failReason: smsResult.success ? null : (smsResult.error as string),
        },
      });
    } catch (error) {
      console.error(
        "Failed to process SMS notification for clinic visit:",
        error,
      );
    }
  }

  return visit;
};

export const getAllClinicVisits = async (search?: string) => {
  const where: any = {};

  if (search) {
    where.OR = [
      {
        student: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { studentId: { contains: search } },
          ],
        },
      },
      { symptoms: { contains: search } },
      { diagnosis: { contains: search } },
    ];
  }

  return await prisma.clinicVisit.findMany({
    where,
    include: {
      student: {
        include: {
          clinicVisits: {
            orderBy: {
              visitDateTime: "desc",
            },
          },
          healthMetrics: {
            orderBy: {
              year: "desc",
            },
            take: 1,
          },
        },
      },
      smsLog: true,
    },
    orderBy: {
      visitDateTime: "desc",
    },
    take: search ? undefined : 5,
  });
};

export const getClinicVisitStats = async () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  const totalVisits = await prisma.clinicVisit.count();

  const visitsToday = await prisma.clinicVisit.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const emergencyVisits = await prisma.clinicVisit.count({
    where: {
      isEmergency: true,
    },
  });

  return {
    totalVisits,
    visitsToday,
    emergencyVisits,
  };
};
