import { useState, useEffect } from "react";
// import api from "../../api/axios"; 
import { toast } from "react-toastify";
import { Badge } from "./Dashboard"; // Dashboard.jsx-ээс Badge-г ашиглах
import { Users, Trash2, ShieldOff, ShieldCheck } from "lucide-react"; // Илүү гоё дүрсүүд
import api from "../api/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await api.get("/auth/users");
      setUsers(response.data);
    } catch (err) {
      toast.error("Хэрэглэгчдийн жагсаалтыг авахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBlock(id, currentStatus) {
    try {
      const newStatus = currentStatus === "active" ? "blocked" : "active";
      await api.put(`/auth/users/${id}/status`, { status: newStatus });
      
      toast.info(`Хэрэглэгчийн төлөв: ${newStatus === 'active' ? 'Идэвхжлээ' : 'Блоклогдлоо'}`);
      setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
    } catch (err) {
      toast.error("Төлөв өөрчлөхөд алдаа гарлаа.");
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`${name} хэрэглэгчийг устгахдаа итгэлтэй байна уу?`)) return;

    try {
      await api.delete(`/auth/users/${id}`);
      toast.success("Хэрэглэгч амжилттай устлаа.");
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Устгах үед алдаа гарлаа.");
    }
  }

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center mt-10">Уншиж байна...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users size={24} /> Хэрэглэгчийн удирдлага
        </h2>
        <input 
          type="text" 
          placeholder="Нэр эсвэл имэйлээр хайх..." 
          className="border border-gray-300 rounded-lg px-4 py-2 w-72 focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-700">Нэр</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Имэйл</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Үүрэг</th>
              <th className="px-6 py-4 font-semibold text-gray-700">Төлөв</th>
              <th className="px-6 py-4 font-semibold text-gray-700 text-center">Үйлдэл</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium">{user.username}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <Badge type={user.role === "Admin" ? "warning" : "default"}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge type={user.status === "active" ? "success" : "danger"}>
                    {user.status === "active" ? "Идэвхтэй" : "Блоктой"}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => handleToggleBlock(user._id, user.status)}
                      title={user.status === "active" ? "Блокдох" : "Идэвхжүүлэх"}
                      className={`p-2 rounded-lg transition-colors ${
                        user.status === "active" 
                        ? "text-orange-600 hover:bg-orange-50" 
                        : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {user.status === "active" ? <ShieldOff size={18} /> : <ShieldCheck size={18} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id, user.username)}
                      title="Устгах"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                  Хэрэглэгч олдсонгүй.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}