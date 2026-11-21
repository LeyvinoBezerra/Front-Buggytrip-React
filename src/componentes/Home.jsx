import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthContext } from "../contextos/ContextoAutenticacao.jsx";
import LancamentoService from "../servicos/lancamentoService/LancamentoService.js";
import UsuarioService from "../servicos/usuarioService/UsuarioService.js";
import { showToastError } from "../utilitarios/notificacoes.js";

const criterios = [
  "seguranca",
  "conhecimentoRoteiro",
  "confortoVeiculo",
  "simpatiaMotorista",
  "experienciaGeral",
  "adaptabilidade",
  "paradasInteressantes",
];

async function carregarTodasPaginas(carregarPagina) {
  const primeiraResposta = await carregarPagina(0);
  const primeiraPagina = primeiraResposta.data;
  const paginas = Number(primeiraPagina?.totalPages) || 1;
  const respostasRestantes = await Promise.all(
    Array.from({ length: Math.max(paginas - 1, 0) }, (_, index) =>
      carregarPagina(index + 1)
    )
  );
  const dados = [primeiraPagina, ...respostasRestantes.map(({ data }) => data)];
  return dados.flatMap((pagina) =>
    Array.isArray(pagina) ? pagina : pagina?.content || []
  );
}

export default function Home() {
  const { usuarioAutenticado, isUsuarioAdministrador } = useContext(AuthContext);
  const [bugueiros, setBugueiros] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const carregarDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const [listaBugueiros, listaAvaliacoes] = await Promise.all([
        carregarTodasPaginas((page) => UsuarioService.listarBugueiros(page)),
        carregarTodasPaginas((page) => LancamentoService.buscarTodas(page)),
      ]);
      setBugueiros(listaBugueiros);
      setAvaliacoes(listaAvaliacoes);
    } catch (error) {
      const data = error?.response?.data;
      showToastError(
        data?.detail ||
          data?.message ||
          "Não foi possível carregar os dados do painel."
      );
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isUsuarioAdministrador) {
      carregarDashboard();
    }
  }, [isUsuarioAdministrador, carregarDashboard]);

  const mediaGeral = useMemo(() => {
    if (!avaliacoes.length) return "—";
    const soma = avaliacoes.reduce(
      (total, avaliacao) =>
        total + Number(avaliacao.notaMedia ?? avaliacao.media ?? 0),
      0
    );
    return (soma / avaliacoes.length).toFixed(1);
  }, [avaliacoes]);

  const ranking = useMemo(() => {
    const nomes = new Map(
      bugueiros.map((bugueiro) => [bugueiro.id, bugueiro.nome])
    );
    const grupos = new Map();

    avaliacoes.forEach((avaliacao) => {
      const id = avaliacao.bugueiroId || avaliacao.bugueiro?.id || avaliacao.bugueiro;
      if (!id) return;

      const notas = criterios
        .map((campo) => Number(avaliacao[campo]))
        .filter(Number.isFinite);
      const media = Number(
        avaliacao.notaMedia ??
          (notas.length
            ? notas.reduce((total, nota) => total + nota, 0) / notas.length
            : 0)
      );
      const grupo = grupos.get(id) || { id, mediaTotal: 0, quantidade: 0 };
      grupo.mediaTotal += media;
      grupo.quantidade += 1;
      grupos.set(id, grupo);
    });

    return [...grupos.values()]
      .map((grupo) => ({
        ...grupo,
        media: grupo.mediaTotal / grupo.quantidade,
        nome: nomes.get(grupo.id),
      }))
      .sort((a, b) => b.media - a.media)
      .slice(0, 5);
  }, [avaliacoes, bugueiros]);

  const avaliacoesRecentes = useMemo(
    () =>
      [...avaliacoes]
        .sort(
          (a, b) =>
            new Date(b.dataCriacao || 0).getTime() -
            new Date(a.dataCriacao || 0).getTime()
        )
        .slice(0, 5),
    [avaliacoes]
  );

  if (!usuarioAutenticado) {
    return <Navigate replace to="/login" />;
  }

  if (!isUsuarioAdministrador) {
    return (
      <main className="page-shell">
        <section className="hero-card">
          <div>
            <span className="eyebrow">Plataforma de experiências</span>
            <h1>Bem-vindo ao BuggyTrip</h1>
            <p>
              Compartilhe como foi sua experiência e ajude outros viajantes a
              escolher passeios com segurança e qualidade.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/nova-avaliacao">
                Nova avaliação
              </Link>
              <Link className="button button-secondary" to="/avaliacoes">
                Ver avaliações
              </Link>
            </div>
          </div>
          <div className="hero-mark" aria-hidden="true">
            ★
          </div>
        </section>

        <section className="feature-grid">
          <article className="feature-card">
            <span className="feature-icon">01</span>
            <h2>Avaliações completas</h2>
            <p>Registre os critérios mais importantes da sua experiência.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">02</span>
            <h2>Opiniões confiáveis</h2>
            <p>Uma avaliação por cliente para cada bugueiro registrado.</p>
          </article>
          <article className="feature-card">
            <span className="feature-icon">03</span>
            <h2>Decisões melhores</h2>
            <p>Compare notas e feedbacks antes de escolher seu passeio.</p>
          </article>
        </section>
      </main>
    );
  }

  const nomes = new Map(bugueiros.map((bugueiro) => [bugueiro.id, bugueiro.nome]));

  return (
    <>
      <ToastContainer />
      <main className="page-shell">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Visão administrativa</span>
            <h1>Painel de dados</h1>
            <p className="admin-dashboard-description">
              Acompanhe os bugueiros cadastrados e os resultados das avaliações.
            </p>
          </div>
          <button
            className="button button-secondary"
            type="button"
            onClick={carregarDashboard}
            disabled={dashboardLoading}
          >
            {dashboardLoading ? "Atualizando..." : "Atualizar dados"}
          </button>
        </div>

        {dashboardLoading && !bugueiros.length && !avaliacoes.length ? (
          <section className="surface-card empty-state">Carregando dados...</section>
        ) : (
          <>
            <section className="admin-metrics">
              <article className="admin-metric-card">
                <span className="eyebrow">Cadastro</span>
                <strong>{bugueiros.length}</strong>
                <span>Bugueiros cadastrados</span>
              </article>
              <article className="admin-metric-card">
                <span className="eyebrow">Participação</span>
                <strong>{avaliacoes.length}</strong>
                <span>Avaliações recebidas</span>
              </article>
              <article className="admin-metric-card admin-metric-highlight">
                <span className="eyebrow">Nota média</span>
                <strong>
                  {mediaGeral}
                  <small>/10</small>
                </strong>
                <span>Média geral das avaliações</span>
              </article>
            </section>

            <section className="admin-dashboard-columns">
              <article className="surface-card">
                <div className="surface-heading">
                  <div>
                    <span className="eyebrow">Destaques</span>
                    <h2>Bugueiros mais bem avaliados</h2>
                  </div>
                  <Link className="ranking-action" to="/avaliacoes">
                    Ver avaliações
                  </Link>
                </div>
                {ranking.length ? (
                  <div className="ranking-list">
                    {ranking.map((bugueiro, index) => (
                      <div className="ranking-row" key={bugueiro.id}>
                        <span className={`ranking-position ranking-position-${index + 1}`}>
                          {index + 1}
                        </span>
                        <div className="ranking-person">
                          <strong>{bugueiro.nome || `Bugueiro #${bugueiro.id}`}</strong>
                          <span>
                            {bugueiro.quantidade}{" "}
                            {bugueiro.quantidade === 1 ? "avaliação" : "avaliações"}
                          </span>
                        </div>
                        <div className="ranking-score">
                          <strong>{bugueiro.media.toFixed(1)}</strong>
                          <span>/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="admin-dashboard-empty">
                    Ainda não há avaliações para montar o ranking.
                  </p>
                )}
              </article>

              <article className="surface-card">
                <div className="surface-heading">
                  <div>
                    <span className="eyebrow">Atividade</span>
                    <h2>Avaliações recentes</h2>
                  </div>
                </div>
                {avaliacoesRecentes.length ? (
                  <div className="admin-recent-list">
                    {avaliacoesRecentes.map((avaliacao) => {
                      const bugueiroId =
                        avaliacao.bugueiroId ||
                        avaliacao.bugueiro?.id ||
                        avaliacao.bugueiro;
                      return (
                        <article className="admin-recent-item" key={avaliacao.id}>
                          <div>
                            <strong>
                              {nomes.get(bugueiroId) || `Bugueiro #${bugueiroId || "—"}`}
                            </strong>
                            <span>{avaliacao.diferencial || "Avaliação de passeio"}</span>
                          </div>
                          <strong className="admin-recent-score">
                            {Number(avaliacao.notaMedia ?? avaliacao.media ?? 0).toFixed(1)}/10
                          </strong>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="admin-dashboard-empty">Nenhuma avaliação cadastrada.</p>
                )}
              </article>
            </section>

            <div className="hero-actions admin-dashboard-actions">
              <Link className="button button-primary" to="/cadastrar-bugueiro">
                Cadastrar bugueiro
              </Link>
              <Link className="button button-secondary" to="/avaliacoes">
                Consultar avaliações
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
