import prisma from "../../configs/prisma";

export const createClinicVisit = async (data: any, _actorId?: number) => {
  const { recipientPhone: _recipientPhone, ...visitData } = data;

  const visit = await prisma.clinicVisit.create({
    data: visitData,
    include: {
      student: {
        include: {
          parent: true,
        },
      },
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
