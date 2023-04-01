import express from 'express';
import jwt from "jsonwebtoken";

import {validationResult} from "express-validator";
import {UserModel, UserModelInterface, UserModelDocumentInterface} from "../models/UserModel";
import { generateMD5 } from '../utils/generateHash';

import { isValidObjectId} from '../utils/isValidObjectId';

class UserController {
    //функция получения всей информации о авторизованном пользователе
    async show(req: any, res: express.Response): Promise<void> {
        try {
            //идентификатор авторизованного пользователя
            const userId = req.params.id;
            if (!isValidObjectId(userId)) {
                res.status(400).send();
                return;
            }
            //получаем из базы данных всю информацию о авторизованном пользователе, включая полную информацию о его твитах 
            const user = await UserModel.findById(userId).populate('tweets').exec();
            if (!user) {
                res.status(404).send();
                return;
            }
            res.json({
                status: 'success',
                data: user
            })
        } catch (error) {
            res.status(500).json({
                status: 'error',
                messsage: error
            })
        }
    }

    //функция регистрирации пользователя
    async create (req: express.Request, res: express.Response): Promise<void> {
        try {             
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({status: 'error', errors: errors.array()});
                return;
            }
            //собираем данные регистрируемого пользователя
            const data : UserModelInterface = {
                email: req.body.email,
                username: req.body.username,
                fullname: req.body.fullname,
                password: generateMD5(req.body.password + process.env.SECRET_KEY),
                confirmHash: generateMD5(process.env.SECRET_KEY || Math.random().toString())
            };
            //фиксируем регистрируемого пользователя в базе данных по данным пользователя 
            const user = await UserModel.create(data);
            res.status(201).json({
                status: 'success',
                data: user,
            });  
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error
            })
        }
    }

    //функция авторизизации пользователя
    async afterLogin(req: express.Request, res: express.Response): Promise<void> {
        try {
            const user = req.user ? (req.user as UserModelDocumentInterface).toJSON() : undefined;
            res.json({
                status: "success",
                data: {
                    ...user,
                    //создаем токен авторизации пользователя
                    token: jwt.sign({ data: req.user }, process.env.SECRET_KEY || '123', {
                        expiresIn: '30 days',
                    }),            
                }
            })
        } catch(error) {
            res.json({
                status: 'error',
                message: error
            })
        }
    }

    //функция получения информацию об авторизованном пользователе по токену, если токен есть
    async getUserInfo(req: express.Request, res: express.Response): Promise<void> {
        if (req.headers.token != undefined)
        {
            let token = req.headers.token as string;
            jwt.verify(token,process.env.SECRET_KEY || '123',(err, user) => 
            {
                if (err || !user) 
                {
                    res.json({
                        status: "empty",
                        data: null            
                    })
                }
                res.json({
                    status: "success",
                    data: (user  as   UserModelDocumentInterface)  
                })
            });            
        }
        else 
        {
            res.json({
                status: '',
                message: 'no user token'
            })            
        } 
    }
}

export const UserCtrl = new UserController();