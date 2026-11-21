import LocalStorageService from "./LocalStorageService.js";

export const USUARIO_LOGADO = "_usuario_logado";

export default class AuthService{

  static isUsuarioAutenticado() {
    const usuario = LocalStorageService.obterItem(USUARIO_LOGADO);
    return !!(usuario && (usuario.token || usuario.id));
  }

  static removerUsuarioAutenticado() {
    LocalStorageService.removerItem(USUARIO_LOGADO)
  }

  static logar(usuario) {
    LocalStorageService.addItem(USUARIO_LOGADO, usuario);
  }

  static obterUsuarioAutenticado() {
    return LocalStorageService.obterItem(USUARIO_LOGADO);
  }

  static isUsuarioAdministrador(usuario = LocalStorageService.obterItem(USUARIO_LOGADO)) {
    if (!usuario) return false;

    const valores = [
      usuario.tipo,
      usuario.role,
      usuario.perfil,
      usuario.tipoUsuario,
      usuario.userRole,
      ...(Array.isArray(usuario.roles) ? usuario.roles : []),
      ...(Array.isArray(usuario.authorities) ? usuario.authorities : []),
    ]
      .flatMap((valor) => {
        if (typeof valor === "string") return [valor];
        if (valor && typeof valor === "object") return [valor.nome, valor.name, valor.role, valor.authority];
        return [];
      })
      .filter((valor) => typeof valor === "string")
      .map((valor) => valor.replace(/^ROLE_/i, "").trim().toUpperCase());

    return ["ADM", "ADMIN", "ADMINISTRADOR"].some((perfil) => valores.includes(perfil));
  }
}