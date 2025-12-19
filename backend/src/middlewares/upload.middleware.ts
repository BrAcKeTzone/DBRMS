import multer from "multer";
import ApiError from "../utils/ApiError";

// Configure multer to use memory storage (stores files in memory as Buffer)
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept image files only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only image files are allowed"));
  }
};

// File filter for documents (images and PDFs only)
const documentFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPEG, PNG, and PDF files are allowed"));
  }
};

// File filter for expenses breakdown (images and PDFs)
const expensesFileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPEG, PNG, GIF, and PDF files are allowed"));
  }
};

// Create multer instance with configuration for images
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Maximum 10 files
  },
});

// Create multer instance for document uploads
export const uploadDocument = multer({
  storage: storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file for documents
    files: 1, // Maximum 1 file per upload
  },
});

// Specialized middleware for resolution PDF files (strict PDF-only & 20MB)
export const uploadResolution = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Resolution file must be a PDF"));
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file for resolution
    files: 1,
  },
});

// Specialized middleware for expenses breakdown (images and PDFs, 50MB per file)
export const uploadExpenses = multer({
  storage: storage,
  fileFilter: expensesFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file for expenses
    files: 20, // Maximum 20 files
  },
});

export default upload;
