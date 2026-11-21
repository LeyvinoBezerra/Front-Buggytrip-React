import { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "../contextos/ContextoAutenticacao.jsx";
import UsuarioService from "../servicos/usuarioService/UsuarioService.js";
import {
  showToastError,
  showToastSuccess,
} from "../utilitarios/notificacoes.js";

export default function CadastroBugueiro() {
  const { isUsuarioAdministrador, isUsuarioAutenticado } = useContext(AuthContext);
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" });
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.id]: event.target.value }));
  };

  const cadastrar = (event) => {
    event.preventDefault();
    const { nome, email, telefone } = form;

    if (!nome || !email) {
      showToastError("Preencha nome e e-mail.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToastError("Informe um e-mail válido.");
      return;
    }

    UsuarioService.salvarBugueiro({
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
    })
      .then(() => {
        showToastSuccess("Bugueiro cadastrado com sucesso!");
        setTimeout(() => setShouldRedirect(true), 800);
      })
      .catch((error) => {
        const data = error?.response?.data;
        showToastError(
          data?.detail ||
            data?.message ||
            "Não foi possível cadastrar o bugueiro."
        );
      });
  };

  if (!isUsuarioAdministrador) {
    return <Navigate replace to={isUsuarioAutenticado ? "/home" : "/login"} />;
  }
  if (shouldRedirect) {
    return <Navigate replace to="/home" />;
  }

  return (
    <>
      <ToastContainer />
      <main className="auth-shell auth-shell-small">
        <section className="auth-card auth-card-wide">
          <span className="eyebrow">Área administrativa</span>
          <h2>Cadastrar bugueiro</h2>
          <p className="registration-description">
            Cadastre uma conta com perfil BUGUEIRO.
          </p>
          <form onSubmit={cadastrar}>
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              className="form-control"
              placeholder="Seu nome"
              value={form.nome}
              onChange={onChange}
            />

            <label htmlFor="email">E-mail profissional</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="nome@exemplo.com"
              value={form.email}
              onChange={onChange}
            />

            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone"
              className="form-control"
              placeholder="Opcional"
              value={form.telefone}
              onChange={onChange}
            />

            <button type="submit" className="button button-primary button-full">
              Cadastrar bugueiro
            </button>
          </form>
          <p className="auth-link">
            Já possui conta? <Link to="/login">Entrar</Link>
          </p>
        </section>
      </main>
    </>
  );
}
