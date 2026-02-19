"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const error_middleware_1 = __importDefault(require("./middlewares/error.middleware"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
// Increase payload size limit to handle large file uploads and base64 encoded images
app.use(body_parser_1.default.json({ limit: "100mb" }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "100mb" }));
// Routes
app.use("/api", index_1.default);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to BCFI Clinic Portal API",
        version: "1.0.0",
        status: "active",
    });
});
// Error handling middleware
app.use(error_middleware_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map