import prisma from "../../configs/prisma";

export const createClinicVisit = async (data: any) => {
  return await prisma.clinicVisit.create({
    data,
    include: {
      student: true,
    },
  });
};

export const getAllClinicVisits = async () => {
  return await prisma.clinicVisit.findMany({
    include: {
      student: true,
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
    now.getDate() + 1
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
