import express from 'express';

import { validationResult } from 'express-validator';
import { TweetModel } from '../models/TweetModel';
import { UserModel } from '../models/UserModel';
import { isValidObjectId } from "../utils/isValidObjectId";
import { UserModelInterface } from '../models/UserModel';

class TweetsController {
    //функция получения всех твитов из базы данных
    async index(_: express.Request, res: express.Response): Promise<void> {
        try {
            //получаем все твиты из базы данных и всю информацию по каждому твиту
            const tweets = await TweetModel.find({}).populate('user').sort({'createdAt': '-1'}).exec();
            res.json({
                status: 'success',
                data: tweets
            })
        } catch(error) {
            res.json({
                status: 'error',
                message: error
            })
        }
    }

    //функция получения твита из базы данных по идентификатору tweetId
    async show(req: express.Request, res: express.Response): Promise<void> {
        try {
            const tweetId = req.params.id;
            //проверяем целостность идентификатора tweetId
            if (!isValidObjectId(tweetId)) {
                res.status(400).send();
                return;
            }
            //получаемый твит
            const tweet = await TweetModel.findById(tweetId).populate('user').exec();
            if (!tweet) {
                res.status(404).send();
                return;
            }
            res.json({
                status: 'success',
                data: tweet
            })
        } catch (error) {
            res.status(500).json({
                status: 'error',
                messsage: error
            })
        }    
    }

    //функция получения всех твитов по авторизованному пользователю с идентификатором userId
    async getUserTweets(req: any, res: express.Response): Promise<void> {
        try {
            const userId = req.params.id;

            //проверяем целостность идентификатора userId
            if (!isValidObjectId(userId)) {
                res.status(400).send();
                return;
            }
            //получаемые твиты по авторизованному пользователю с идентификатором userId
            const tweet = await TweetModel.find({user: userId}).populate('user').exec();
            if (!tweet) {
                res.status(404).send();
                return;
            }
            res.json({
                status: 'success',
                data: tweet
            })
        } catch (error) {
            res.status(500).json({
                status: 'error',
                messsage: error
            })
        }    
    }

    //функция создания нового твита в базе данных твитов, который вводит авторизованный пользователь 
    //при этом список идентификаторов твитов авторизованного пользователя
    //пополняется идентификатором введенного им твита
    async create (req: express.Request, res: express.Response): Promise<void> {
        try {   
            //определяем авторизованного пользователя и его идентификатор  
            const user = req.user as UserModelInterface;
            if (user?._id) {
                const errors = validationResult(req);
                if (!errors.isEmpty()) 
                {
                    res.status(400).json({status: 'error', errors: errors.array()});
                    return;
                }
                //информация по новому твиту
                const data: any = {
                    text: req.body.text,
                    images: req.body.images,
                    user: user._id    
                }
                //фиксируем добавленный твит
                const tweet = await TweetModel.create(data);
                //вводим идентификатор добавленного твита в список идентификаторов твитов по определенному пользователю
                //который ввел добавленный твит
                UserModel.findById(user?._id, (err:any, user:any) => 
                {
                    if (err) 
                    {
                        res.status(500).json
                        ({
                            status: "error",
                            message: err,
                        });
                    }
    
                    if (!user) 
                    {
                        return res.status(404).json
                        ({
                            status: "not found",
                            message: err,
                        });
                    }
                    user.tweets!.push(tweet._id);
                    user.save();
                });
                res.json({
                    status: 'success',
                    data: await tweet.populate('user').execPopulate()
                });
            }
        }   catch (error) {
            res.status(500).json({
                status: 'error',
                message: error
            })
        }     
    }       

    //функция удаления любого твита от любого пользователя
    async delete (req: express.Request, res: express.Response): Promise<void> {
        try {
                //фиксируем идентификатор удаляемого твита
                const tweetId = req.params.id;
                //проверяем целостность идентификатора tweetId
                if (!isValidObjectId(tweetId)) {
                    res.status(400).send();
                    return;
                }
                //фиксируем удаляемый твит
                const tweet = await TweetModel.findById(tweetId);
                if (tweet) {
                    //определяем пользователя user который ввел удаляемый твит
                    UserModel.findById(tweet.user._id, (err:any, user:any) => 
                    {
                        if (err) 
                        {
                            res.status(500).json
                            ({
                                status: "error",
                                message: err,
                            });
                        }
                        if (!user) 
                        {
                            return res.status(404).json
                            ({
                                status: "not found",
                                message: err,
                            });
                        }
                        //удаляем идентификатор удаляемого твита из списка идентификаторов твитов 
                        //по определенному пользователю который ввел удаляемый твит
                        user.tweets!.remove(tweetId);
                        user.save();
                    });
                    //удаляем сам твит из базы данных твитов
                    tweet.remove();
                } else {
                    res.status(404).send();       
                }
            
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error
            })
        }
    }    
}

export const TweetsCtrl = new TweetsController();