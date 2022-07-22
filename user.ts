const joi = require('joi');

export interface UserEntry {
  email: string;
  type: 'user' | 'admin';
  salt: string;
  passwordhash: string;
}

export interface UserDto {
  username: string;
  email: string;
  type: 'user' | 'admin';
  password: string;
}

export const userSchema = joi.object({
  username: joi.string().min(3).max(24).required(),
  email: joi.string().email().required(),
  type: joi.string().required(),
  password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{5,24}$')).required(),
});
