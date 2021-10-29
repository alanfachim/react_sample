import type {NextApiRequest, NextApiResponse} from 'next';
import { UserModel } from '../../models/UserModel';
import { DefaultResponse } from '../../types/DefaultResponse';
import md5 from 'md5';
import { User } from '../../types/User';
import { dbConnect } from '../../middlewares/dbConnect';
import jwt from 'jsonwebtoken';

type LoginRequest = {
    login : string
    password : string
}

type LoginResponse = {
    name : string
    email : string
    token : string
}

const handler = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse | LoginResponse>) => {
    try{
        if(req.method !== 'POST' || !req.body){
            return res.status(400).json({ error: 'Metodo informado nao esta disponivel.'});
        }

        const {MY_SECRET_KEY} = process.env;
        if(!MY_SECRET_KEY){
            return res.status(500).json({error : 'Env MY_SECRET_KEY nao definida'});
        }

        const obj : LoginRequest = req.body;
        if(obj.login && obj.password){
            const usersFound = await UserModel.find({email : obj.login, password : md5(obj.password), active : true});
            if(usersFound && usersFound.length > 0){
                const user : User = usersFound[0];
                const token = jwt.sign({ _id : user._id}, MY_SECRET_KEY);
                return res.status(200).json({ name : user.name, email : user.email, token});
            }
        }

        return res.status(400).json({ error: 'Parametros de entrada invalido.'});
    }catch(e){
        console.log(e);
        res.status(500).json({ error: 'Ocorreu erro ao efetuar login, tente novamente.'});
    }
} 

export default dbConnect(handler);