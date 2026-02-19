import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function Register() {
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const passwordConfirmRef = useRef();
    const telefoneRef = useRef();
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const { setToken, setUser, setCliente } = useStateContext();

    const onSubmit = (ev) => {
        ev.preventDefault();
        setErrors(null);
        setLoading(true);

        const payload = {
            name: nameRef.current.value,
            email: emailRef.current.value,
            password: passwordRef.current.value,
            password_confirmation: passwordConfirmRef.current.value,
            telefone: telefoneRef.current.value || null,
        };

        axiosClient.post('/auth/register', payload)
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
                } else {
                    setErrors({ email: ['Erro ao criar conta. Tente novamente.'] });
                }
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <div className="mb-6 text-center">
                <img src="/logo.png" alt="Demand3" className="h-16 mx-auto mb-4" onError={(e) => { e.target.style.display = 'none'; }} />
                <h2 className="text-2xl font-bold text-gray-800">Crie sua conta</h2>
                <p className="text-gray-500 mt-1">Preencha seus dados para começar</p>
            </div>

            {errors && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                {Object.keys(errors).map(key => (
                    <p key={key} className="text-sm">{errors[key][0]}</p>
                ))}
            </div>}

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Nome completo</label>
                    <input ref={nameRef} type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Seu nome" />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                    <input ref={emailRef} type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="seu@email.com" />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Telefone <span className="text-gray-400">(opcional)</span></label>
                    <input ref={telefoneRef} type="tel" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="(11) 99999-9999" />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Senha</label>
                    <input ref={passwordRef} type="password" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Mínimo 8 caracteres" />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Confirmar senha</label>
                    <input ref={passwordConfirmRef} type="password" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" placeholder="Repita a senha" />
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={loading}>
                    {loading ? 'Criando conta...' : 'Criar conta'}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Faça login</Link>
                </p>
            </div>
        </div>
    );
}
