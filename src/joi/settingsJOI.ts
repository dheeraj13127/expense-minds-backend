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

export const createSubAccountValidation = Joi.object({
  groupId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(null, ""),
  amount: Joi.number().required(),
});

export const updateSubAccountValidation = Joi.object({
  groupId: Joi.string().required(),
  _id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(null, ""),
  amount: Joi.number().required(),
});

export const deleteSubAccountValidation = Joi.object({
  groupId: Joi.string().required(),
  id: Joi.string().required(),
});
