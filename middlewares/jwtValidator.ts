import type {NextApiRequest, NextApiResponse, NextApiHandler} from 'next';
import { DefaultResponse } from '../types/DefaultResponse';
import jwt, { JwtPayload } from 'jsonwebtoken';

const jwtValidator = (handler : NextApiHandler) => 
    async(req: NextApiRequest, res : NextApiResponse<DefaultResponse>) => {

    const {MY_SECRET_KEY} = process.env;
    if(!MY_SECRET_KEY){
        return res.status(500).json({error : 'Env MY_SECRET_KEY nao definida'});
    }

    if(!req || !req.headers){
        return res.status(401).json({error : 'Nao foi possivel validar o token de acesso'});
    }

    if(req.method !== 'OPTIONS'){
        const authorization = req.headers['authorization'];
        if(!authorization){
            return res.status(401).json({error : 'Nao foi possivel validar o token de acesso'});
        }

        const token = authorization.substr(7);
        if(!token){
            return res.status(401).json({error : 'Nao foi possivel validar o token de acesso'});
        }

        try{
            const decoded = jwt.verify(token, MY_SECRET_KEY) as JwtPayload;
            if(!decoded){
                return res.status(401).json({error : 'Nao foi possivel validar o token de acesso'});
            }

            if(req.body){
                req.body.userId = decoded._id;
            }else if(req.query){
                req.query.userId = decoded._id;
            }
        }catch(e){
            console.log(e);
            return res.status(500).json({error : 'Nao foi possivel validar o token de acesso, tente novamente.'});
        }
    }

    return handler(req, res);
}

export { jwtValidator }
