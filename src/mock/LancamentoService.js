import MockDataService from "./MockDataService.js";

class AvaliacaoService {
  buscar(filtro = {}) {
    return MockDataService.buscarAvaliacoes(filtro);
  }

  buscarTodas(page = 0, size = 100) {
    return this.buscar({ page, size, sort: "id,desc" });
  }

  buscarPorId(id) {
    return MockDataService.buscarAvaliacaoPorId(id);
  }

  salvar(avaliacao) {
    return MockDataService.salvarAvaliacao(avaliacao);
  }

  atualizar(id, avaliacao) {
    return MockDataService.atualizarAvaliacao(id, avaliacao);
  }

  deletar(id) {
    return MockDataService.deletarAvaliacao(id);
  }
}

const avaliacaoService = new AvaliacaoService();

export default avaliacaoService;
