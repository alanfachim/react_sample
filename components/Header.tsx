
import { NextPage } from "next";

/* eslint-disable @next/next/no-img-element */

type HeaderProps = {
    logout(): void
    showModal(): void
}

const Header: NextPage<HeaderProps> = ({
    logout,
    showModal
}) => {

    const fullName = localStorage.getItem('userName');
    const firstName = fullName?.split(' ')[0] || '';

    return (
        <div className="container-header">
            <img src="/logo.svg" alt="Logo Fiap" className="logo" />
            <button onClick={showModal}><span>+</span> Adicionar Tarefa</button>
            <div className="mobile">
                <span>Olá, {firstName}</span>
                <img src="/exit-mobile.svg" alt="Sair" className="logout" onClick={logout} />
            </div>
            <div className="desktop">
                <span>Olá, {firstName}</span>
                <img src="/exit-desktop.svg" alt="Sair" className="logout" onClick={logout} />
            </div>
        </div>
    );
}

export { Header }