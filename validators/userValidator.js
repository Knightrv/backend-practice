const Joi = require('joi');
const passwordComplexity = require("joi-password-complexity");

const registerValidate = (data)=>{
    const schema = Joi.object({
        name: Joi.string().min(2).max(60).required(),
        email : Joi.string().min(5).max(200).required().email(),
        password : passwordComplexity().required()
    });
    return schema.validate(data);
};

const loginValidate = (data)=>{
    const schema = Joi.object({
        email : Joi.string().min(5).max(200).required().email(),
        password : passwordComplexity().required()
    });
    return schema.validate(data);
};

module.exports.loginValidate=loginValidate;
module.exports.registerValidate=registerValidate;