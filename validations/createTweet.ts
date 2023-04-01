import { body } from 'express-validator';

//проверяем что максимальная длина сообщения в твите должна составлять 280 символов
export const createTweetValidations = [
  body('text', 'Введите текст твита')
    .isString()
    .isLength({
        max: 280
    })
    .withMessage('Максимальная длина твита 280 символов')
];