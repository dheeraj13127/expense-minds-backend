import Joi from "joi";

export const processRecordsByDaySummaryValidation = Joi.object({
  recordsByDay: Joi.object().required(),
});

export const processRecordsByMonthSummaryValidation = Joi.object({
  recordsByMonth: Joi.object().required(),
});
