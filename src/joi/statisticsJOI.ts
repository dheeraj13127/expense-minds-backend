import Joi from "joi";

export const getStatisticsMonthlyValidation = Joi.object({
  month: Joi.string().required(),
  amountType: Joi.string().valid("income", "expense").required(),
});
