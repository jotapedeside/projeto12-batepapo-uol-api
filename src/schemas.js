import joi from 'joi';

const nameSchema = joi.object({
  name: joi.string().required().trim()
});

const messageSchema = joi.object({
  to: joi.string().required().trim(),
  text: joi.string().required().trim(),
  type: joi.required().valid('message', 'private_message')
}).unknown();

const userSchema = joi.object({
  user: joi.string().required()
}).unknown();

export { nameSchema, messageSchema, userSchema };