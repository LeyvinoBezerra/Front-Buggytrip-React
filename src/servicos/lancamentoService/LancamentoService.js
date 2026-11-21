import ApiService from "../ApiService.js";

const AVALIACOES = "/api/v1/avaliacoes";

class AvaliacaoService extends ApiService {
  constructor() {
    super(AVALIACOES);
  }

  buscar(filtro = {}) {
    const params = [];
    if (filtro.bugueiroId) {
      params.push(`bugueiroId=${encodeURIComponent(filtro.bugueiroId)}`);
    }
    if (filtro.page !== undefined) {
      params.push(`page=${encodeURIComponent(filtro.page)}`);
    }
    if (filtro.size !== undefined) {
      params.push(`size=${encodeURIComponent(filtro.size)}`);
    }
    if (filtro.sort) {
      params.push(`sort=${encodeURIComponent(filtro.sort)}`);
    }
    return this.get(params.length ? `?${params.join("&")}` : "");
  }

  buscarTodas(page = 0, size = 100) {
    return this.buscar({ page, size, sort: "id,desc" });
  }

  buscarPorId(id) {
    return this.get(`/${id}`);
  }

  salvar(avaliacao) {
    return this.post("", avaliacao);
  }

  atualizar(id, avaliacao) {
    return this.put(`/${id}`, avaliacao);
  }

  deletar(id) {
    return this.delete(`/${id}`);
  }
}

const avaliacaoService = new AvaliacaoService();

export default avaliacaoService;
