import React, { useEffect, useState } from 'react';
import { useDataProvider } from '../../providers';
import { useApp } from '../../context/AppContext';
import { Announcement, ClassItem } from '../../types';
import { Modal } from '../common/Modal';
import {
  Bell,
  Plus,
  Pin,
  Edit2,
  Trash2,
  Calendar,
  School,
  Megaphone,
} from 'lucide-react';

export const AnnouncementsManager: React.FC = () => {
  const provider = useDataProvider();
  const { addToast } = useApp();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorName: 'ThS. Nguyễn Hoàng Nam',
    authorRole: 'Giáo viên Bộ môn' as Announcement['authorRole'],
    targetClassId: '', // empty = all school
    isPinned: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [anns, clss] = await Promise.all([
        provider.getAnnouncements(),
        provider.getClasses(),
      ]);
      setAnnouncements(anns);
      setClasses(clss);
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi tải thông báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [provider]);

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      authorName: 'ThS. Nguyễn Hoàng Nam',
      authorRole: 'Giáo viên Bộ môn',
      targetClassId: '',
      isPinned: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      authorName: ann.authorName,
      authorRole: ann.authorRole,
      targetClassId: ann.targetClassId || '',
      isPinned: ann.isPinned,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      addToast('Vui lòng nhập tiêu đề và nội dung thông báo', 'error');
      return;
    }

    try {
      const payload = {
        ...formData,
        targetClassId: formData.targetClassId ? formData.targetClassId : undefined,
      };

      if (editingAnnouncement) {
        await provider.updateAnnouncement(editingAnnouncement.id, payload);
        addToast('Đã cập nhật thông báo', 'success');
      } else {
        await provider.createAnnouncement(payload);
        addToast('Đã đăng thông báo mới thành công', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi lưu thông báo', 'error');
    }
  };

  const handleTogglePin = async (ann: Announcement) => {
    try {
      const nextPin = !ann.isPinned;
      await provider.updateAnnouncement(ann.id, { isPinned: nextPin });
      addToast(nextPin ? 'Đã ghim thông báo lên đầu' : 'Đã bỏ ghim thông báo', 'info');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast('Lỗi khi đổi ghim thông báo', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Xóa thông báo "${title}"?`)) {
      try {
        await provider.deleteAnnouncement(id);
        addToast('Đã xóa thông báo', 'info');
        fetchData();
      } catch (err) {
        console.error(err);
        addToast('Lỗi khi xóa thông báo', 'error');
      }
    }
  };

  const classMap = new Map(classes.map((c) => [c.id, c.code]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Bảng tin Thông báo (Announcements)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Đăng thông báo quan trọng cho toàn trường hoặc từng lớp học cụ thể, ghim tin tức khẩn.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo thông báo mới</span>
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Đang tải thông báo...</div>
      ) : announcements.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          Chưa có thông báo nào được đăng.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                ann.isPinned
                  ? 'border-indigo-200 bg-indigo-50/20 shadow-sm'
                  : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {ann.isPinned && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      <Pin className="w-3 h-3" />
                      <span>Tin ghim</span>
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                    {ann.targetClassId ? `Lớp ${classMap.get(ann.targetClassId)}` : 'Toàn trường'}
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(ann.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(ann)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      ann.isPinned
                        ? 'text-indigo-600 bg-indigo-100/60'
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                    }`}
                    title={ann.isPinned ? 'Bỏ ghim' : 'Ghim thông báo'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(ann)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ann.id, ann.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {ann.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">
                  {ann.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Đăng bởi: <strong className="text-slate-800">{ann.authorName}</strong> (
                  {ann.authorRole})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create or Edit Announcement */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAnnouncement ? 'Chỉnh sửa Thông báo' : 'Tạo Thông báo Mới'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tiêu đề thông báo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Lịch thi Kiểm tra Đánh giá Năng lực Giữa Học kỳ I..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phạm vi gửi thông báo
              </label>
              <select
                value={formData.targetClassId}
                onChange={(e) => setFormData({ ...formData, targetClassId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Toàn trường (Tất cả lớp)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Chỉ Lớp {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Vai trò người gửi
              </label>
              <select
                value={formData.authorRole}
                onChange={(e) =>
                  setFormData({ ...formData, authorRole: e.target.value as any })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Giáo viên Bộ môn">Giáo viên Bộ môn</option>
                <option value="Ban Giám Hiệu">Ban Giám Hiệu</option>
                <option value="Cố vấn Học tập">Cố vấn Học tập</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Họ tên người gửi
            </label>
            <input
              type="text"
              required
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nội dung thông báo <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              required
              placeholder="Nhập thông tin chi tiết, mốc thời gian và hướng dẫn cho học sinh..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPinnedCheck"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPinnedCheck" className="font-semibold text-slate-700">
              Ghim thông báo này lên vị trí đầu tiên
            </label>
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
              {editingAnnouncement ? 'Lưu thay đổi' : 'Đăng thông báo'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
