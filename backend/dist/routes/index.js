"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_route_1 = __importDefault(require("../api/auth/auth.route"));
const users_route_1 = __importDefault(require("../api/users/users.route"));
const students_route_1 = __importDefault(require("../api/students/students.route"));
const courses_route_1 = __importDefault(require("../api/courses/courses.route"));
const settings_route_1 = __importDefault(require("../api/settings/settings.route"));
const clinicVisits_route_1 = __importDefault(require("../api/clinicVisits/clinicVisits.route"));
const sms_route_1 = __importDefault(require("../api/sms/sms.route"));
router.use("/auth", auth_route_1.default);
router.use("/users", users_route_1.default);
router.use("/students", students_route_1.default);
router.use("/clinic-visits", clinicVisits_route_1.default);
router.use("/sms", sms_route_1.default);
router.use("/settings", settings_route_1.default);
router.use("/courses", courses_route_1.default);
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map