"use strict";
// This file sets up and starts the Express server for the Online Management System for the Parent and Teacher Association of JHCSC Dumingag Campus.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const server = app_1.default.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Increase timeout for large file uploads (2 minutes)
server.timeout = 120000;
//# sourceMappingURL=server.js.map