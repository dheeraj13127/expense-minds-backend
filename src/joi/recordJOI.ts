import Joi from "joi";

export const createRecordValidation = Joi.object({
  userId: Joi.string()
    .required()
    .regex(/^[a-fA-F0-9]{24}$/),
  amount: Joi.number().required(),
  category: Joi.string().required(),
  amountType: Joi.string().required(),
  account: Joi.string().required(),
  note: Joi.string().allow(null, ""),
});

export const getRecordByDayValidation = Joi.object({
  day: Joi.string().required(),
});

export const getRecordByMonthValidation = Joi.object({
  month: Joi.string().required(),
});
