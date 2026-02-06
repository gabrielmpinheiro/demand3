import axios from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    withCredentials: true, // Necessário para CSRF cookie
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Função para obter o token CSRF do cookie
function getCsrfToken() {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (match) {
        return decodeURIComponent(match[1]);
    }
    return null;
}

axiosClient.interceptors.request.use((config) => {
    // Adicionar token de autenticação
    const token = localStorage.getItem('ACCESS_TOKEN');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar token CSRF para métodos que modificam dados
    const csrfToken = getCsrfToken();
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    return config;
});

axiosClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    const { response } = error;
    if (response && response.status === 401) {
        localStorage.removeItem('ACCESS_TOKEN');
    }
    throw error;
});

// Função para inicializar CSRF (chamar antes de requisições que modificam dados)
export async function initCsrf() {
    try {
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
    } catch (error) {
        console.error('Erro ao obter CSRF cookie:', error);
    }
}

export default axiosClient;
