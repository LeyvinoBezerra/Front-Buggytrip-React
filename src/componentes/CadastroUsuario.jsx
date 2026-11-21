import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import UsuarioService from "../mock/UsuarioService.js";
import {
  showToastError,
  showToastSuccess,
} from "../utilitarios/notificacoes.js";

export default function CadastroUsuario() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    repeat: "",
  });
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const onChangeInput = (event) => {
    setForm((current) => ({ ...current, [event.target.id]: event.target.value }));
  };

  const cadastrar = (event) => {
    event.preventDefault();
    const { nome, email, senha, repeat } = form;

    if (!nome || !email || !senha || !repeat) {
      showToastError("Preencha todos os campos.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToastError("Informe um e-mail válido.");
      return;
    }
    if (senha !== repeat) {
      showToastError("As senhas não são iguais.");
      return;
    }

    UsuarioService.salvarUsuario({ nome: nome.trim(), email: email.trim(), senha })
      .then(() => {
        showToastSuccess("Conta criada com sucesso!");
        setTimeout(() => setShouldRedirect(true), 800);
      })
      .catch((error) => {
        const data = error?.response?.data;
        showToastError(data?.detail || data?.message || "Não foi possível criar a conta.");
      });
  };

  if (shouldRedirect) {
    return <Navigate replace to="/login" />;
  }

  return (
    <>
      <ToastContainer />
      <main className="auth-shell auth-shell-small">
        <section className="auth-card auth-card-wide">
          <span className="eyebrow">Nova conta</span>
          <h2>Crie seu perfil</h2>
          <form onSubmit={cadastrar}>
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              className="form-control"
              placeholder="Seu nome"
              value={form.nome}
              onChange={onChangeInput}
            />

            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="nome@exemplo.com"
              value={form.email}
              onChange={onChangeInput}
            />

            <div className="form-grid">
              <div>
                <label htmlFor="senha">Senha</label>
                <input
                  id="senha"
                  type="password"
                  className="form-control"
                  placeholder="Mínimo seguro"
                  value={form.senha}
                  onChange={onChangeInput}
                />
              </div>
              <div>
                <label htmlFor="repeat">Repetir senha</label>
                <input
                  id="repeat"
                  type="password"
                  className="form-control"
                  placeholder="Repita a senha"
                  value={form.repeat}
                  onChange={onChangeInput}
                />
              </div>
            </div>

            <button type="submit" className="button button-primary button-full">
              Criar conta
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
