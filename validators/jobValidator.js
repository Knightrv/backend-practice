const Joi = require('joi');

const jobValidate = (data)=>{
    const schema = Joi.object({
        title: Joi.string().min(2).max(60).required(),
        description : Joi.string().min(5).max(2000).required(),
        vacancies : Joi.number().integer().min(1).max(100).required()
    });
    return schema.validate(data);
};


module.exports.jobValidate=jobValidate;