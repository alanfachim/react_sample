import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { Filter } from "../components/Filter";
import { Footer } from "../components/Footer";

import { Header } from "../components/Header";
import { List } from "../components/List";
import { executeRequest } from "../services/api";
import { AccessTokenProps } from "../types/AccessTokenProps";
import { Task } from "../types/Task";

/* eslint-disable @next/next/no-img-element */
const Home: NextPage<AccessTokenProps> = ({
    setToken
}) => {

    const [tasks, setTasks] = useState<Task[]>([]);
    const [finishPrevisionDateStart, setFinishPrevisionDateStart] = useState('');
    const [finishPrevisionDateEnd, setFinishPrevisionDateEnd] = useState('');
    const [status, setStatus] = useState('0');

    // states do modal/form
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [msgErro, setMsgErro] = useState('');
    const [name, setName] = useState('');
    const [finishPrevisionDate, setFinishPrevisionDate] = useState('');

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userMail');
        setToken('');
    }

    const getListaFiltrada = async () => {
        try {

            let query = `?status=${status}`;

            if (finishPrevisionDateStart) {
                query += `&finishPrevisionDateStart=${finishPrevisionDateStart}`;
            }

            if (finishPrevisionDateEnd) {
                query += `&finishPrevisionDateEnd=${finishPrevisionDateEnd}`;
            }

            const result = await executeRequest('task' + query, 'GET');
            if (result && result.data) {
                setTasks(result.data);
            }
        } catch (e: any) {
            console.log(e);
        }
    }

    useEffect(() => {
        getListaFiltrada();
    }, [finishPrevisionDateStart, finishPrevisionDateEnd, status]);

    const closeModal = () => {
        setName('');
        setFinishPrevisionDate('');
        setLoading(false);
        setMsgErro('');
        setShowModal(false);
    }

    const doSave = async() => {
        try {
            setLoading(true);
            setMsgErro('');
            if (!name && !finishPrevisionDate) {
                setMsgErro('Favor informar os dados para cadastro da tarefa');
                setLoading(false);
                return;
            }

            const body = {
                name,
                finishPrevisionDate
            }

            const result = await executeRequest('task', 'POST', body);
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

    return (
        <>
            <Header logout={logout} showModal={() => setShowModal(true)}/>
            <Filter
                finishPrevisionDateStart={finishPrevisionDateStart}
                finishPrevisionDateEnd={finishPrevisionDateEnd}
                status={status}
                setFinishPrevisionDateStart={setFinishPrevisionDateStart}
                setFinishPrevisionDateEnd={setFinishPrevisionDateEnd}
                setStatus={setStatus}
            />
            <List tasks={tasks} getListaFiltrada={getListaFiltrada}/>
            <Footer showModal={() => setShowModal(true)}/>
            <Modal show={showModal}
                onHide={() => closeModal()}
                className="container-modal">
                <Modal.Body>
                    <p>Adicionar uma tarefa</p>
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
                </Modal.Body>
                <Modal.Footer>
                    <div className="button col-12">
                        <button
                            onClick={doSave}
                            disabled={isLoading}
                        >{isLoading ? "...Enviando dados" : "Salvar"}</button>
                        <span onClick={closeModal}>Cancelar</span>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export { Home }
