/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} Validation result with strength and requirements
 */
export const validatePassword = (password) => {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const metRequirements = Object.values(requirements).filter(Boolean).length;
  let strength = "weak";

  if (metRequirements >= 4) {
    strength = "strong";
  } else if (metRequirements >= 3) {
    strength = "medium";
  }

  return {
    isValid: metRequirements >= 3,
    strength,
    requirements,
    score: metRequirements,
  };
};

/**
 * Validate required fields in a form
 * @param {object} data - Form data object
 * @param {array} requiredFields - Array of required field names
 * @returns {object} Validation result
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  const missingFields = [];

  requiredFields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      errors[field] = "This field is required";
      missingFields.push(field);
    }
  });

  return {
    isValid: missingFields.length === 0,
    errors,
    missingFields,
  };
};

/**
 * Validate file upload
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxFiles = 10,
  } = options;

  const errors = [];

  if (!file) {
    errors.push("No file selected");
    return { isValid: false, errors };
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${formatFileSize(maxSize)}`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(
      `File type not allowed. Allowed types: ${allowedTypes.join(", ")}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate multiple files
 * @param {FileList|Array} files - Files to validate
 * @param {object} options - Validation options
 * @returns {object} Validation result
 */
export const validateFiles = (files, options = {}) => {
  const { maxFiles = 10 } = options;
  const errors = [];
  const fileErrors = [];

  if (!files || files.length === 0) {
    errors.push("No files selected");
    return { isValid: false, errors, fileErrors };
  }

  if (files.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }

  Array.from(files).forEach((file, index) => {
    const fileValidation = validateFile(file, options);
    if (!fileValidation.isValid) {
      fileErrors[index] = fileValidation.errors;
    }
  });

  return {
    isValid: errors.length === 0 && fileErrors.length === 0,
    errors,
    fileErrors,
  };
};

/**
 * Validate application form data
 * @param {object} formData - Application form data
 * @returns {object} Validation result
 */
export const validateApplicationForm = (formData) => {
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "program",
    "education",
  ];
  const errors = {};

  // Check required fields
  const requiredValidation = validateRequiredFields(formData, requiredFields);
  Object.assign(errors, requiredValidation.errors);

  // Validate email
  if (formData.email && !isValidEmail(formData.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Validate phone
  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.phone = "Please enter a valid phone number";
  }

  // Validate documents
  if (formData.documents && formData.documents.length > 0) {
    const fileValidation = validateFiles(formData.documents);
    if (!fileValidation.isValid) {
      errors.documents = fileValidation.errors.concat(
        fileValidation.fileErrors.flat().filter(Boolean)
      );
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Sanitize HTML content
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHtml = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.textContent = html;
  return tempDiv.innerHTML;
};

/**
 * Escape HTML characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHtml = (text) => {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
};
