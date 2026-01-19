import prisma from "../../configs/prisma";

export const createClinicVisit = async (data: any) => {
  return await prisma.clinicVisit.create({
    data,
    include: {
      student: true,
    },
  });
};

export const getAllClinicVisits = async (search?: string) => {
  const where: any = {};

  // Current month filter
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  where.visitDateTime = {
    gte: startOfMonth,
    lte: endOfMonth,
  };

  if (search) {
    where.AND = [
      { visitDateTime: where.visitDateTime },
      {
        OR: [
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
        ],
      },
    ];
    // Remove the top level visitDateTime if we use AND
    delete where.visitDateTime;
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
