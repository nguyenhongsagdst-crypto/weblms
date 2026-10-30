import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { ClassItem, Student } from '../../types';
import { Modal } from '../common/Modal';
import {
  School,
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  BookOpen,
  MapPin,
  Calendar,
  CheckCircle,
} from 'lucide-react';

export const ClassesManager: React.FC = () => {
  const provider = useDataProvider();
  const { addToast } = useApp();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    gradeLevel: 'Khối 10',
    academicYear: '2025 - 2026',
    joinCode: '',
    teacherName: '',
    room: '',
    description: '',
  });

  // Students in class modal
  const [viewStudentsClass, setViewStudentsClass] = useState<ClassItem | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await provider.getClasses();
      setClasses(data);
    } catch (err) {
      console.error(err);
      addToast('Không thể tải danh sách lớp học', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [provider]);

  const handleOpenCreate = () => {
    setEditingClass(null);
    setFormData({
      code: '',
      name: '',
      gradeLevel: 'Khối 10',
      academicYear: '2025 - 2026',
      joinCode: `EDU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      teacherName: '',
      room: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormData({
      code: cls.code,
      name: cls.name,
      gradeLevel: cls.gradeLevel,
      academicYear: cls.academicYear,
      joinCode: cls.joinCode || `EDU-${cls.code}-X9`,
      teacherName: cls.teacherName,
      room: cls.room || '',
      description: cls.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.teacherName) {
      addToast('Vui lòng điền đầy đủ các thông tin bắt buộc', 'error');
      return;
    }

    try {
      if (editingClass) {
        await provider.updateClass(editingClass.id, formData);
        addToast(`Đã cập nhật lớp ${formData.code} thành công!`, 'success');
      } else {
        await provider.createClass(formData);
        addToast(`Đã thêm lớp ${formData.code} mới thành công!`, 'success');
      }
      setIsModalOpen(false);
      fetchClasses();
    } catch (err) {
      console.error(err);
      addToast('Thao tác lớp học thất bại', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa lớp "${name}"?`)) {
      try {
        await provider.deleteClass(id);
        addToast('Đã xóa lớp học', 'info');
        fetchClasses();
      } catch (err) {
        console.error(err);
        addToast('Lỗi khi xóa lớp học', 'error');
      }
    }
  };

  const handleViewStudents = async (cls: ClassItem) => {
    setViewStudentsClass(cls);
    const students = await provider.getStudents({ classId: cls.id });
    setClassStudents(students);
  };

  // Filtered list
  const filteredClasses = classes.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacherName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGrade = selectedGrade === 'all' || c.gradeLevel === selectedGrade;
    return matchSearch && matchGrade;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Lớp học (Classes)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo và phân công chủ nhiệm lớp, theo dõi sĩ số và học phần giảng dạy.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm lớp học</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã lớp, tên lớp, giáo viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs text-slate-500 whitespace-nowrap">Khối lớp:</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả các khối</option>
            <option value="Khối 10">Khối 10</option>
            <option value="Khối 11">Khối 11</option>
            <option value="Khối 12">Khối 12</option>
          </select>
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Đang tải danh sách lớp...</div>
      ) : filteredClasses.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
          Không tìm thấy lớp học nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredClasses.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badge & Code */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-200/60">
                      {cls.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {cls.gradeLevel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Sửa thông tin"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cls.id, cls.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa lớp"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Class Name & Description */}
                <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug">
                  {cls.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cls.description || 'Chưa có mô tả chi tiết cho lớp học.'}
                </p>

                {/* Details info */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>GV: <strong className="text-slate-800">{cls.teacherName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{cls.room || 'Chưa gán phòng'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{cls.academicYear}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Sĩ số: <strong className="text-slate-800">{cls.studentCount || 0} học sinh</strong></span>
                  </div>
                </div>
              </div>

              {/* Action: View Students list */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleViewStudents(cls)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Danh sách học sinh ({cls.studentCount || 0})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Class */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? `Chỉnh sửa Lớp: ${editingClass.code}` : 'Thêm Lớp học mới'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mã lớp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: 10A1, 11B2"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Khối lớp <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Khối 10">Khối 10</option>
                <option value="Khối 11">Khối 11</option>
                <option value="Khối 12">Khối 12</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tên đầy đủ của lớp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Lớp 10A1 - Chuyên Tin & Khoa học Máy tính"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giáo viên chủ nhiệm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: ThS. Nguyễn Hoàng Nam"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phòng học
              </label>
              <input
                type="text"
                placeholder="VD: Phòng Lab 302"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Niên khóa học
            </label>
            <input
              type="text"
              placeholder="2025 - 2026"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô tả & Định hướng lớp
            </label>
            <textarea
              rows={3}
              placeholder="Ghi chú mục tiêu học tập của lớp..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {editingClass ? 'Lưu thay đổi' : 'Tạo lớp học'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Students in Class */}
      <Modal
        isOpen={Boolean(viewStudentsClass)}
        onClose={() => setViewStudentsClass(null)}
        title={`Danh sách học sinh - Lớp ${viewStudentsClass?.code}`}
        maxWidth="xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Tổng cộng: <strong className="text-slate-800">{classStudents.length} học sinh</strong> trong lớp này.
          </p>

          {classStudents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Lớp chưa có học sinh nào.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {classStudents.map((st) => (
                <div key={st.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{st.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{st.code} · {st.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">GPA: {st.gpa || 'Chưa có'}</span>
                    <p className="text-[10px] text-emerald-600 font-semibold uppercase">Hoạt động</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setViewStudentsClass(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Đóng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
