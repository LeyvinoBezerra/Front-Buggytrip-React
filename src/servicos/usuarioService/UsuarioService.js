import ApiService from "../ApiService.js";

const USUARIOS = "/api/v1";

class UsuarioService extends ApiService {
  constructor() {
    super(USUARIOS);
  }

  autenticar(credenciais) {
    return this.post("/auth/login", credenciais);
  }

  obterSaldoPorUsuarioId(id) {
    return this.get(`/users/${id}`);
  }

  listarBugueiros(page = 0, size = 100) {
    return this.get(`/bugueiros?page=${page}&size=${size}`);
  }

  salvarUsuario(usuario) {
    return this.post("/users", { ...usuario, tipo: "CLIENTE" });
  }

  salvarBugueiro(bugueiro) {
    return this.post("/bugueiros", {
      nome: bugueiro.nome,
      email: bugueiro.email,
      telefone: bugueiro.telefone || null,
    });
  }
}

const usuarioService = new UsuarioService();

export default usuarioService;
