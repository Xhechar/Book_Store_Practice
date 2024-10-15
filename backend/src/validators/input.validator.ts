import joi from 'joi';

export const loginsSchema = joi.object({
  email: joi.string().email().required().messages({
    'string.email': 'Invalid email address',
   'string.required': 'Email is required'
  }),
  password: joi.string().required().min(8).max(30).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8, 30}$')).messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password must be at most 30 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
   'string.required': 'Password is required'
  })
})