import { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "../contextos/ContextoAutenticacao.jsx";
import UsuarioService from "../mock/UsuarioService.js";
import { showToastError } from "../utilitarios/notificacoes.js";

export default function Login() {
  const { iniciarSessao } = useContext(AuthContext);
  const [form, setForm] = useState({ email: "", senha: "" });
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const onChangeInput = (event) => {
    setForm((current) => ({ ...current, [event.target.id]: event.target.value }));
  };

  const entrar = (event) => {
    event.preventDefault();
    const { email, senha } = form;

    if (!email || !senha) {
      showToastError("Informe o e-mail e a senha.");
      return;
    }

    UsuarioService.autenticar({ email: email.trim(), senha })
      .then((response) => {
        const data = response?.data || {};
        const usuario = data.usuario || data.user || data;
        iniciarSessao({
          ...usuario,
          id: usuario.id || data.userId,
          token: data.token,
        });
        setShouldRedirect(true);
      })
      .catch((error) => {
        const data = error?.response?.data;
        showToastError(
          data?.detail ||
            data?.message ||
            (typeof data === "string" ? data : null) ||
            "Não foi possível conectar ao servidor."
        );
      });
  };

  if (shouldRedirect) {
    return <Navigate replace to="/home" />;
  }

  return (
    <>
      <ToastContainer />
      <main className="auth-shell">
        <section className="auth-showcase">
          <span className="eyebrow">BuggyTrip</span>
          <h1>Encontre a melhor experiência sobre quatro rodas.</h1>
          <p>Avalie passeios, compartilhe feedback e descubra novos destinos.</p>
        </section>

        <section className="auth-card">
          <span className="eyebrow">Acesso</span>
          <h2>Bem-vindo de volta</h2>
          <form onSubmit={entrar}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="nome@exemplo.com"
              value={form.email}
              onChange={onChangeInput}
            />

            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              className="form-control"
              placeholder="Sua senha"
              value={form.senha}
              onChange={onChangeInput}
            />

            <button type="submit" className="button button-primary button-full">
              Entrar
            </button>
          </form>

          <p className="auth-link">
            Ainda não tem conta? <Link to="/cadastrar-usuarios">Criar conta</Link>
          </p>
          <div className="demo-account">
            <strong>Acesso de demonstração</strong>
            <br />
            Cliente: <strong>cliente@buggytrip.local</strong> / <strong>Cliente@123</strong>
            <br />
            Administrador: <strong>admin@buggytrip.local</strong> / <strong>Admin@123</strong>
          </div>
        </section>
      </main>
    </>
  );
}
