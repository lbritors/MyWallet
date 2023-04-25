import Joi from "joi";

export const transactionSchema = Joi.object({
    tipo: Joi.string().required(),
    data: Joi.allow().required(),
    valor: Joi.number().positive().precision(2).required(),
    descricao: Joi.string().required()
});