import Joi from "joi";

export const updateSettingSchema = Joi.object({
  storeName: Joi.string()
    .trim()
    .max(150)
    .optional(),

  storeEmail: Joi.string()
    .trim()
    .email()
    .max(150)
    .optional(),

  storePhone: Joi.string()
    .trim()
    .max(30)
    .optional(),

  storeAddress: Joi.string()
    .trim()
    .optional(),

  currency: Joi.string()
    .trim()
    .uppercase()
    .max(10)
    .optional(),

  facebookUrl: Joi.string()
    .trim()
    .uri()
    .allow("")
    .optional(),

  instagramUrl: Joi.string()
    .trim()
    .uri()
    .allow("")
    .optional(),

  whatsappNumber: Joi.string()
    .trim()
    .max(30)
    .allow("")
    .optional(),

  storeDescription: Joi.string()
    .trim()
    .allow("")
    .optional(),

  footerText: Joi.string()
    .trim()
    .allow("")
    .optional(),

});