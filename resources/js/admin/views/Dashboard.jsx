export default function Dashboard() {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                    <div className="text-gray-500 text-sm uppercase font-semibold">Faturamento (30d)</div>
                    <div className="text-2xl font-bold mt-2">R$ 15.400,00</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                    <div className="text-gray-500 text-sm uppercase font-semibold">Demandas (30d)</div>
                    <div className="text-2xl font-bold mt-2">124</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                    <div className="text-gray-500 text-sm uppercase font-semibold">Novos Clientes</div>
                    <div className="text-2xl font-bold mt-2">12</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
                    <div className="text-gray-500 text-sm uppercase font-semibold">Assinaturas Ativas</div>
                    <div className="text-2xl font-bold mt-2">85</div>
                </div>
            </div>
        </div>
    )
}
