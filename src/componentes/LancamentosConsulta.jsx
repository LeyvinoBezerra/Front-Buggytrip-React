import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "../contextos/ContextoAutenticacao.jsx";
import LancamentoService from "../mock/LancamentoService.js";
import UsuarioService from "../mock/UsuarioService.js";
import {
  showToastError,
  showToastSuccess,
} from "../utilitarios/notificacoes.js";

const normalizarLista = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
};

const camposCriterios = [
  ["seguranca", "Segurança"],
  ["conhecimentoRoteiro", "Roteiro"],
  ["confortoVeiculo", "Conforto"],
  ["simpatiaMotorista", "Simpatia"],
  ["experienciaGeral", "Experiência"],
  ["adaptabilidade", "Adaptação"],
  ["paradasInteressantes", "Paradas"],
];

export default function LancamentosConsulta() {
  const { usuarioAutenticado } = useContext(AuthContext);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [nomesBugueiros, setNomesBugueiros] = useState({});
  const [loading, setLoading] = useState(true);

  const buscarAvaliacoes = useCallback(async () => {
    setLoading(true);
    try {
      const [avaliacoesResponse, bugueirosResponse] = await Promise.all([
        LancamentoService.buscar({ page: 0, size: 20, sort: "id,desc" }),
        UsuarioService.listarBugueiros(0, 100),
      ]);
      const primeiraPaginaBugueiros = bugueirosResponse.data;
      const totalPaginas = Number(primeiraPaginaBugueiros?.totalPages) || 1;
      const outrasPaginas = await Promise.all(
        Array.from({ length: Math.max(totalPaginas - 1, 0) }, (_, index) =>
          UsuarioService.listarBugueiros(index + 1, 100)
        )
      );
      const bugueiros = [
        ...normalizarLista(primeiraPaginaBugueiros),
        ...outrasPaginas.flatMap(({ data }) => normalizarLista(data)),
      ];

      setAvaliacoes(normalizarLista(avaliacoesResponse.data));
      setNomesBugueiros(
        Object.fromEntries(
          bugueiros.map((bugueiro) => [bugueiro.id, bugueiro.nome])
        )
      );
    } catch (error) {
      const data = error?.response?.data;
      showToastError(
        data?.detail ||
          data?.message ||
          "Não foi possível carregar as avaliações."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usuarioAutenticado) {
      buscarAvaliacoes();
    }
  }, [usuarioAutenticado, buscarAvaliacoes]);

  const deletar = (id) => {
    if (!window.confirm("Deseja excluir esta avaliação?")) return;
    LancamentoService.deletar(id)
      .then(() => {
        showToastSuccess("Avaliação excluída.");
        buscarAvaliacoes();
      })
      .catch((error) => {
        showToastError(
          error?.response?.data?.detail || "Não foi possível excluir."
        );
      });
  };

  const criteriosResumo = useMemo(
    () =>
      camposCriterios.map(([campo, label]) => {
        const valores = avaliacoes
          .map((avaliacao) => Number(avaliacao[campo]))
          .filter(Number.isFinite);
        const media = valores.length
          ? valores.reduce((total, valor) => total + valor, 0) / valores.length
          : 0;
        return { label, media };
      }),
    [avaliacoes]
  );

  const ranking = useMemo(() => {
    const grupos = {};
    avaliacoes.forEach((avaliacao) => {
      const bugueiroId =
        avaliacao.bugueiroId || avaliacao.bugueiro?.id || avaliacao.bugueiro;
      if (!bugueiroId) return;

      const notas = camposCriterios
        .map(([campo]) => Number(avaliacao[campo]))
        .filter(Number.isFinite);
      const mediaIndividual = notas.length
        ? notas.reduce((total, nota) => total + nota, 0) / notas.length
        : Number(avaliacao.media || avaliacao.nota || 0);

      if (!grupos[bugueiroId]) {
        grupos[bugueiroId] = {
          bugueiroId,
          notas: [],
          nome:
            nomesBugueiros[bugueiroId] ||
            avaliacao.bugueiro?.nome,
        };
      }
      grupos[bugueiroId].notas.push(mediaIndividual);
    });

    return Object.values(grupos)
      .map((grupo) => ({
        ...grupo,
        media:
          grupo.notas.reduce((total, nota) => total + nota, 0) /
          grupo.notas.length,
        totalAvaliacoes: grupo.notas.length,
      }))
      .sort((a, b) => b.media - a.media)
      .slice(0, 5);
  }, [avaliacoes, nomesBugueiros]);

  if (!usuarioAutenticado) {
    return <Navigate replace to="/login" />;
  }

  return (
    <>
      <ToastContainer />
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Comunidade</span>
            <h1>Avaliações</h1>
          </div>
          <Link className="button button-primary" to="/nova-avaliacao">
            Nova avaliação
          </Link>
        </div>

        {loading ? (
          <div className="surface-card empty-state">Carregando avaliações...</div>
        ) : avaliacoes.length === 0 ? (
          <div className="surface-card empty-state">
            <span className="empty-icon">★</span>
            <h2>Nenhuma avaliação encontrada</h2>
            <p>Seja o primeiro a compartilhar sua experiência.</p>
            <Link className="button button-primary" to="/nova-avaliacao">
              Avaliar passeio
            </Link>
          </div>
        ) : (
          <>
            <section id="ranking" className="surface-card ranking-card">
              <div className="surface-heading">
                <div>
                  <span className="eyebrow">Melhores experiências</span>
                  <h2>Ranking dos bugueiros</h2>
                </div>
                <Link className="button button-primary" to="/nova-avaliacao">
                  Avaliar agora
                </Link>
              </div>

              <div className="ranking-list">
                {ranking.map((bugueiro, index) => (
                  <article className="ranking-row" key={bugueiro.bugueiroId}>
                    <span className={`ranking-position ranking-position-${index + 1}`}>
                      {index + 1}
                    </span>
                    <div className="ranking-person">
                      <div className="ranking-person-name">
                        <span className="buggy-logo" role="img" aria-label="Buggy">
                          🚙
                        </span>
                        <strong>
                          {bugueiro.nome || `Bugueiro #${bugueiro.bugueiroId}`}
                        </strong>
                      </div>
                      <span>
                        {bugueiro.totalAvaliacoes}{" "}
                        {bugueiro.totalAvaliacoes === 1
                          ? "avaliação"
                          : "avaliações"}
                      </span>
                    </div>
                    <div className="ranking-score">
                      <strong>{bugueiro.media.toFixed(1)}</strong>
                      <span>/10</span>
                    </div>
                    <Link
                      className="ranking-action"
                      to="/nova-avaliacao"
                      title={`Avaliar bugueiro #${bugueiro.bugueiroId}`}
                    >
                      Avaliar
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            <section className="surface-card chart-card">
              <div className="surface-heading">
                <div>
                  <span className="eyebrow">Resumo geral</span>
                  <h2>Médias por critério</h2>
                </div>
                <span className="chart-count">{avaliacoes.length} avaliações</span>
              </div>
              <div
                className="bar-chart"
                role="img"
                aria-label="Gráfico de médias das avaliações"
              >
                {criteriosResumo.map(({ label, media }) => (
                  <div className="bar-row" key={label}>
                    <span className="bar-label">{label}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${media * 10}%` }} />
                    </div>
                    <strong>{media.toFixed(1)}</strong>
                  </div>
                ))}
              </div>
            </section>

            <div className="evaluation-grid">
              {avaliacoes.map((avaliacao) => (
                <article className="evaluation-card" key={avaliacao.id}>
                  <div className="evaluation-card-top">
                    <span className="evaluation-score">
                      {Number(avaliacao.media || avaliacao.nota || 0).toFixed(1)}
                      <small>/10</small>
                    </span>
                    <button
                      className="icon-button"
                      type="button"
                      title="Excluir avaliação"
                      onClick={() => deletar(avaliacao.id)}
                    >
                      ×
                    </button>
                  </div>
                  <h2>{avaliacao.diferencial || "Experiência de passeio"}</h2>
                  <p>{avaliacao.feedback || "Sem comentário adicional."}</p>
                  <div className="evaluation-meta">
                    <span>
                      Bugueiro #
                      {avaliacao.bugueiroId || avaliacao.bugueiro?.id || "-"}
                    </span>
                    {avaliacao.avaliadorId && (
                      <span>Avaliador #{avaliacao.avaliadorId}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
