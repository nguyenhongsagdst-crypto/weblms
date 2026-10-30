import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Assignment, Subject, ClassItem, RubricCriterion } from '../../types';
import { Modal } from '../common/Modal';
import {
  FileCheck2,
  Plus,
  Search,
  Calendar,
  Clock,
  Award,
  Layers,
  Edit2,
  Trash2,
  AlertCircle,
  Eye,
  CheckCircle,
  ListPlus,
  X,
} from 'lucide-react';

export const AssignmentsManager: React.FC = () => {
  const provider = useDataProvider();
  const { addToast } = useApp();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterClassId, setFilterClassId] = useState('all');
  const [filterSubjectId, setFilterSubjectId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewAssignment, setPreviewAssignment] = useState<Assignment | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    classId: string;
    subjectId: string;
    dueDate: string;
    maxPoints: number;
    status: 'draft' | 'published';
    rubric: RubricCriterion[];
  }>({
    title: '',
    description: '',
    classId: '',
    subjectId: '',
    dueDate: '',
    maxPoints: 10,
    status: 'published',
    rubric: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [asgs, subs, clss] = await Promise.all([
        provider.getAssignments(),
        provider.getSubjects(),
        provider.getClasses(),
      ]);
      setAssignments(asgs);
      setSubjects(subs);
      setClasses(clss);
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải danh sách bài tập', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [provider]);

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    defaultDate.setHours(23, 59, 0, 0);

    setFormData({
      title: '',
      description: '',
      classId: classes[0]?.id || '',
      subjectId: subjects[0]?.id || '',
      dueDate: defaultDate.toISOString().slice(0, 16),
      maxPoints: 10,
      status: 'published',
      rubric: [
        {
          id: `rub-${Date.now()}-1`,
          title: 'Tính chính xác & Đạt yêu cầu đề bài',
          maxPoints: 4,
          description: 'Đáp ứng đầy đủ các yêu cầu cốt lõi và kết quả chính xác.',
        },
        {
          id: `rub-${Date.now()}-2`,
          title: 'Cấu trúc & Trình bày logic',
          maxPoints: 3,
          description: 'Bố cục rõ ràng, lập luận mạch lạc, định dạng dễ theo dõi.',
        },
        {
          id: `rub-${Date.now()}-3`,
          title: 'Sáng tạo & Tối ưu hóa',
          maxPoints: 3,
          description: 'Có cách tiếp cận mới lạ, tối ưu giải pháp hoặc giải thích sâu sắc.',
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (asg: Assignment) => {
    setEditingAssignment(asg);
    setFormData({
      title: asg.title,
      description: asg.description,
      classId: asg.classId,
      subjectId: asg.subjectId,
      dueDate: asg.dueDate ? asg.dueDate.slice(0, 16) : '',
      maxPoints: asg.maxPoints,
      status: asg.status,
      rubric: asg.rubric || [],
    });
    setIsModalOpen(true);
  };

  const handleAddCriterion = () => {
    setFormData((prev) => ({
      ...prev,
      rubric: [
        ...prev.rubric,
        {
          id: `rub-${Date.now()}-${Math.random()}`,
          title: `Tiêu chí ${prev.rubric.length + 1}`,
          maxPoints: 2,
          description: 'Mô tả mức độ hoàn thành để đạt điểm tối đa.',
        },
      ],
    }));
  };

  const handleRemoveCriterion = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      rubric: prev.rubric.filter((r) => r.id !== id),
    }));
  };

  const handleCriterionChange = (
    id: string,
    field: keyof RubricCriterion,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      rubric: prev.rubric.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    }));
  };

  const totalRubricPoints = formData.rubric.reduce((acc, c) => acc + (Number(c.maxPoints) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.classId || !formData.subjectId || !formData.dueDate) {
      addToast('Vui lòng nhập đầy đủ tiêu đề, lớp học, môn học và hạn nộp', 'error');
      return;
    }

    if (formData.rubric.length === 0) {
      addToast('Vui lòng thêm ít nhất 1 tiêu chí Rubric chấm điểm', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        maxPoints: totalRubricPoints || formData.maxPoints,
        dueDate: new Date(formData.dueDate).toISOString(),
      };

      if (editingAssignment) {
        await provider.updateAssignment(editingAssignment.id, payload);
        addToast('Đã cập nhật bài tập và Rubric', 'success');
      } else {
        await provider.createAssignment(payload);
        addToast('Đã giao bài tập mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi lưu bài tập', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Xóa bài tập "${title}"? Mọi bài nộp liên quan cũng sẽ bị ảnh hưởng.`)) {
      try {
        await provider.deleteAssignment(id);
        addToast('Đã xóa bài tập', 'info');
        fetchData();
      } catch (err) {
        console.error(err);
        addToast('Lỗi khi xóa bài tập', 'error');
      }
    }
  };

  const classMap = new Map(classes.map((c) => [c.id, c.code]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  const filteredAssignments = assignments.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClass = filterClassId === 'all' || a.classId === filterClassId;
    const matchSub = filterSubjectId === 'all' || a.subjectId === filterSubjectId;
    return matchSearch && matchClass && matchSub;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Bài tập & Rubric (Assignments)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Giao bài tập có hạn nộp (due date) và thiết lập Rubric tiêu chuẩn chấm điểm minh bạch.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Giao bài tập mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bài tập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả các lớp</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                Lớp {c.code}
              </option>
            ))}
          </select>

          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="text-xs rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả môn học</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment Cards */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Đang tải danh sách bài tập...</div>
      ) : filteredAssignments.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          Không tìm thấy bài tập nào. Hãy bấm "Giao bài tập mới" để bắt đầu!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredAssignments.map((asg) => {
            const isDueSoon = new Date(asg.dueDate).getTime() - Date.now() < 3 * 24 * 3600 * 1000;
            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Class & Subject Badges */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-200/60">
                        Lớp {classMap.get(asg.classId) || 'Chung'}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        {subjectMap.get(asg.subjectId) || 'Môn học'}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        asg.status === 'published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {asg.status === 'published' ? 'Đã giao' : 'Bản nháp'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {asg.description}
                  </p>

                  {/* Rubric Summary pill */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span>Rubric: {asg.rubric?.length || 0} tiêu chí</span>
                      </div>
                      <span className="font-extrabold text-indigo-600">
                        Thang điểm: {asg.maxPoints}đ
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-slate-600 divide-y divide-slate-100">
                      {asg.rubric?.slice(0, 3).map((crit) => (
                        <div key={crit.id} className="pt-1 flex items-center justify-between">
                          <span className="truncate pr-2">• {crit.title}</span>
                          <span className="font-mono text-slate-700 font-semibold shrink-0">
                            {crit.maxPoints}đ
                          </span>
                        </div>
                      ))}
                      {asg.rubric && asg.rubric.length > 3 && (
                        <p className="pt-1 text-[10px] text-indigo-600 font-medium">
                          + thêm {asg.rubric.length - 3} tiêu chí khác...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Due Date & Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        isDueSoon ? 'text-amber-500' : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        isDueSoon ? 'text-amber-600' : 'text-slate-600'
                      }`}
                    >
                      Hạn: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}{' '}
                      {new Date(asg.dueDate).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewAssignment(asg)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Xem chi tiết & Rubric"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(asg)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Sửa bài tập"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(asg.id, asg.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Xóa bài tập"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Assignment with Dynamic Rubric */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAssignment ? 'Chỉnh sửa Bài tập & Rubric' : 'Giao Bài tập & Thiết lập Rubric'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tiêu đề bài tập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Bài tập 01: Thiết kế Trang Dashboard Trợ Năng Bằng HTML5"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lớp áp dụng <span className="text-rose-500">*</span>
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

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Môn học <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hạn chót nộp bài (Due Date) <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Trạng thái phát hành
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="published">Xuất bản ngay cho học sinh</option>
                <option value="draft">Lưu bản nháp (Draft)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mô tả chi tiết yêu cầu đề bài
            </label>
            <textarea
              rows={3}
              placeholder="Ghi rõ yêu cầu nộp file, định dạng, link GitHub hoặc văn bản trực tiếp..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* DYNAMIC RUBRIC BUILDER */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Thiết lập Tiêu chí Chấm điểm (Rubric Builder)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tổng điểm tối đa: <strong className="text-indigo-600 font-bold">{totalRubricPoints} điểm</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCriterion}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
              >
                <ListPlus className="w-3.5 h-3.5" />
                <span>Thêm tiêu chí</span>
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {formData.rubric.map((crit, index) => (
                <div
                  key={crit.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-700 text-xs">
                      Tiêu chí #{index + 1}
                    </span>
                    {formData.rubric.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(crit.id)}
                        className="text-slate-400 hover:text-rose-600"
                        title="Xóa tiêu chí này"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Tên tiêu chí (VD: Tính đúng đắn của giải thuật)"
                        value={crit.title}
                        onChange={(e) => handleCriterionChange(crit.id, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="10"
                          placeholder="Điểm"
                          value={crit.maxPoints}
                          onChange={(e) =>
                            handleCriterionChange(
                              crit.id,
                              'maxPoints',
                              parseFloat(e.target.value) || 1
                            )
                          }
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-center focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="text-[11px] text-slate-500">điểm</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Mô tả chi tiết chuẩn đánh giá..."
                      value={crit.description}
                      onChange={(e) =>
                        handleCriterionChange(crit.id, 'description', e.target.value)
                      }
                      className="w-full px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-600 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
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
              {editingAssignment ? 'Lưu thay đổi' : 'Giao bài tập'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: View Rubric Detail */}
      <Modal
        isOpen={Boolean(previewAssignment)}
        onClose={() => setPreviewAssignment(null)}
        title={previewAssignment?.title || 'Chi tiết Bài tập & Rubric'}
        maxWidth="lg"
      >
        {previewAssignment && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">
                  Lớp {classMap.get(previewAssignment.classId)} · {subjectMap.get(previewAssignment.subjectId)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hạn nộp: {new Date(previewAssignment.dueDate).toLocaleString('vi-VN')}
                </p>
              </div>
              <span className="text-base font-extrabold text-indigo-600">
                {previewAssignment.maxPoints}đ
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-100 leading-relaxed text-slate-700">
              <h4 className="font-bold text-slate-900 mb-1">Mô tả đề bài:</h4>
              <p>{previewAssignment.description}</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Bảng Tiêu chí Đánh giá (Rubric):</span>
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {previewAssignment.rubric?.map((cr) => (
                  <div key={cr.id} className="p-3 bg-white flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{cr.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{cr.description}</p>
                    </div>
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs shrink-0">
                      Tối đa {cr.maxPoints}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewAssignment(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
