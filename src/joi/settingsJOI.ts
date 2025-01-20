import Joi from "joi";

export const createCategoryValidation = Joi.object({
  categoryName: Joi.string().required(),
  categorySymbol: Joi.string().required(),
  categoryType: Joi.string().required(),
});

export const updateCategoryValidation = Joi.object({
  categoryName: Joi.string().required(),
  categorySymbol: Joi.string().required(),
  categoryType: Joi.string().required(),
  _id: Joi.string().required(),
});

export const deleteCategoryValidation = Joi.object({
  id: Joi.string().required(),
  categoryType: Joi.string().required(),
});
