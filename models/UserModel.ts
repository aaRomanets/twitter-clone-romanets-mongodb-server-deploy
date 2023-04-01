import {model, Schema, Document} from "mongoose"

//интерфейс модели пользователя
export interface UserModelInterface {
    _id?: string,
    email: string;
    fullname: string;
    username: string;
    password: string;
    confirmHash: string;
    confirmed?: boolean;
    location?: string;
    about?: string;
    website?: string;
    tweets?: string[];
}

export type UserModelDocumentInterface = UserModelInterface & Document;

//модель данных пользователя
const UserSchema = new Schema<UserModelInterface>({
    email: {
        unigue: true,
        required: true,
        type: String
    },
    fullname : {
        required: true,
        type: String
    },
    username: {
        unigue: true,
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    confirmHash: {
        required: true,
        type: String
    },
    confirmed: {
        type: Boolean,
        default: false
    },
    location: String,
    about: String,
    website: String,
    //полную информацию по твитам пользователя можно получить по всем 
    //идентификаторам списка идентификаторов твитов пользователя
    //из базы данных по твитам пользователя на это указывает ссылка ref: "Tweet"
    tweets: [{type: Schema.Types.ObjectId, ref: "Tweet"}]
}, {
    timestamps: true    
})

UserSchema.set('toJSON', {
    transform: function(_: any, obj: any) {
        delete obj.password;
        delete obj.confirmHash;
        return obj;    
    }
})

//фиксируем базу данных по модели данных пользователя в MongoDb
export const UserModel = model<UserModelDocumentInterface>('User', UserSchema);