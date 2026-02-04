
import { useRef, useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axios-client";

export default function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const [errors, setErrors] = useState(null);
    const { setToken, setUser } = useStateContext();

    const onSubmit = (ev) => {
        ev.preventDefault();
        const payload = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };

        // Simulating login for now as API might not be fully ready or CORS issues
        // Remove this mock code when connecting to real API
        /*
        axiosClient.post('/auth/login', payload)
          .then(({data}) => {
            setUser(data.user);
            setToken(data.token);
          })
          .catch(err => {
            const response = err.response;
            if (response && response.status === 422) {
                setErrors(response.data.errors);
            }
          });
        */

        // MOCK LOGIN FOR DEVELOPMENT
        if (payload.email === 'admin@admin.com' && payload.password === 'password') {
            setUser({ name: 'Admin User', email: 'admin@admin.com' });
            setToken('mock_token_12345');
        } else {
            setErrors({ email: ['Credenciais inválidas'] });
        }

    };

    return (
        <div className="bg-white shadow-md rounded-lg p-8">
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-800">Login</h2>
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
                    <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200" type="submit">
                        Entrar
                    </button>
                </div>
            </form>
        </div>
    );
}
