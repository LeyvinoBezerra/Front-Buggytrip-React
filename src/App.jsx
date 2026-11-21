import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootswatch/dist/materia/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import "./estilos/style.css";
import Navbar from "./componentes/Navbar.jsx";
import ContextoAutenticacao from "./contextos/ContextoAutenticacao.jsx";
import CadastroBugueiro from "./componentes/CadastroBugueiro.jsx";
import CadastroLancamentos from "./componentes/CadastroLancamentos.jsx";
import CadastroUsuario from "./componentes/CadastroUsuario.jsx";
import Home from "./componentes/Home.jsx";
import LancamentosConsulta from "./componentes/LancamentosConsulta.jsx";
import Login from "./componentes/Login.jsx";
import PaginaNaoEncontrada from "./componentes/PaginaNaoEncontrada.jsx";

export default function App() {
  return (
    <ContextoAutenticacao>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastrar-usuarios" element={<CadastroUsuario />} />
            <Route path="/cadastrar-bugueiro" element={<CadastroBugueiro />} />
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/avaliacoes" element={<LancamentosConsulta />} />
            <Route path="/consultar-lancamentos" element={<LancamentosConsulta />} />
            <Route path="/nova-avaliacao" element={<CadastroLancamentos />} />
            <Route path="/cadastrar-lancamentos" element={<CadastroLancamentos />} />
            <Route path="*" element={<PaginaNaoEncontrada />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ContextoAutenticacao>
  );
}
