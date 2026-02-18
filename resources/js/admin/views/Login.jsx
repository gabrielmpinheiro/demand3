
import { useRef, useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const { setToken, setUser } = useStateContext();

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
        <div className="bg-white shadow-md rounded-lg p-8">
            <div className="mb-6 text-center">
                <img
                    src="/resources/img/logo.png"
                    alt="Demand3"
                    className="h-16 mx-auto mb-4"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }}
                />
                <h2 className="text-2xl font-bold text-gray-800" style={{ display: 'none' }}>Demand3</h2>
                <p className="text-gray-500">Acesse sua conta</p>
            </div>

            {errors && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {Object.keys(errors).map(key => (
                    <p key={key}>{errors[key][0]}</p>
                ))}
            </div>}

            <form onSubmit={onSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input
                        ref={emailRef}
                        type="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="admin@example.com"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
                    <input
                        ref={passwordRef}
                        type="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="******************"
                    />
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </div>
            </form>
        </div>
    );
}
