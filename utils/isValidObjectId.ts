import {mongoose} from "../core/db"

//функция проверки целостности идентификатора элемента по базе данных MongoDb
export const isValidObjectId = (id: any) => {
    return mongoose.Types.ObjectId.isValid(id)
}