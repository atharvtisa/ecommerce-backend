import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const validate = (schema: Joi.ObjectSchema) => {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((detail) => detail.message),
      });

      return;
    }

    req.body = value;

    next();
  };
};