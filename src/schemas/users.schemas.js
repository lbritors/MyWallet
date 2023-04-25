import Joi from "joi";

export const userSchema = Joi.object({
    nome: Joi.string().required(),
    email: Joi.string().email().required(),
    senha: Joi.string().alphanum().min(3).required(),
    confirmeSenha: Joi.ref('senha')
});