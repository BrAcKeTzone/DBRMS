"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const validate = (schema, source = "body") => (req, res, next) => {
    const dataToValidate = req[source];
    const { value, error } = schema.validate(dataToValidate, {
        stripUnknown: true, // Strip unknown keys from the validated object
    });
    if (error) {
        const errorMessage = error.details
            .map((details) => details.message)
            .join(", ");
        return next(new ApiError_1.default(400, errorMessage));
    }
    Object.assign(req[source], value);
    return next();
};
exports.default = validate;
//# sourceMappingURL=validate.middleware.js.map