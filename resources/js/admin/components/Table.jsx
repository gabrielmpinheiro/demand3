
export default function Table({ columns, data, onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} scope="col" className="py-3 px-6">
                                {col.label}
                            </th>
                        ))}
                        {(onEdit || onDelete) && (
                            <th scope="col" className="py-3 px-6">
                                Ações
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                {columns.map((col) => (
                                    <td key={`${index}-${col.key}`} className="py-4 px-6">
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="py-4 px-6 flex items-center gap-2">
                                        {onEdit && (
                                            <button
                                                onClick={() => onEdit(row)}
                                                className="font-medium text-blue-600 hover:underline"
                                            >
                                                Editar
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={() => onDelete(row)}
                                                className="font-medium text-red-600 hover:underline"
                                            >
                                                Excluir
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="py-4 px-6 text-center">
                                Nenhum registro encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
