// import Joi from "joi";

// export const createCategorySchema = Joi.object({
//   name: Joi.string()
//     .trim()
//     .min(2)
//     .max(100)
//     .required(),

//   slug: Joi.string()
//     .trim()
//     .lowercase()
//     .min(2)
//     .max(120)
//     .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
//     .required(),

//   description: Joi.string()
//     .trim()
//     .allow("")
//     .max(1000)
//     .optional(),

//   isActive: Joi.boolean()
//     .optional(),
// });




// export const updateCategorySchema = Joi.object({
//   name: Joi.string()
//     .trim()
//     .min(2)
//     .max(100)
//     .optional(),

//   slug: Joi.string()
//     .trim()
//     .lowercase()
//     .min(2)
//     .max(120)
//     .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
//     .optional(),

//   description: Joi.string()
//     .trim()
//     .allow("")
//     .max(1000)
//     .optional(),

//   isActive: Joi.boolean()
//     .optional(),
// }).min(1);



import Joi from "joi";

export const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow("", null)
    .optional(),
});


export const listCategorySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  search: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .optional(),

  status: Joi.string()
    .valid("active", "inactive", "all")
    .default("all"),
});


export const categoryIdSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});



export const updateCategorySchema = Joi.object({
  id: Joi.number().integer().positive().required(),

  name: Joi.string().trim().min(2).max(100).required(),

  description: Joi.string().trim().allow("", null).optional(),

  isActive: Joi.boolean().optional(),
});