import Joi from "joi";

export const getStatisticsMonthlyValidation = Joi.object({
  month: Joi.string().required(),
  amountType: Joi.string().valid("income", "expense").required(),
});

export const getStatisticsYearlyValidation = Joi.object({
  year: Joi.string().required(),
  amountType: Joi.string().valid("income", "expense").required(),
});
