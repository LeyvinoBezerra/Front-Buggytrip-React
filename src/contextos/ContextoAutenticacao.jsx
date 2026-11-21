import { createContext, useCallback, useMemo, useState } from "react";
import AuthService from "../mock/AuthService.js";

export const AuthContext = createContext(null);

export default function ContextoAutenticacao({ children }) {
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(() =>
    AuthService.obterUsuarioAutenticado()
  );

  const iniciarSessao = useCallback((usuario) => {
    AuthService.logar(usuario);
    setUsuarioAutenticado(usuario);
  }, []);

  const encerrarSessao = useCallback(() => {
    AuthService.removerUsuarioAutenticado();
    setUsuarioAutenticado(null);
  }, []);

  const value = useMemo(
    () => ({
      usuarioAutenticado,
      isUsuarioAutenticado: Boolean(usuarioAutenticado),
      isUsuarioAdministrador: AuthService.isUsuarioAdministrador(usuarioAutenticado),
      iniciarSessao,
      encerrarSessao,
    }),
    [usuarioAutenticado, iniciarSessao, encerrarSessao]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
