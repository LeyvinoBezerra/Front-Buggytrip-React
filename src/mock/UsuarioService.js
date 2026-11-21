import MockDataService from "./MockDataService.js";

class UsuarioService {
  autenticar(credenciais) {
    return MockDataService.autenticar(credenciais);
  }

  obterSaldoPorUsuarioId(id) {
    return Promise.resolve({ data: { id } });
  }

  listarBugueiros(page = 0, size = 100) {
    return MockDataService.listarBugueiros(page, size);
  }

  salvarUsuario(usuario) {
    return MockDataService.salvarUsuario({ ...usuario, tipo: "CLIENTE" });
  }

  salvarBugueiro(bugueiro) {
    return MockDataService.salvarBugueiro({
      nome: bugueiro.nome,
      email: bugueiro.email,
      telefone: bugueiro.telefone || null,
    });
  }
}

const usuarioService = new UsuarioService();

export default usuarioService;
