import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import {Strategy as JWTstrategy, ExtractJwt} from "passport-jwt";
import {UserModel, UserModelInterface} from "../models/UserModel";
//функция шифрования пароля
//password encryption function
import {generateMD5} from '../utils/generateHash'; 

passport.use(
    //проверяем есть ли пользователь по входящим данным email и password, который подлежит авторизации
    new LocalStrategy( async (email, password, done):Promise<void> => {
        try {
            //ищем пользователя по email
            const user = await UserModel.findOne({$or: [{email: email}]}).exec();

            if (!user){
                //такого пользователя нет, которого нужно авторизовать
                return done(null, false);
            } 

            if (!user.confirmed && user.password === generateMD5(password + process.env.SECRET_KEY)) {
                //такой пользователь есть начинаем его авторизацию
                return done(null, user);
            } else {
                //такого пользователя нет, которого нужно авторизовать
                return done(null, false); 
            }
        } catch(error) {
            done(error, false);
        }
    })
)

passport.use(
    //проверяем есть ли авторизованный пользователь
    new JWTstrategy(
        {
            secretOrKey: process.env.SECRET_KEY || '123',
            jwtFromRequest: ExtractJwt.fromHeader('token')
        },
        async(payload: {data: UserModelInterface}, done): Promise<void> => {

            try {
                //считаем, что авторизованный пользователь имеет идентификатор payload.data._id
                //ищем такого пользователя в базе данных
                const user = await UserModel.findById(payload.data._id).exec();

                if (user) {
                    //автоизованный пользователь есть, начинаем соответствующие
                    //операции по всем данным, которые к нему относятся
                    return done(null, user)
                }    
                
                //такого пользоаателя нет
                done(null, false);
            } catch (error) {
                done(error, false);
            }
        }
    )
)

//сериализация пользователя по паспорту
passport.serializeUser((user: UserModelInterface, done) => {
    done(null, user?._id)
});

export {passport};