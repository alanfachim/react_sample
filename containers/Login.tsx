
import React, { useState } from "react";
import axios from 'axios';
import { executeRequest } from "../services/api";
import { NextPage } from "next";
import { AccessTokenProps } from "../types/AccessTokenProps";
import { Modal } from "react-bootstrap";

/* eslint-disable @next/next/no-img-element */
export const Login: NextPage<AccessTokenProps> = ({
    setToken
}) => {

    var [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [msgErro, setMsgErro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalValidation, setShowModalValidation] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');



    const closeModal = () => {
        /* setName('');
        setEmail('');
        setPassword(''); */
        setShowModal(false);
    }

    const closeModalValidation = () => {
        setName('');
        setEmail('');
        setPassword('');
        setShowModalValidation(false);
    }

    const doSave = async () => {
        try {
            setLoading(true);
            setMsgErro('');
            if (!name && !email && !password) {
                setMsgErro('Favor informar os dados para cadastro do usuário');
                setLoading(false);
                return;
            }

            const body = {
                name,
                email,
                password
            }

            const result = await executeRequest('user', 'POST', body);
            if (result && result.data) {
                login = email; 
                closeModal();
                setShowModalValidation(true)
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

    const doValidation = async () => {
        try {
            setLoading(true);
            setError('');
            if (!login && !password) {
                setError('Favor informar email e senha');
                setLoading(false);
                return;
            }

            const body = {
                login,
                password
            }
            console.log(body);
            const result = await executeRequest('login', 'PUT', body);
            if (result && result.data) {
                localStorage.setItem('accessToken', result.data.token);
                localStorage.setItem('userName', result.data.name);
                localStorage.setItem('userMail', result.data.mail);
                setToken(result.data.token);
            } else {
                setError('Não foi possivel processar login, tente novamente');
            }
        } catch (e: any) {
            console.log(e);
            if (e?.response?.data?.error) {
                setError(e?.response?.data?.error);
            } else {
                setError('Não foi possivel processar login, tente novamente');
            }
        }

        setLoading(false);
    }

    const doLogin = async () => {
        try {
            setLoading(true);
            setError('');
            if (!login && !password) {
                setError('Favor informar email e senha');
                setLoading(false);
                return;
            }

            const body = {
                login,
                password
            }
            console.log(body);
            const result = await executeRequest('login', 'POST', body);
            if (result && result.data) {
                localStorage.setItem('accessToken', result.data.token);
                localStorage.setItem('userName', result.data.name);
                localStorage.setItem('userMail', result.data.mail);
                setToken(result.data.token);
            } else {
                setError('Não foi possivel processar login, tente novamente');
            }
        } catch (e: any) {
            console.log(e);
            if (e?.response?.data?.error) {
                setError(e?.response?.data?.error);
            } else {
                setError('Não foi possivel processar login, tente novamente');
            }
        }

        setLoading(false);
    }

    return (
        <div className="container-login">
            <img src="/logo.svg" alt="Logo Fiap" className="logo" />
            <form>
                <p className="error">{error}</p>
                <div className="input">
                    <img src="/mail.svg" alt="Informe seu email" />
                    <input type="text" placeholder="Informe seu email"
                        value={login} onChange={evento => setLogin(evento.target.value)} />
                </div>
                <div className="input">
                    <img src="/lock.svg" alt="Informe sua senha" />
                    <input type="password" placeholder="Informe sua senha"
                        value={password} onChange={evento => setPassword(evento.target.value)} />
                </div>
                <button type="button"  onClick={doLogin} disabled={isLoading}
                    className={(isLoading ? 'loading' : '')+' cadastrar'}>
                    {isLoading ? '...Carregando' : 'Login'}
                </button>
                <div className="signin-break-wrapper">
                    <span className="signin-color-mid-gray">Essa é sua primeira vez?</span>
                </div>
                <button type="button" onClick={() => setShowModal(true)} disabled={isLoading}
                    className={isLoading ? 'loading' : ''}>
                    {isLoading ? '...Carregando' : 'Cadastrar'}
                </button>
                <Modal show={showModal}
                    onHide={() => closeModal()}
                    className="container-modal">
                    <Modal.Body>
                        <p>Cadastre o seu usuário.</p>
                        {msgErro && <p className="error">{msgErro}</p>}
                        <input type="text"
                            placeholder="Nome do Usuário"
                            value={name}
                            onChange={e => setName(e.target.value)} />
                        <input type="email"
                            placeholder="E-mail do Usuário"
                            value={email}
                            onChange={e => setEmail(e.target.value)} />
                        <input type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <input type="password"
                            placeholder="Confirme sua senha"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="button col-12">
                            <button
                                onClick={doSave}
                                disabled={isLoading}
                            >{isLoading ? "...Enviando dados" : "Cadastrar"}</button>
                            <span onClick={closeModal}>Cancelar</span>
                        </div>
                    </Modal.Footer>
                </Modal>
                <Modal show={showModalValidation}
                    onHide={() => closeModal()}
                    className="container-modal">
                    <Modal.Body>
                        <p>Por favor insira o código para validação.</p>
                        {msgErro && <p className="error">{msgErro}</p>}
                        <input type="text"
                            placeholder="Código enviado para o numero (00000)"
                            value={name}
                            onChange={e => setName(e.target.value)} />
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="button col-12">
                            <button
                                onClick={doValidation}
                                disabled={isLoading}
                            >{isLoading ? "...Enviando dados" : "Cadastrar"}</button>
                            <span onClick={closeModalValidation}>Cancelar</span>
                        </div>
                    </Modal.Footer>
                </Modal>
            </form>
        </div>
    )
}