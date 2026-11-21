const STORAGE_KEYS = {
  usuarios: "buggytrip_mock_usuarios",
  bugueiros: "buggytrip_mock_bugueiros",
  avaliacoes: "buggytrip_mock_avaliacoes",
};

const usuariosIniciais = [
  {
    id: 1,
    nome: "Admin BuggyTrip",
    email: "admin@buggytrip.local",
    senha: "Admin@123",
    tipo: "ADMIN",
  },
  {
    id: 2,
    nome: "Cliente BuggyTrip",
    email: "cliente@buggytrip.local",
    senha: "Cliente@123",
    tipo: "CLIENTE",
  },
];

const bugueirosIniciais = [
  { id: 1, nome: "João das Dunas", email: "joao@buggytrip.local", telefone: "(85) 99911-2233" },
  { id: 2, nome: "Marina Costa", email: "marina@buggytrip.local", telefone: "(85) 99922-3344" },
  { id: 3, nome: "Rafael do Farol", email: "rafael@buggytrip.local", telefone: "(85) 99933-4455" },
  { id: 4, nome: "Lúcia das Falésias", email: "lucia@buggytrip.local", telefone: "(85) 99944-5566" },
];

const avaliacoesIniciais = [
  {
    id: 1,
    avaliadorId: 2,
    bugueiroId: 1,
    seguranca: 10,
    conhecimentoRoteiro: 9,
    confortoVeiculo: 9,
    simpatiaMotorista: 10,
    experienciaGeral: 10,
    adaptabilidade: 9,
    paradasInteressantes: 10,
    media: 9.6,
    notaMedia: 9.6,
    diferencial: "Pôr do sol nas dunas",
    feedback: "Passeio incrível, com paradas lindas e muita atenção à segurança.",
    dataCriacao: "2026-11-18T16:30:00.000Z",
  },
  {
    id: 2,
    avaliadorId: 2,
    bugueiroId: 2,
    seguranca: 9,
    conhecimentoRoteiro: 10,
    confortoVeiculo: 9,
    simpatiaMotorista: 10,
    experienciaGeral: 9,
    adaptabilidade: 10,
    paradasInteressantes: 9,
    media: 9.4,
    notaMedia: 9.4,
    diferencial: "Rota pelas falésias",
    feedback: "A Marina conhece cada mirante e deixou o passeio muito confortável.",
    dataCriacao: "2026-11-19T13:15:00.000Z",
  },
  {
    id: 3,
    avaliadorId: 2,
    bugueiroId: 3,
    seguranca: 9,
    conhecimentoRoteiro: 9,
    confortoVeiculo: 8,
    simpatiaMotorista: 9,
    experienciaGeral: 9,
    adaptabilidade: 8,
    paradasInteressantes: 10,
    media: 8.9,
    notaMedia: 8.9,
    diferencial: "Parada no farol",
    feedback: "Ótimo roteiro e vistas bonitas. Recomendo levar água.",
    dataCriacao: "2026-11-20T10:45:00.000Z",
  },
];

function clonar(valor) {
  return JSON.parse(JSON.stringify(valor));
}

function lerLista(chave, dadosIniciais) {
  const armazenado = localStorage.getItem(chave);
  if (armazenado === null) {
    const inicial = clonar(dadosIniciais);
    localStorage.setItem(chave, JSON.stringify(inicial));
    return inicial;
  }

  const valor = JSON.parse(armazenado);
  if (!Array.isArray(valor)) {
    throw new Error(`Os dados mockados em "${chave}" estão inválidos.`);
  }
  return valor;
}

function salvarLista(chave, lista) {
  localStorage.setItem(chave, JSON.stringify(lista));
}

function proximoId(lista) {
  return lista.reduce((maior, item) => Math.max(maior, Number(item.id) || 0), 0) + 1;
}

function criarErro(mensagem, status = 400) {
  return Object.assign(new Error(mensagem), {
    response: { status, data: { message: mensagem, detail: mensagem } },
  });
}

function paginar(lista, page = 0, size = 100) {
  const pagina = Math.max(0, Number(page) || 0);
  const tamanho = Math.max(1, Number(size) || 100);
  const inicio = pagina * tamanho;
  return {
    content: clonar(lista.slice(inicio, inicio + tamanho)),
    totalElements: lista.length,
    totalPages: Math.ceil(lista.length / tamanho),
    number: pagina,
    size: tamanho,
  };
}

