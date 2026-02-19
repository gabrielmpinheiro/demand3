import { useStateContext } from "../contexts/ContextProvider";

export default function PaymentInfoModal({ isOpen, onClose, invoice, onConfirm }) {
    const { theme } = useStateContext();
    const isDark = theme.mode === 'dark';

    if (!isOpen || !invoice) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl max-w-md w-full p-6`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Pagamento Fatura #{invoice.id}
                </h3>

                <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Valor a pagar</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        R$ {parseFloat(invoice.valor).toFixed(2).replace('.', ',')}
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Chave PIX</p>
                        <div className={`p-3 rounded border flex justify-between items-center ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'}`}>
                            <code className="text-sm font-mono truncate">00.000.000/0001-00</code>
                            <button
                                className="text-indigo-500 hover:text-indigo-600 text-sm font-medium ml-2"
                                onClick={() => navigator.clipboard.writeText('00.000.000/0001-00')}
                            >
                                Copiar
                            </button>
                        </div>
                    </div>

                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Após realizar o pagamento, clique no botão abaixo para notificar o financeiro.
                    </p>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                    >
                        Fechar
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                    >
                        Já realizei o pagamento
                    </button>
                </div>
            </div>
        </div>
    );
}
