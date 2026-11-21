import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "../contextos/ContextoAutenticacao.jsx";
import LocalStorageService from "../mock/LocalStorageService.js";
import LancamentoService from "../mock/LancamentoService.js";
import UsuarioService from "../mock/UsuarioService.js";
import {
  showToastError,
  showToastSuccess,
} from "../utilitarios/notificacoes.js";

const criterios = [
  ["seguranca", "Segurança"],
  ["conhecimentoRoteiro", "Conhecimento do roteiro"],
  ["confortoVeiculo", "Conforto do veículo"],
  ["simpatiaMotorista", "Simpatia do motorista"],
  ["experienciaGeral", "Experiência geral"],
  ["adaptabilidade", "Adaptabilidade"],
  ["paradasInteressantes", "Paradas interessantes"],
];

const initialForm = {
  avaliadorId: "",
  bugueiroId: "",
  bugueiros: [],
  carregandoBugueiros: true,
  seguranca: 10,
  conhecimentoRoteiro: 10,
  confortoVeiculo: 10,
  simpatiaMotorista: 10,
  experienciaGeral: 10,
  adaptabilidade: 10,
  paradasInteressantes: 10,
  diferencial: "",
  feedback: "",
};

export default function CadastroLancamentos() {
  const { usuarioAutenticado } = useContext(AuthContext);
  const [form, setForm] = useState(initialForm);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const usuario = LocalStorageService.obterItem("_usuario_logado");
    if (usuario) {
      setForm((current) => ({
        ...current,
        avaliadorId: usuario.id || usuario.userId || "",
      }));
    }

    UsuarioService.listarBugueiros(0, 100)
      .then((response) => {
        const primeiraPagina = response.data;
        const paginas = Number(primeiraPagina?.totalPages) || 1;
        const outrasPaginas = Array.from(
          { length: Math.max(paginas - 1, 0) },
          (_, index) => UsuarioService.listarBugueiros(index + 1, 100)
        );

        return Promise.all(outrasPaginas).then((respostas) => {
          const listas = [primeiraPagina, ...respostas.map(({ data }) => data)].map(
            (data) => (Array.isArray(data) ? data : data?.content || [])
          );
          setForm((current) => ({
            ...current,
            bugueiros: listas.flat(),
            carregandoBugueiros: false,
          }));
        });
      })
      .catch((error) => {
        setForm((current) => ({ ...current, carregandoBugueiros: false }));
        const data = error?.response?.data;
        showToastError(
          data?.detail || data?.message || "Não foi possível carregar os bugueiros."
        );
      });
  }, []);

  const onChange = (event) => {
    const value = ["bugueiroId", ...criterios.map(([key]) => key)].includes(
      event.target.id
    )
      ? Number(event.target.value)
      : event.target.value;
    setForm((current) => ({ ...current, [event.target.id]: value }));
  };

  const media = (
    criterios.reduce((total, [key]) => total + Number(form[key]), 0) /
    criterios.length
  ).toFixed(1);

  const salvar = (event) => {
    event.preventDefault();
    if (!form.bugueiroId) {
      showToastError("Selecione o bugueiro que deseja avaliar.");
      return;
    }

    const avaliacao = {
      ...form,
      avaliadorId: Number(form.avaliadorId),
      bugueiroId: Number(form.bugueiroId),
    };
    delete avaliacao.bugueiros;
    delete avaliacao.carregandoBugueiros;

    LancamentoService.salvar(avaliacao)
      .then(() => {
        showToastSuccess("Avaliação enviada com sucesso!");
        setTimeout(() => setShouldRedirect(true), 700);
      })
      .catch((error) => {
        const data = error?.response?.data;
        showToastError(
          data?.detail || data?.message || "Não foi possível enviar a avaliação."
        );
      });
  };

  if (!usuarioAutenticado) {
    return <Navigate replace to="/login" />;
  }
  if (shouldRedirect) {
    return <Navigate replace to="/avaliacoes" />;
  }

  return (
    <>
      <ToastContainer />
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Compartilhe sua experiência</span>
            <h1>Nova avaliação</h1>
          </div>
          <Link className="button button-secondary" to="/avaliacoes">
            Cancelar
          </Link>
        </div>

        <form className="evaluation-layout" onSubmit={salvar}>
          <section className="surface-card">
            <div className="surface-heading">
              <div>
                <span className="eyebrow">Notas</span>
                <h2>Como foi o passeio?</h2>
              </div>
              <div className="rating-average">
                <strong>{media}</strong>
                <span>média</span>
              </div>
            </div>

            <div className="criteria-grid">
              {criterios.map(([key, label]) => (
                <div className="criterion" key={key}>
                  <div className="criterion-heading">
                    <label htmlFor={key}>{label}</label>
                    <strong>{form[key]}</strong>
                  </div>
                  <input
                    id={key}
                    type="range"
                    min="0"
                    max="10"
                    value={form[key]}
                    onChange={onChange}
                  />
                </div>
              ))}
            </div>
          </section>

          <aside className="surface-card evaluation-details">
            <span className="eyebrow">Detalhes</span>
            <h2>Identifique o passeio</h2>

            <label htmlFor="bugueiroId">Bugueiro</label>
            <select
              id="bugueiroId"
              className="form-control"
              value={form.bugueiroId}
              onChange={onChange}
              disabled={
                form.carregandoBugueiros || form.bugueiros.length === 0
              }
            >
              <option value="">
                {form.carregandoBugueiros
                  ? "Carregando bugueiros..."
                  : form.bugueiros.length
                    ? "Selecione um bugueiro"
                    : "Nenhum bugueiro cadastrado"}
              </option>
              {form.bugueiros.map((bugueiro) => (
                <option key={bugueiro.id} value={bugueiro.id}>
                  {bugueiro.nome}
                  {bugueiro.email ? ` (${bugueiro.email})` : ""}
                </option>
              ))}
            </select>

            <label htmlFor="diferencial">Diferencial</label>
            <input
              id="diferencial"
              className="form-control"
              placeholder="Ex.: Conhecimento das praias"
              value={form.diferencial}
              onChange={onChange}
            />

            <label htmlFor="feedback">Comentário</label>
            <textarea
              id="feedback"
              className="form-control"
              rows="5"
              placeholder="Conte como foi sua experiência..."
              value={form.feedback}
              onChange={onChange}
            />

            <button type="submit" className="button button-primary button-full">
              Enviar avaliação
            </button>
          </aside>
        </form>
      </main>
    </>
  );
}
