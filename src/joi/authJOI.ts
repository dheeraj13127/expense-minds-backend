import Joi from "joi";

export const authVerifySchema = Joi.object({
  token: Joi.string().required(),
});
