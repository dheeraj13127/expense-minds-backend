import Joi from "joi";

export const createCurrencyValidation = Joi.object({
  name: Joi.string().required(),
  symbol: Joi.string().required(),
  country: Joi.string().required(),
});

export const getUserCurrencyValidation = Joi.object({
  _id: Joi.string().required(),
});
