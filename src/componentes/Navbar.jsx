import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contextos/ContextoAutenticacao.jsx";
import logo from "../assets/LogoBuggyTrip.png";

export default function Navbar() {
  const { pathname } = useLocation();
  const {
    isUsuarioAutenticado,
    isUsuarioAdministrador,
    encerrarSessao,
  } = useContext(AuthContext);
  const exibirLinksPublicos = !isUsuarioAutenticado && pathname !== "/login";

  return (
    <nav className="navbar navbar-expand-lg fixed-top navbar-dark bg-primary">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <img src={logo} alt="BuggyTrip" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Alternar navegação"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav">
            {exibirLinksPublicos && (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Entrar
                </Link>
              </li>
            )}
            {exibirLinksPublicos && (
              <li className="nav-item">
                <Link className="nav-link" to="/cadastrar-usuarios">
                  Criar conta
                </Link>
              </li>
            )}
            {isUsuarioAutenticado && (
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
            )}
            {isUsuarioAutenticado && (
              <li className="nav-item">
                <Link className="nav-link" to="/avaliacoes">
                  Avaliações
                </Link>
              </li>
            )}
            {isUsuarioAdministrador && (
              <li className="nav-item">
                <Link className="nav-link" to="/cadastrar-bugueiro">
                  Cadastrar bugueiro
                </Link>
              </li>
            )}
            {isUsuarioAutenticado && (
              <li className="nav-item">
                <Link className="nav-link" to="/login" onClick={encerrarSessao}>
                  Sair
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
