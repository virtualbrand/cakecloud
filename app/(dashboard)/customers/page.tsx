export default function CustomersPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie sua base de clientes</p>
        </div>
        <button className="bg-pink-600 text-white px-6 py-2.5 rounded-lg hover:bg-pink-700 transition font-semibold">
          + Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-gray-600 text-center py-8">
          Configure sua conexão com o Supabase para começar a gerenciar clientes.
        </p>
      </div>
    </div>
  )
}
