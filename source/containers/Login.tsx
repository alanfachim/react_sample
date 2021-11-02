
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
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const [error, setError] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [msgErro, setMsgErro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showModalValidation, setShowModalValidation] = useState(false);

    const [name, setName] = useState('');
    var [email, setEmail] = useState('');
    var [phone, setPhone] = useState('');
    const [code, setCode] = useState('');






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

            if (password != passwordConfirm) {
                setError('Senhas informadas não coincidem.');
                setLoading(false);
                return;
            }
            if (!phone) {
                setError('Você precisa informar um telefone válido.');
                setLoading(false);
                return;
            } else {
                phone = phone.replace(/[^0-9.]/g, "");
                //11123412345
                if (phone.length < 10 || phone.length > 11) {
                    setError('Telefone inválido');
                    setLoading(false);
                    return;
                } else {
                    if (phone.length == 12 && phone.substring(0, 1) == '0') {
                        phone = phone.substring(1, 11)
                    } else {
                        if (phone.length == 12) {
                            setError('Telefone é inválido');
                            setLoading(false);
                            return;
                        }
                    }
                }
            }
            email = login;


            const body = {
                name,
                email,
                phone,
                password
            }

            const result = await executeRequest('user', 'POST', body);
            if (result && result.data) {
                login = email;
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
                password,
                code
            }
            console.log(body);
            const result = await executeRequest('user', 'PUT', body);
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
            <form autoComplete="off">
                <p className="error">{error}</p>
                <h3 className={(showModal ? '' : 'cadastro-inativo')}>Registro de novo usuário.</h3>
                <div className={(showModal ? '' : 'cadastro-inativo') + ' input'}>
                    <img src="/name.svg" alt="Informe seu Nome" />
                    <input type="text"
                        placeholder="Nome do Usuário"
                        value={name}
                        onChange={e => setName(e.target.value)} />
                </div>
                <div className="input">
                    <img src="/mail.svg" alt="Informe seu email" />
                    <input type="text" placeholder="Informe seu email"
                        value={login} onChange={evento => setLogin(evento.target.value)} />
                </div>
                <div className={(showModal ? '' : 'cadastro-inativo') + ' input'}>
                    <img src="/phone.svg" alt="Informe seu telefone" />
                    <input type="text"
                        placeholder="+11123456789"
                        value={phone}
                        onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="input">
                    <img src="/lock.svg" alt="Informe sua senha" />
                    <input type="password" placeholder="Informe sua senha"
                        value={password} onChange={evento => setPassword(evento.target.value)} />
                </div>

                <div className={(showModal ? '' : 'cadastro-inativo') + ' input'}>
                    <img src="/lock.svg" alt="Confirme sua senha" />
                    <input type="password" placeholder="Repita sua senha"
                        value={passwordConfirm} onChange={evento => setPasswordConfirm(evento.target.value)} />
                </div>

                <button type="button" onClick={doSave} disabled={isLoading}
                    className={(showModal ? '' : 'cadastro-inativo ') + (isLoading ? 'loading' : '') + ' cadastrar'}>
                    {isLoading ? '...Carregando' : 'Registrar'}
                </button>
                <button type="button" onClick={doLogin} disabled={isLoading}
                    className={(!showModal ? '' : 'cadastro-inativo ') + (isLoading ? 'loading' : '') + ' cadastrar'}>
                    {isLoading ? '...Carregando' : 'Login'}
                </button>
                <div className={(!showModal ? '' : 'cadastro-inativo') + ' signin-break-wrapper'}>
                    <span className="signin-color-mid-gray">Essa é sua primeira vez? <a onClick={() => setShowModal(!showModal)} >Cadastrar</a></span>
                </div>
                <div className={(showModal ? '' : 'cadastro-inativo') + ' signin-break-wrapper'}>
                    <span className="signin-color-mid-gray">Ja é registrado? <a onClick={() => setShowModal(!showModal)} >Login</a></span>
                </div>

                <Modal show={showModalValidation}
                    className="container-modal">
                    <Modal.Body>
                        <p>Por favor insira o código para validação.</p>
                        {msgErro && <p className="error">{msgErro}</p>}
                        <input type="text"
                            placeholder={"Código enviado para o numero: " + phone}
                            value={code}
                            onChange={e => setCode(e.target.value)} />

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