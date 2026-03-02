import { useState } from "react";

const steps = [
    {
        icon: (
            <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
        ),
        title: "1. Cadastre seus Domínios",
        description: "O primeiro passo é registrar os domínios (sites) que você deseja gerenciar. Acesse o menu Domínios e adicione os endereços que precisam de suporte.",
        highlight: "Domínios → + Novo Domínio",
    },
    {
        icon: (
            <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
        ),
        title: "2. Assine um Plano (opcional)",
        description: "Se desejar contratar horas mensais de suporte para um ou mais domínios, acesse a seção Planos. Cada domínio pode ter seu próprio plano com horas dedicadas.",
        highlight: "Planos → Assinar Plano",
    },
    {
        icon: (
            <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        ),
        title: "3. Abra Chamados de Suporte",
        description: "Quando precisar de ajuda, abra um chamado vinculado ao domínio desejado. Nossa equipe receberá a solicitação e entrará em contato. Você pode acompanhar o status em tempo real.",
        highlight: "Chamados → + Novo",
    },
];

export default function OnboardingModal({ isOpen, onClose }) {
    const [step, setStep] = useState(0);

    if (!isOpen) return null;

    const isLast = step === steps.length - 1;
    const current = steps[step];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white text-center">
                    <p className="text-sm font-medium opacity-80 mb-1">Bem-vindo ao Demand3!</p>
                    <h2 className="text-xl font-bold">Como usar a plataforma</h2>
                </div>

                {/* Step indicators */}
                <div className="flex justify-center gap-2 pt-5">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'}`}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                        {current.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{current.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">{current.description}</p>
                    <div className="bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-lg inline-block">
                        {current.highlight}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition"
                        >
                            Anterior
                        </button>
                    )}
                    {step === 0 && (
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-400 font-medium hover:bg-gray-50 transition text-sm"
                        >
                            Pular
                        </button>
                    )}
                    <button
                        onClick={() => isLast ? onClose() : setStep(s => s + 1)}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition"
                    >
                        {isLast ? 'Entendido! ✓' : 'Próximo →'}
                    </button>
                </div>
            </div>
        </div>
    );
}