const MockDataService = {
  autenticar({ email, senha }) {
    const usuario = lerLista(STORAGE_KEYS.usuarios, usuariosIniciais).find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.senha === senha
    );
    if (!usuario) {
      return Promise.reject(criarErro("E-mail ou senha inválidos.", 401));
    }

    const usuarioSemSenha = Object.fromEntries(
      Object.entries(usuario).filter(([chave]) => chave !== "senha")
    );
    return Promise.resolve({
      data: {
        ...usuarioSemSenha,
        usuario: usuarioSemSenha,
        token: `mock-token-${usuario.id}`,
      },
    });
  },

  listarBugueiros(page = 0, size = 100) {
    return Promise.resolve({
      data: paginar(lerLista(STORAGE_KEYS.bugueiros, bugueirosIniciais), page, size),
    });
  },

  salvarUsuario(dados) {
    const usuarios = lerLista(STORAGE_KEYS.usuarios, usuariosIniciais);
    if (usuarios.some((usuario) => usuario.email.toLowerCase() === dados.email.toLowerCase())) {
      return Promise.reject(criarErro("Já existe uma conta com este e-mail.", 409));
    }

    const usuario = {
      ...dados,
      id: proximoId(usuarios),
      tipo: "CLIENTE",
    };
    usuarios.push(usuario);
    salvarLista(STORAGE_KEYS.usuarios, usuarios);
    return Promise.resolve({ data: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  },

  salvarBugueiro(dados) {
    const bugueiros = lerLista(STORAGE_KEYS.bugueiros, bugueirosIniciais);
    if (bugueiros.some((bugueiro) => bugueiro.email.toLowerCase() === dados.email.toLowerCase())) {
      return Promise.reject(criarErro("Já existe um bugueiro com este e-mail.", 409));
    }

    const bugueiro = { ...dados, id: proximoId(bugueiros) };
    bugueiros.push(bugueiro);
    salvarLista(STORAGE_KEYS.bugueiros, bugueiros);
    return Promise.resolve({ data: clonar(bugueiro) });
  },

  buscarAvaliacoes(filtro = {}) {
    let avaliacoes = lerLista(STORAGE_KEYS.avaliacoes, avaliacoesIniciais);
    if (filtro.bugueiroId) {
      avaliacoes = avaliacoes.filter(
        (avaliacao) => String(avaliacao.bugueiroId) === String(filtro.bugueiroId)
      );
    }
    if (filtro.sort === "id,desc") {
      avaliacoes = [...avaliacoes].sort((a, b) => b.id - a.id);
    }
    return Promise.resolve({
      data: paginar(avaliacoes, filtro.page, filtro.size),
    });
  },

  buscarAvaliacaoPorId(id) {
    const avaliacao = lerLista(STORAGE_KEYS.avaliacoes, avaliacoesIniciais).find(
      (item) => String(item.id) === String(id)
    );
    if (!avaliacao) return Promise.reject(criarErro("Avaliação não encontrada.", 404));
    return Promise.resolve({ data: clonar(avaliacao) });
  },

  salvarAvaliacao(dados) {
    const avaliacoes = lerLista(STORAGE_KEYS.avaliacoes, avaliacoesIniciais);
    const notas = [
      dados.seguranca,
      dados.conhecimentoRoteiro,
      dados.confortoVeiculo,
      dados.simpatiaMotorista,
      dados.experienciaGeral,
      dados.adaptabilidade,
      dados.paradasInteressantes,
    ].map(Number);
    const media = Number(
      (notas.reduce((total, nota) => total + nota, 0) / notas.length).toFixed(1)
    );
    const avaliacao = {
      ...dados,
      id: proximoId(avaliacoes),
      media,
      notaMedia: media,
      dataCriacao: new Date().toISOString(),
    };
    avaliacoes.push(avaliacao);
    salvarLista(STORAGE_KEYS.avaliacoes, avaliacoes);
    return Promise.resolve({ data: clonar(avaliacao) });
  },

  atualizarAvaliacao(id, dados) {
    const avaliacoes = lerLista(STORAGE_KEYS.avaliacoes, avaliacoesIniciais);
    const indice = avaliacoes.findIndex((item) => String(item.id) === String(id));
    if (indice < 0) return Promise.reject(criarErro("Avaliação não encontrada.", 404));

    avaliacoes[indice] = { ...avaliacoes[indice], ...dados, id: avaliacoes[indice].id };
    salvarLista(STORAGE_KEYS.avaliacoes, avaliacoes);
    return Promise.resolve({ data: clonar(avaliacoes[indice]) });
  },

  deletarAvaliacao(id) {
    const avaliacoes = lerLista(STORAGE_KEYS.avaliacoes, avaliacoesIniciais);
    const restantes = avaliacoes.filter((item) => String(item.id) !== String(id));
    if (restantes.length === avaliacoes.length) {
      return Promise.reject(criarErro("Avaliação não encontrada.", 404));
    }
    salvarLista(STORAGE_KEYS.avaliacoes, restantes);
    return Promise.resolve({ data: null });
  },
};

export default MockDataService;
