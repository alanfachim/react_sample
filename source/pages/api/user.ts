import type { NextApiRequest, NextApiResponse } from 'next';
import md5 from 'md5';
import { DefaultResponse } from '../../types/DefaultResponse';
import { UserModel } from '../../models/UserModel';
import { dbConnect } from '../../middlewares/dbConnect';
import { User } from '../../types/User';
import jwt from 'jsonwebtoken';

import axios, { Method } from 'axios';

type LoginValidate = {
    login : string
    password : string
    code : string
}
 
const handler = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {
    try {
         
        switch (req.method) {
            case 'POST':
                return await create(req, res);
            case 'PUT':
                return await validate(req, res);
            default:
                break;
        }
        return res.status(400).json({ error: 'Metodo informado nao esta disponivel.' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Ocorreu erro ao cadastrar usuario, tente novamente.' });
    }
}

const validate = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    try {


        if(req.method !== 'PUT' || !req.body){
            return res.status(400).json({ error: 'Metodo informado nao esta disponivel.'});
        }

        const {MY_SECRET_KEY} = process.env;
        if(!MY_SECRET_KEY){
            return res.status(500).json({error : 'Env MY_SECRET_KEY nao definida'});
        }

        const obj : LoginValidate = req.body;
        console.log(obj);
        if(obj.login && obj.password){
            const usersFound = await UserModel.find({email : obj.login, password : md5(obj.password), validation : obj.code});
            console.log(usersFound);
            if(usersFound && usersFound.length > 0){  
                const user : User = usersFound[0];
                user.active = true;
                console.log(user);
               await UserModel.findByIdAndUpdate({_id : user?._id}, {active : true});  
                const token = jwt.sign({ _id : user._id}, MY_SECRET_KEY);
                return res.status(200).json({ name : user.name, email : user.email, token});
            }
        }


        await UserModel.create(obj);


        return res.status(201).json({ message: 'Favor validar usu??rio.' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Ocorreu erro ao cadastrar usuario, tente novamente.' });
    }
}

const create = async (req: NextApiRequest, res: NextApiResponse<DefaultResponse>) => {
    try {
        if (req.method !== 'POST' || !req.body) {
            return res.status(400).json({ error: 'Metodo informado nao esta disponivel.' });
        }

        const obj: User = req.body;

        if (!obj.name || obj.name.length < 3 || !obj.email || obj.email.length < 6
            || !obj.password || obj.password.length < 4) {
            return res.status(400).json({ error: 'Parametros de entrada invalido.' });
        }

        const existingUser = await UserModel.find({ email: obj.email });
        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ error: 'Ja existe usuario com o email informado.' });
        }

        obj.password = md5(obj.password);

        const { API_SMS } = process.env;
        if (!API_SMS) {
            return res.status(500).json({ error: 'Env API_SMS nao definida' });
        }
        var client = axios.create({
            baseURL: API_SMS,
            timeout: 30000
        });

        const result = await client.request<string, any>({
            url: '',
            method: 'POST',
            data:  `{"tel":"+55${obj.phone}"}`
        });
        console.log(result);
        if (result && result.data) {
            obj.validation = result.data['code'];
            
        } else {
            return res.status(400).json({ error: 'n??o foi possivel obter o c??digo' });
        }
        obj.active = false;
        console.log(obj);
        await UserModel.create(obj);


        return res.status(201).json({ message: 'Favor validar usu??rio.' });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: 'Ocorreu erro ao cadastrar usuario, tente novamente.' });
    }
}

export default dbConnect(handler);