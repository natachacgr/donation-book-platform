import axios from "axios";

// A API_BASE DEVE APONTAR PARA O PREFIXO ONDE OS BLUEPRINTS SÃO REGISTRADOS NO FLASK
const API_BASE =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "http://localhost:5000/api"; // <-- ESSENCIAL: DEVE TER /api aqui

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na API:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Para o frontend, apenas lança o erro para o componente lidar com a navegação/logout
      throw new Error(
        "Sessão expirada ou não autorizada. Faça login novamente."
      );
    } else if (error.response?.status === 404) {
      throw new Error("Recurso não encontrado");
    } else if (error.response?.status === 500) {
      throw new Error("Erro interno do servidor");
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Timeout na requisição");
    } else if (!error.response) {
      throw new Error("Erro de conexão com o servidor");
    }

    return Promise.reject(error);
  }
);

// ================== AUTENTICAÇÃO ==================

export const loginAdmin = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    const { token } = response.data;
    localStorage.setItem("adminToken", token);
    return true;
  } catch (error) {
    console.error("Erro ao fazer login do administrador:", error);
    throw new Error(
      error.response?.data?.message ||
        "Erro de login. Verifique suas credenciais."
    );
  }
};

export const logoutAdmin = () => {
  localStorage.removeItem("adminToken");
  delete api.defaults.headers.common["Authorization"];
};

export const initializeAuth = (callback) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    callback(true);
  } else {
    callback(false);
  }
};

// ================== LIVROS ==================

export const getLivros = async () => {
  try {
    const response = await api.get("/livros");
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao buscar livros: ${error.message}`);
  }
};

export const getLivroPorId = async (id) => {
  try {
    const response = await api.get(`/livros/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao buscar livro: ${error.message}`);
  }
};

export const buscarLivros = async (termo) => {
  try {
    const response = await api.get(
      `/livros/buscar?q=${encodeURIComponent(termo)}`
    );
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao buscar livros: ${error.message}`);
  }
};

export const criarLivro = async (dados) => {
  try {
    if (!dados.titulo || !dados.autor) {
      throw new Error("Título e autor são obrigatórios");
    }

    const response = await api.post("/livros", {
      titulo: dados.titulo.trim(),
      autor: dados.autor.trim(),
      quantidade: dados.quantidade || 1,
      ...dados,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao criar livro: ${error.message}`);
  }
};

export const atualizarLivro = async (id, dados) => {
  try {
    if (!id) {
      throw new Error("ID do livro é obrigatório");
    }

    const response = await api.put(`/livros/${id}`, dados);
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao atualizar livro: ${error.message}`);
  }
};

export const atualizarQuantidadeLivro = async (id, quantidade) => {
  try {
    if (!id) {
      throw new Error("ID do livro é obrigatório");
    }

    if (quantidade < 0) {
      throw new Error("Quantidade não pode ser negativa");
    }

    // A URL está correta aqui: /livros/<id>/quantidade
    const response = await api.patch(`/livros/${id}/quantidade`, {
      quantidade,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao atualizar quantidade: ${error.message}`);
  }
};

export const deletarLivro = async (id) => {
  try {
    if (!id) {
      throw new Error("ID do livro é obrigatório");
    }

    const response = await api.delete(`/livros/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao deletar livro: ${error.message}`);
  }
};

// ================== DOAÇÕES ==================

export const doarLivro = async ({
  nome,
  email,
  titulo,
  autor,
  livro_id,
  lgpdConsent,
}) => {
  try {
    if (
      !nome ||
      !email ||
      !titulo ||
      !autor ||
      !livro_id ||
      lgpdConsent === undefined
    ) {
      // Validação de todos os campos
      throw new Error(
        "Todos os campos (nome, email, título, autor, id do livro, consentimento LGPD) são obrigatórios para doação"
      );
    }

    if (!validarEmail(email)) {
      throw new Error("Email inválido");
    }

    const item = `${titulo.trim()} - ${autor.trim()}`;
    const response = await api.post("/doacoes", {
      // <--- URL CORRETA: APENAS "/doacoes"
      nome: nome.trim(),
      email: email.trim(),
      item,
      tipo: "livro",
      livro_id: livro_id,
      lgpdConsent: lgpdConsent,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao registrar doação de livro: ${error.message}`);
  }
};

export const doarJogo = async ({ nome, email, lgpdConsent }) => {
  try {
    if (!nome || !email || lgpdConsent === undefined) {
      // Validação de todos os campos
      throw new Error(
        "Nome, email e consentimento LGPD são obrigatórios para doação"
      );
    }

    if (!validarEmail(email)) {
      throw new Error("Email inválido");
    }

    const response = await api.post("/doacoes", {
      // <--- URL CORRETA: APENAS "/doacoes"
      nome: nome.trim(),
      email: email.trim(),
      item: "Jogo de tabuleiro",
      tipo: "jogo",
      lgpdConsent: lgpdConsent,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao registrar doação de jogo: ${error.message}`);
  }
};

export const listarDoacoes = async () => {
  try {
    const response = await api.get("/doacoes");
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao listar doações: ${error.message}`);
  }
};

export const listarDoacoesPorTipo = async (tipo) => {
  try {
    const response = await api.get(`/doacoes?tipo=${tipo}`);
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao listar doações por tipo: ${error.message}`);
  }
};

export const obterDoacao = async (id) => {
  try {
    const response = await api.get(`/doacoes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao obter doação: ${error.message}`);
  }
};

export const atualizarStatusDoacao = async (id, status) => {
  try {
    const response = await api.patch(`/doacoes/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao atualizar status da doação: ${error.message}`);
  }
};

export const excluirDoacao = async (id) => {
  try {
    if (!id) {
      throw new Error("ID da doação é obrigatório");
    }

    const response = await api.delete(`/doacoes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao excluir doação: ${error.message}`);
  }
};

// ================== UTILITÁRIOS ==================

export const verificarStatusAPI = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    throw new Error(`API indisponível: ${error.message}`);
  }
};

export const obterEstatisticas = async () => {
  try {
    const response = await api.get("/estatisticas");
    return response.data;
  } catch (error) {
    throw new Error(`Erro ao obter estatísticas: ${error.message}`);
  }
};

export default api;
