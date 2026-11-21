import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootswatch/dist/materia/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import "./estilos/global.css";
import Navbar from "./componentes/Navbar/Navbar.jsx";
import ContextoAutenticacao from "./contextos/ContextoAutenticacao.jsx";
import CadastroBugueiro from "./paginas/CadastroBugueiro.jsx";
import CadastroLancamentos from "./paginas/CadastroLancamentos.jsx";
import CadastroUsuario from "./paginas/CadastroUsuario.jsx";
import Home from "./paginas/Home.jsx";
import LancamentosConsulta from "./paginas/LancamentosConsulta.jsx";
import Login from "./paginas/Login.jsx";
import PaginaNaoEncontrada from "./paginas/PaginaNaoEncontrada.jsx";

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
