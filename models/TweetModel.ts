import {model, Schema, Document} from "mongoose"
import {UserModelDocumentInterface} from './UserModel';

//модель твита пользователя
export interface TweetModelInterface {
    _id?: string;
    text: string;
    user: UserModelDocumentInterface;
    images?: string[];
}

export type TweetModelDocumentInterface = TweetModelInterface & Document;

const TweetSchema = new Schema<TweetModelInterface>({
    text: {
        required: true,
        type: String,
        maxlength: 280
    },
    //информацию о пользователе можно получить по базе данных пользователей на это указывает ссылка ref: 'User'
    user: {
        required: true,
        ref: 'User',
        type: Schema.Types.ObjectId
    },
    images: [
        {
            type: String
        }
    ]
}, {
    timestamps: true
})

//фиксируем базу данных по модели твита пользователя в MongoDb
export const TweetModel = model<TweetModelDocumentInterface>('Tweet', TweetSchema);