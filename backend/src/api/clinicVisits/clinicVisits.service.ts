import prisma from "../../configs/prisma";
import { sendSMS } from "../../utils/smsService";

const SYSTEM_CONFIG_KEY = "system_config";
const FALLBACK_VISIT_TEMPLATE =
  "BCFI Clinic Alert: {student} visited on {date}. Symptoms: {reason}. Diagnosis: {diagnosis}. Treatment: {treatment}. Emergency: {emergency}.";

const formatVisitDate = (value: Date) =>
  new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const buildVisitSmsMessage = async (visit: any) => {
  const templateSetting = await prisma.systemSetting.findUnique({
    where: { key: SYSTEM_CONFIG_KEY },
    select: { defaultTemplate: true },
  });

  const template = templateSetting?.defaultTemplate || FALLBACK_VISIT_TEMPLATE;
  const replacements: Record<string, string> = {
    student: `${visit.student.firstName} ${visit.student.lastName}`.trim(),
    date: formatVisitDate(visit.visitDateTime),
    reason: visit.symptoms || "N/A",
    diagnosis: visit.diagnosis || "Pending",
    treatment: visit.treatment || "Pending",
    emergency: visit.isEmergency ? "YES" : "NO",
  };

  return Object.entries(replacements).reduce((msg, [key, value]) => {
    const matcher = new RegExp(`\\{${key}\\}`, "g");
    return msg.replace(matcher, value);
  }, template);
};

export const createClinicVisit = async (data: any, _actorId?: number) => {
  const { recipientPhone, ...visitData } = data;

  const visit = await prisma.clinicVisit.create({
    data: visitData,
    include: {
      student: {
        include: {
          parent: true,
        },
      },
      smsLog: true,
    },
  });

  // Log visit details for auditing and debugging
  const studentName = `${visit.student.firstName} ${visit.student.lastName}`;
  const parentPhone = visit.student.parent?.phone || "N/A";
  const visitDate = new Date(visit.visitDateTime).toLocaleString();

  console.info("Clinic visit recorded", {
    student: studentName,
    parentPhone,
    dateTime: visitDate,
    symptoms: visit.symptoms,
    bloodPressure: visit.bloodPressure || "N/A",
    temperature: visit.temperature || "N/A",
    pulseRate: visit.pulseRate || "N/A",
    diagnosis: visit.diagnosis || "",
    treatment: visit.treatment || "",
    isEmergency: visit.isEmergency,
    hospitalName: visit.hospitalName || "",
  });
  const smsRecipient = recipientPhone || visit.student.parent?.phone;
  let smsLog = visit.smsLog;
  let smsStatus: {
    success: boolean;
    recipient?: string;
    message?: string;
    error?: any;
  } | null = null;

  if (smsRecipient) {
    const smsMessage = await buildVisitSmsMessage(visit);
    const smsResult = await sendSMS(smsRecipient, smsMessage);
    const sent = smsResult.success !== false;

    smsLog = await prisma.smsLog.create({
      data: {
        clinicVisitId: visit.id,
        message: smsMessage,
        status: sent ? "SENT" : "FAILED",
        sentAt: sent ? new Date() : null,
        failReason: sent
          ? null
          : smsResult.error || smsResult.message || "Unknown SMS error",
      },
    });

    smsStatus = {
      success: sent,
      recipient: smsRecipient,
      message:
        smsResult.message ||
        (sent ? "SMS sent successfully" : "SMS delivery failed"),
      error: smsResult.error,
    };
  } else {
    smsStatus = {
      success: false,
      message: "No recipient phone provided; SMS skipped",
    };
  }

  return { ...visit, smsLog, smsStatus };
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
