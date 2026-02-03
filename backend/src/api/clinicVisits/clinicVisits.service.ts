import prisma from "../../configs/prisma";
import { sendSMS } from "../../utils/smsService";

export const createClinicVisit = async (data: any, actorId?: number) => {
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
  // Prefer the connected parent's phone (actorId) when the actor is the linked parent
  // Fetch actor's phone/name if actorId provided
  let actor: {
    id: number;
    phone?: string;
    firstName?: string;
    lastName?: string;
  } | null = null;
  if (actorId) {
    actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { id: true, phone: true, firstName: true, lastName: true },
    });
  }

  if (visit.student.parent) {
    // Determine which phone number to use
    let parentPhone = visit.student.parent.phone;
    let parentName = `${visit.student.parent.firstName} ${visit.student.parent.lastName}`;

    if (actor && actor.id === visit.student.parentId && actor.phone) {
      parentPhone = actor.phone;
      parentName = `${actor.firstName || visit.student.parent.firstName} ${actor.lastName || visit.student.parent.lastName}`;
    }

    if (parentPhone) {
      const studentName = `${visit.student.firstName} ${visit.student.lastName}`;
      const visitDate = new Date(visit.visitDateTime);
      const dateStr = visitDate.toLocaleDateString();
      const timeStr = visitDate.toLocaleTimeString();

      // Vitals and fields
      const reason = visit.symptoms || "Not specified";
      const bloodPressure = visit.bloodPressure || "N/A";
      const temperature = visit.temperature || "N/A";
      const pulseRate = visit.pulseRate || "N/A";
      const treatment = visit.treatment || "None";
      const diagnosis = visit.diagnosis || "Pending";
      const isEmergency = visit.isEmergency ? "Yes" : "No";
      const referred = visit.isReferredToHospital ? "Yes" : "No";
      const hospitalName = visit.hospitalName || "";

      // Construct a secure visit link (frontend URL should be in env if available)
      const frontendBase =
        process.env.FRONTEND_URL ||
        process.env.APP_URL ||
        "https://app.schoolclinic.example";
      const visitLink = `${frontendBase.replace(/\/$/, "")}/clinic/visits/${visit.id}`;

      // Build the detailed multi-line message (no-reply note included)
      let message =
        `${parentName}, update from School Clinic:\n` +
        `Student: ${studentName}\n` +
        `Date/Time: ${dateStr} ${timeStr}\n` +
        `Reason/Symptoms: ${reason}\n` +
        `Vitals — BP: ${bloodPressure}; Temp: ${temperature}; Pulse: ${pulseRate}\n` +
        `Treatment/Medication: ${treatment}\n` +
        `Clinic Diagnosis: ${diagnosis}\n` +
        `Emergency: ${isEmergency} — Referred: ${referred}` +
        (visit.isReferredToHospital && hospitalName
          ? ` to ${hospitalName}`
          : "") +
        `\nMore: ${visitLink}\n` +
        `Note: this is an automated, no-reply message from School Clinic.`;

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
