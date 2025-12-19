import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import ApiError from "../utils/ApiError";

const validate =
  (schema: Joi.ObjectSchema, source: "body" | "params" | "query" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[source];

    const { value, error } = schema.validate(dataToValidate, {
      stripUnknown: true, // Strip unknown keys from the validated object
    });

    if (error) {
      const errorMessage = error.details
        .map((details) => details.message)
        .join(", ");
      return next(new ApiError(400, errorMessage));
    }
    Object.assign(req[source], value);
    return next();
  };

export default validate;
