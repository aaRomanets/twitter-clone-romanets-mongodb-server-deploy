import { body } from 'express-validator';

//проверка данных нового пользователя по его регистрации
export const registerValidations = [
  body('email', 'Enter E-Mail')
    .isEmail()
    .withMessage('Incorrect E-Mail')
    .isLength({
        min: 10,
        max: 40,
    })
    .withMessage('Available quantity symbols in email from 10 to 40.'),
    body('fullname', 'Enter fullname')
    .isString()
    .isLength({
        min: 2,
        max: 40,
    })
    .withMessage('Available quantity symbols in name from 2 to 40.'),
    body('username', 'Indicate login')
    .isString()
    .isLength({
        min: 2,
        max: 40,
    })
    .withMessage('Available quantity symbols in login from 2 to 40.'),
    body('password', 'Specify password')
    .isString()
    .isLength({
        min: 6,
    })
    .withMessage('​Minimum length password 6 symbols')
    .custom((value, { req }) => {
        if (value !== req.body.password2) {
            throw new Error('Passwords not coinsides');
        } else {
            return value;
        }
    }),
];
