"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClinicVisitStats = exports.getAllClinicVisits = exports.createClinicVisit = void 0;
const prisma_1 = __importDefault(require("../../configs/prisma"));
const smsService_1 = require("../../utils/smsService");
const SYSTEM_CONFIG_KEY = "system_config";
const FALLBACK_VISIT_TEMPLATE = "BCFI Clinic Alert\n" +
    "Student: {student}\n" +
    "Date: {date}\n" +
    "Reason: {reason}\n" +
    "Blood Pressure: {bp} mmHg\n" +
    "Temperature: {temp} °C\n" +
    "Pulse: {pulse} bpm\n" +
    "Diagnosis: {diagnosis}\n" +
    "Treatment: {treatment}\n" +
    "Emergency: {emergency}\n" +
    "Hospital: {hospital}";
const SMS_FOOTER = "\n\nAutomated message. Please do not reply.";
const formatVisitDate = (value) => new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
});
const buildVisitSmsMessage = async (visit) => {
    // Always use the fallback template to ensure consistent formatting.
    const template = FALLBACK_VISIT_TEMPLATE;
    const replacements = {
        student: `${visit.student.firstName} ${visit.student.lastName}`.trim(),
        date: formatVisitDate(visit.visitDateTime),
        reason: visit.symptoms || "N/A",
        bp: visit.bloodPressure || "N/A",
        temp: visit.temperature || "N/A",
        pulse: visit.pulseRate || "N/A",
        diagnosis: visit.diagnosis || "Pending",
        treatment: visit.treatment || "Pending",
        emergency: visit.isEmergency ? "YES" : "NO",
        hospital: visit.isReferredToHospital && visit.hospitalName
            ? visit.hospitalName
            : visit.isReferredToHospital
                ? "Referred"
                : "N/A",
    };
    const filled = Object.entries(replacements).reduce((msg, [key, value]) => {
        const matcher = new RegExp(`\\{${key}\\}`, "g");
        return msg.replace(matcher, value);
    }, template);
    return filled.includes("Automated message")
        ? filled
        : `${filled}${SMS_FOOTER}`;
};
const createClinicVisit = async (data, _actorId) => {
    const { recipientPhone, ...visitData } = data;
    const visit = await prisma_1.default.clinicVisit.create({
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
    const recipientName = visit.student.parent
        ? `${visit.student.parent.firstName} ${visit.student.parent.lastName}`.trim()
        : "N/A";
    let smsLog = visit.smsLog;
    let smsStatus = null;
    if (smsRecipient) {
        const smsMessage = await buildVisitSmsMessage(visit);
        const smsResult = await (0, smsService_1.sendSMS)(smsRecipient, smsMessage);
        const sent = smsResult.success !== false;
        smsLog = await prisma_1.default.smsLog.create({
            data: {
                clinicVisitId: visit.id,
                message: smsMessage,
                status: sent ? "SENT" : "FAILED",
                recipientName,
                recipientPhone: smsRecipient,
                sentAt: sent ? new Date() : null,
                failReason: sent
                    ? null
                    : typeof smsResult.error === "string"
                        ? smsResult.error
                        : smsResult.message ||
                            JSON.stringify(smsResult.error) ||
                            "Unknown SMS error",
            },
        });
        smsStatus = {
            success: sent,
            recipient: smsRecipient,
            message: smsResult.message ||
                (sent ? "SMS sent successfully" : "SMS delivery failed"),
            error: smsResult.error,
        };
    }
    else {
        smsStatus = {
            success: false,
            message: "No recipient phone provided; SMS skipped",
        };
    }
    return { ...visit, smsLog, smsStatus };
};
exports.createClinicVisit = createClinicVisit;
const getAllClinicVisits = async (search) => {
    const where = {};
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
    return await prisma_1.default.clinicVisit.findMany({
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
exports.getAllClinicVisits = getAllClinicVisits;
const getClinicVisitStats = async () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const totalVisits = await prisma_1.default.clinicVisit.count();
    const visitsToday = await prisma_1.default.clinicVisit.count({
        where: {
            createdAt: {
                gte: startOfDay,
                lt: endOfDay,
            },
        },
    });
    const emergencyVisits = await prisma_1.default.clinicVisit.count({
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
exports.getClinicVisitStats = getClinicVisitStats;
//# sourceMappingURL=clinicVisits.service.js.map