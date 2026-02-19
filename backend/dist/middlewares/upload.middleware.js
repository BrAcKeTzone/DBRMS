"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBackup = exports.uploadExpenses = exports.uploadResolution = exports.uploadDocument = void 0;
const multer_1 = __importDefault(require("multer"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
// Configure multer to use memory storage (stores files in memory as Buffer)
const storage = multer_1.default.memoryStorage();
// File filter to only accept images
const fileFilter = (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new ApiError_1.default(400, "Only image files are allowed"));
    }
};
// File filter for documents (images and PDFs only)
const documentFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new ApiError_1.default(400, "Only JPEG, PNG, and PDF files are allowed"));
    }
};
// File filter for expenses breakdown (images and PDFs)
const expensesFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "application/pdf",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new ApiError_1.default(400, "Only JPEG, PNG, GIF, and PDF files are allowed"));
    }
};
// Create multer instance with configuration for images
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10, // Maximum 10 files
    },
});
// Create multer instance for document uploads
exports.uploadDocument = (0, multer_1.default)({
    storage: storage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB per file for documents
        files: 1, // Maximum 1 file per upload
    },
});
// Specialized middleware for resolution PDF files (strict PDF-only & 20MB)
exports.uploadResolution = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        }
        else {
            cb(new ApiError_1.default(400, "Resolution file must be a PDF"));
        }
    },
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB per file for resolution
        files: 1,
    },
});
// Specialized middleware for expenses breakdown (images and PDFs, 50MB per file)
exports.uploadExpenses = (0, multer_1.default)({
    storage: storage,
    fileFilter: expensesFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file for expenses
        files: 20, // Maximum 20 files
    },
});
// Specialized middleware for Excel backup files (.xlsx)
exports.uploadBackup = (0, multer_1.default)({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];
        if (allowedMimeTypes.includes(file.mimetype) ||
            file.originalname.endsWith(".xlsx")) {
            cb(null, true);
        }
        else {
            cb(new ApiError_1.default(400, "Backup file must be an Excel (.xlsx) file"));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file for backup
        files: 1,
    },
});
exports.default = upload;
//# sourceMappingURL=upload.middleware.js.map