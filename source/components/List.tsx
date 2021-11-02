
import { NextPage } from "next";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { executeRequest } from "../services/api";
import { Task } from "../types/Task";
import { Item } from "./Item";
import moment from 'moment';

/* eslint-disable @next/next/no-img-element */

type ListProps = {
    tasks: Task[]
    getListaFiltrada() : void
}

const List: NextPage<ListProps> = ({
    tasks,
    getListaFiltrada
}) => {

    // states do modal/form
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [msgErro, setMsgErro] = useState('');
    
    const [_id, setId] = useState<string | undefined>('');
    const [name, setName] = useState('');
    const [finishPrevisionDate, setFinishPrevisionDate] = useState('');
    const [finishDate, setFinishDate] = useState('');

    const closeModal = () => {
        setName('');
        setFinishPrevisionDate('');
        setLoading(false);
        setMsgErro('');
        setShowModal(false);
    }

    const doUpdate = async() => {
        try {
            setLoading(true);
            setMsgErro('');

            if (!_id) {
                setMsgErro('Favor selecionar a tarefa');
                setLoading(false);
                return;
            }

            if (!name && !finishPrevisionDate) {
                setMsgErro('Favor informar os dados para cadastro da tarefa');
                setLoading(false);
                return;
            }

            const body : any = {
                name,
                finishPrevisionDate
            }

            if(finishDate){
                body.finishDate = finishDate;
            }

            const result = await executeRequest('task?id='+_id, 'PUT', body);
            if (result && result.data) {
                await getListaFiltrada();
                closeModal();
            }
        } catch (e: any) {
            console.log(e);
            if (e?.response?.data?.error) {
                setMsgErro(e?.response?.data?.error);
            } else {
                setMsgErro('Não foi possivel cadastrar tarefa, tente novamente');
            }
        }

        setLoading(false);
    }

    const doDelete = async() => {
        try {
            setLoading(true);
            setMsgErro('');

            if (!_id) {
                setMsgErro('Favor selecionar a tarefa');
                setLoading(false);
                return;
            }

            const result = await executeRequest('task?id='+_id, 'DELETE');
            await getListaFiltrada();
            closeModal();
        } catch (e: any) {
            console.log(e);
            if (e?.response?.data?.error) {
                setMsgErro(e?.response?.data?.error);
            } else {
                setMsgErro('Não foi possivel deletar tarefa, tente novamente');
            }
        }

        setLoading(false);
    }

    const setTaskAndShow = (task:Task) =>{
        setId(task._id);
        setName(task.name);
        setFinishPrevisionDate(moment(task.finishPrevisionDate).format('yyyy-MM-DD'));
        setFinishDate(task.finishDate ?moment(task.finishDate).format('yyyy-MM-DD') : '');
        setShowModal(true);
    }

    return (
        <>
            <div className={'container-list' + (tasks && tasks.length > 0 ? '' : ' vazia')}>
                {tasks && tasks.length > 0
                    ?
                    tasks.map(task => <Item task={task} key={task._id} setTaskAndShow={setTaskAndShow}/>)
                    :
                    <>
                        <img src="/empty-list.svg" alt="Nenhuma tarefa encontrada" />
                        <p>Você ainda não possui tarefas cadastradas!</p>
                    </>
                }
            </div>
            <Modal show={showModal}
                onHide={() => closeModal()}
                className="container-modal">
                <Modal.Body>
                    <p>Alterar a tarefa</p>
                    {msgErro && <p className="error">{msgErro}</p>}
                    <input type="text"
                        placeholder="Nome da tarefa"
                        value={name}
                        onChange={e => setName(e.target.value)} />
                    <input type="text"
                        placeholder="Data de previsão de conclusão"
                        value={finishPrevisionDate}
                        onChange={e => setFinishPrevisionDate(e.target.value)}
                        onFocus={e => e.target.type = "date"}
                        onBlur={e => finishPrevisionDate ? e.target.type = "date" : e.target.type = "text"} />
                    <input type="text"
                        placeholder="Data  de conclusão"
                        value={finishDate}
                        onChange={e => setFinishDate(e.target.value)}
                        onFocus={e => e.target.type = "date"}
                        onBlur={e => finishDate ? e.target.type = "date" : e.target.type = "text"} />
                </Modal.Body>
                <Modal.Footer>
                    <div className="button col-12">
                        <button
                            onClick={doUpdate}
                            disabled={isLoading}
                        >{isLoading ? "...Enviando dados" : "Atualizar"}</button>
                        <span onClick={doDelete}>Excluir</span>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export { List }