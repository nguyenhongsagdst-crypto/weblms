import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Student, ClassItem } from '../../types';
import { Modal } from '../common/Modal';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  School,
  CheckCircle,
  XCircle,
  Award,
} from 'lucide-react';

export const StudentsManager: React.FC = () => {
  const provider = useDataProvider();
  const { addToast, refreshStudents } = useApp();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    username: '',
    password: 'Password@123',
    email: '',
    classId: '',
    phone: '',
    parentPhone: '',
    birthDate: '',
    gpa: 8.0,
    status: 'active' as 'active' | 'inactive',
    avatar: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stus, clss] = await Promise.all([
        provider.getStudents(),
        provider.getClasses(),
      ]);
      setStudents(stus);
      setClasses(clss);
      if (clss.length > 0 && !formData.classId) {
        setFormData((prev) => ({ ...prev, classId: clss[0].id }));
      }
    } catch (err) {
      console.error(err);
      addToast('Không thể tải danh sách học sinh', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [provider]);

  const handleOpenCreate = () => {
    setEditingStudent(null);
    const newIdx = students.length + 1;
    setFormData({
      code: `HS-${1000 + newIdx}`,
      name: '',
      username: `hocsinh_${newIdx}`,
      password: 'Password@123',
      email: '',
      classId: classes[0]?.id || '',
      phone: '',
      parentPhone: '',
      birthDate: '2009-01-01',
      gpa: 8.0,
      status: 'active',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + students.length}?w=150&auto=format&fit=crop&q=80`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (stu: Student) => {
    setEditingStudent(stu);
    setFormData({
      code: stu.code,
      name: stu.name,
      username: stu.username || stu.email.split('@')[0],
      password: stu.password || 'Password@123',
      email: stu.email,
      classId: stu.classId,
      phone: stu.phone || '',
      parentPhone: stu.parentPhone || '',
      birthDate: stu.birthDate || '',
      gpa: stu.gpa || 8.0,
      status: stu.status,
      avatar: stu.avatar,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.code || !formData.classId) {
      addToast('Vui lòng điền đủ họ tên, mã học sinh, email và lớp', 'error');
      return;
    }

    try {
      if (editingStudent) {
        await provider.updateStudent(editingStudent.id, formData);
        addToast(`Đã cập nhật học sinh ${formData.name}`, 'success');
      } else {
        await provider.createStudent(formData);
        addToast(`Đã thêm học sinh ${formData.name} mới`, 'success');
      }
      setIsModalOpen(false);
      await fetchData();
      await refreshStudents();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi lưu thông tin học sinh', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${name}"?`)) {
      try {
        await provider.deleteStudent(id);
        addToast('Đã xóa học sinh', 'info');
        await fetchData();
        await refreshStudents();
      } catch (err) {
        console.error(err);
        addToast('Lỗi khi xóa học sinh', 'error');
      }
    }
  };

  const handleToggleStatus = async (stu: Student) => {
    try {
      const nextStatus = stu.status === 'active' ? 'inactive' : 'active';
      await provider.updateStudent(stu.id, { status: nextStatus });
      addToast(`Đã đổi trạng thái học sinh sang ${nextStatus === 'active' ? 'Đang học' : 'Nghỉ học'}`, 'info');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const classMap = new Map(classes.map((c) => [c.id, c.code]));

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = selectedClassId === 'all' || s.classId === selectedClassId;
    return matchSearch && matchClass;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Học sinh (Students)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh bạ học sinh, theo dõi sĩ số các lớp, tình trạng học tập và điểm GPA tích lũy.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm học sinh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã HS, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 whitespace-nowrap">Lớp học:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Đang tải danh sách học sinh...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Không tìm thấy học sinh nào phù hợp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Học sinh</th>
                  <th className="py-3 px-4">Mã số</th>
                  <th className="py-3 px-4">Lớp</th>
                  <th className="py-3 px-4">Liên hệ</th>
                  <th className="py-3 px-4 text-center">GPA</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={stu.avatar}
                          alt={stu.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{stu.name}</p>
                          <p className="text-[11px] text-slate-400">{stu.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {stu.code}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200/60 font-mono">
                        {classMap.get(stu.classId) || 'Chưa gán'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      <div>{stu.phone || 'Chưa có SĐT'}</div>
                      <div className="text-slate-400">Sinh: {stu.birthDate || 'Chưa cập nhật'}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block font-extrabold text-xs px-2 py-0.5 rounded-md ${
                          (stu.gpa || 0) >= 9.0
                            ? 'bg-emerald-50 text-emerald-700'
                            : (stu.gpa || 0) >= 8.0
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {stu.gpa ? stu.gpa.toFixed(1) : '8.0'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(stu)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition-colors ${
                          stu.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title="Bấm để đổi trạng thái"
                      >
                        {stu.status === 'active' ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Đang học</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-slate-400" />
                            <span>Tạm nghỉ</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(stu)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(stu.id, stu.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Student */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Chỉnh sửa Học sinh: ${editingStudent.name}` : 'Thêm Học sinh mới'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mã học sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: HS-1001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lớp học <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Văn An"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email học tập <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="VD: an.nguyen@lms.edu.vn"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                placeholder="VD: 0912 345 678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày sinh
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Điểm GPA ban đầu
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="active">Đang học</option>
                <option value="inactive">Tạm nghỉ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Link ảnh đại diện (Avatar URL)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
            >
              {editingStudent ? 'Lưu thay đổi' : 'Thêm học sinh'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
