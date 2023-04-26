import Joi from "joi";

export const transactionSchema = Joi.object({
    valor: Joi.number().positive().precision(2).required(),
    descricao: Joi.string().required()
});