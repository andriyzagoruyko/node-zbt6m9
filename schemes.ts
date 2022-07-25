import joi from "joi"

export const registrationSchema = joi.object({
    username: joi.string().min(3).max(24).required(),
    email: joi.string().email().required(),
    type: joi.string().valid('user','admin').required(),
    password: joi.string().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[#?!@$%^&*-]).{5,24}$")).required(),
  });
  
export const loginScheme = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
  });
  