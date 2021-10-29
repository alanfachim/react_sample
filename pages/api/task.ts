import type {NextApiRequest, NextApiResponse} from 'next';
import { dbConnect } from '../../middlewares/dbConnect';
import { jwtValidator } from '../../middlewares/jwtValidator';
import { TaskModel } from '../../models/TaskModel';
import { DefaultResponse } from '../../types/DefaultResponse';
import { GetTasksRequest } from '../../types/GetTasksRequest';
import { Task } from '../../types/Task';
import { TaskRequest } from '../../types/TaskRequest';

const handler = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse | Task []>) => {
    try{
        let userId = req.body?.userId;
        if(!userId){
            userId = req.query?.userId as string;
        }

        switch(req.method){
            case 'POST':
                return await saveTask(req, res, userId);
            case 'PUT':
                return await updateTask(req, res, userId);
            case 'DELETE':
                return await deleteTask(req, res, userId);
            case 'GET':
                return await getTasks(req, res, userId);
            default :
                break;
        }

        return res.status(400).json({ error: 'Metodo informado nao esta disponivel.'});
    }catch(e){
        console.log(e);
        res.status(500).json({ error: 'Ocorreu erro ao gerenciar tarefas, tente novamente.'});
    }
}

const validateBody = (obj : TaskRequest, userId : string | null | undefined) => {
    if(!obj.name || obj.name.length < 3){
        return 'Nome da tarefa invalido.';
    }

    if(!userId){
         return 'Usuario nao encontrado.';
    }

    if(!obj.finishPrevisionDate){
        return 'Data de previsao nao informada.';
    }
}

const saveTask = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse>, userId : string | null | undefined) => {
    const obj : TaskRequest = req.body;
    
    const msgValidation = validateBody(obj, userId);
    if(msgValidation){
        return res.status(400).json({ error: msgValidation});
    }

    const task : Task = {
        userId: userId as string,
        name: obj.name,
        finishPrevisionDate : obj.finishPrevisionDate
    };

    await TaskModel.create(task);
    return res.status(200).json({ message: 'Tarefa criada com sucesso.'});
}

const validateAndReturnTaskFound = async (req : NextApiRequest, userId : string | null | undefined) => {
    const taskId = req.query?.id as string;

    if(!userId){
        return null;
    }

    if(!taskId || taskId.trim() === ''){
        return null;
    }

    const taskFound = await TaskModel.findById(taskId);
    if(!taskFound || taskFound.userId !== userId){
        return null;
    }

    return taskFound;
}

const updateTask = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse>, userId : string | null | undefined) => {
    const obj : Task = req.body;
    
    const taskFound = await validateAndReturnTaskFound(req, userId);
    if(!taskFound){
        return res.status(400).json({ error: 'Tarefa nao encontrada'});
    }

    const msgValidation = validateBody(obj, userId);
    if(msgValidation){
        return res.status(400).json({ error: msgValidation});
    }

    taskFound.name = obj.name;
    taskFound.finishPrevisionDate = obj.finishPrevisionDate;
    taskFound.finishDate = obj.finishDate;

    await TaskModel.findByIdAndUpdate({ _id : taskFound._id}, taskFound);
    return res.status(200).json({ message: 'Tarefa alterada com sucesso.'});
}

const deleteTask = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse>, userId : string | null | undefined) => {
    const taskFound = await validateAndReturnTaskFound(req, userId);
    if(!taskFound){
        return res.status(400).json({ error: 'Tarefa nao encontrada'});
    }

    await TaskModel.findByIdAndDelete({ _id : taskFound._id});
    return res.status(200).json({ message: 'Tarefa deletada com sucesso.'});
}

const getTasks = async ( req : NextApiRequest, res : NextApiResponse<DefaultResponse | Task[]>, userId : string | null | undefined) => {
    const params : GetTasksRequest = req.query;

    const query = {
        userId
    } as any

    if(params?.finishPrevisionDateStart){
        query.finishPrevisionDate = { $gte : params?.finishPrevisionDateStart}
    }

    if(params?.finishPrevisionDateEnd){
        if(!params?.finishPrevisionDateStart){
            query.finishPrevisionDate = {}
        }
        query.finishPrevisionDate.$lte = params?.finishPrevisionDateEnd
    }

    if(params?.status){
        const status = parseInt(params.status);
        switch(status){
            case 1 :
                query.finishDate = null;
                break;
            case 2 :
                query.finishDate = { $ne : null};
                break;
            default: break;
        }
    }

    console.log('query', query);
    const result = await TaskModel.find(query) as Task[];
    return res.status(200).json(result);
}

export default dbConnect(jwtValidator(handler));
