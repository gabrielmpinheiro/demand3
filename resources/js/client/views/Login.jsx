import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const { setToken, setUser, setCliente } = useStateContext();

    const onSubmit = (ev) => {
        ev.preventDefault();
        setErrors(null);
        setLoading(true);

        const payload = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };

        axiosClient.post('/auth/login', payload)
            .then(({ data }) => {
                setUser(data.data.user);
                if (data.data.user.cliente) {
                    setCliente(data.data.user.cliente);
                }
                setToken(data.data.token);
            })
            .catch(err => {
                const response = err.response;
                if (response && response.status === 422) {
                    setErrors(response.data.errors);
                } else if (response && response.status === 401) {
                    setErrors({ email: ['Credenciais inválidas'] });
                } else {
                    setErrors({ email: ['Erro ao conectar com o servidor'] });
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <div className="mb-6 text-center">
                <img
                    src="/logo.png"
                    alt="Demand3"
                    className="h-16 mx-auto mb-4"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
                <h2 className="text-2xl font-bold text-gray-800">Bem-vindo de volta</h2>
                <p className="text-gray-500 mt-1">Acesse sua conta para continuar</p>
            </div>

            {errors && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                {Object.keys(errors).map(key => (
                    <p key={key} className="text-sm">{errors[key][0]}</p>
                ))}
            </div>}

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                    <input
                        ref={emailRef}
                        type="email"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="seu@email.com"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Senha</label>
                    <input
                        ref={passwordRef}
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="••••••••"
                    />
                </div>
                <button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Entrando...
                        </span>
                    ) : 'Entrar'}
                </button>
            </form>

            {/* Google Login */}
            <div className="mt-4">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">ou continue com</span></div>
                </div>
                <button
                    className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    onClick={() => alert('Login com Google será implementado em breve!')}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-gray-600 font-medium">Google</span>
                </button>
            </div>

            <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}
