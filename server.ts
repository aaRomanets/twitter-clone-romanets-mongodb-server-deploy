import express from 'express';
const { cors } = require('cors-ts')
import multer from 'multer';
import bodyParser from 'body-parser';

import './core/db.ts';

import { registerValidations } from './validations/register';
import { passport } from './core/passport';
import { createTweetValidations } from './validations/createTweet';

import { TweetsCtrl } from './controllers/TweetsController';
import { UserCtrl } from './controllers/UserController';
import { UploadFileCtrl } from './controllers/UploadFileController';

const app = express();
//Parameters are Optional
app.use(
    cors({
        origin: '*',
        credentials: true,
    })
)

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//инициализируем паспорт
app.use(passport.initialize());

//запрос на получение информации об авторизованном пользователе по токену, если токен есть
app.get('/users/me', UserCtrl.getUserInfo);
//запрос на получение всей информации о авторизованном пользователе
app.get('/users/:id', UserCtrl.show);
//запрос на регистрирацию нового пользователя
//request for registration of new user
app.post('/auth/register', registerValidations, UserCtrl.create);
//запрос на авторизацию зарегистрированного пользователя
//сперва проверяем по passport.authenticate('local'), что
//авторизируемый пользователь уже есть в базе данных
app.post('/auth/login', passport.authenticate('local'), UserCtrl.afterLogin);

//запрос на получение всех твитов из базы данных
app.get('/tweets', TweetsCtrl.index);
//запрос на получение твита из базы данных по его идентификатору
app.get('/tweets/:id', TweetsCtrl.show);
//запрос на получение всех твитов по авторизованному пользователю    
app.get('/tweets/user/:id', TweetsCtrl.getUserTweets);
//запрос на удаление любого твита от любого пользователя
app.delete('/tweets/:id', TweetsCtrl.delete);
//запрос на создание нового твита в базе данных твитов, который вводит авторизованный пользователь
//есть ли авторизованный пользователь проверяем по passport.authenticate('jwt')
app.post('/tweets', passport.authenticate('jwt'), createTweetValidations, TweetsCtrl.create);

//запрос на загрузку изображений для твитов пользователя через cloudinary
app.post('/upload', upload.single('image'), UploadFileCtrl.upload);

//запускаем сервер
app.listen(process.env.PORT || 3001, (): void => {
    console.log("SERVER RUNNING!")
});