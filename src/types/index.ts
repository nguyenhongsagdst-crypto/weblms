// Domain Models and Contracts for LMS

export interface ClassItem {
  id: string;
  code: string;
  name: string;
  gradeLevel: string; // e.g., 'Khối 10', 'Khối 11', 'Khối 12'
  academicYear: string;
  joinCode: string; // Mã tham gia lớp học
  teacherName: string;
  room?: string;
  description?: string;
  studentCount?: number;
}

export interface Student {
  id: string;
  code: string; // e.g. HS-1001
  name: string;
  username: string; // Tên đăng nhập
  password?: string; // Mật khẩu
  email: string;
  avatar: string;
  classId: string;
  phone?: string;
  parentPhone?: string; // SĐT phụ huynh
  status: 'active' | 'inactive';
  gpa?: number;
  birthDate?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  color: string; // Tailwind color token or hex
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  order: number;
}

export interface Attachment {
  name: string;
  url: string;
  type?: 'pdf' | 'doc' | 'zip' | 'link';
  size?: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  topicId: string;
  classIds: string[]; // Classes assigned to this lesson (classIdsJson in sheet)
  title: string;
  summary: string;
  content: string; // Markdown / Rich HTML
  videoUrl?: string; // YouTube or video embed link
  durationMinutes: number;
  attachments?: Attachment[]; // attachmentsJson in sheet
  isPublished: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionItem {
  id: string;
  subjectId: string;
  topicId: string;
  type: 'multiple_choice' | 'essay' | 'true_false';
  questionText: string;
  options: QuestionOption[]; // optionsJson in Google Sheet
  explanation?: string;
  defaultPoints: number;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
}

export interface StudentLessonProgress {
  id: string;
  studentId: string;
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
  lastAccessedAt: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  maxPoints: number;
  description: string;
}

export interface Assignment {
  id: string;
  classId: string;
  subjectId: string;
  title: string;
  description: string;
  dueDate: string; // ISO String
  maxPoints: number;
  rubric: RubricCriterion[]; // rubricJson in Google Sheet
  attachments?: Attachment[]; // attachmentsJson in Google Sheet
  status: 'draft' | 'published';
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: string; // ISO String
  content: string; // Student text / answer
  attachmentUrl?: string; // Drive link, repo link or file upload link
  status: 'submitted' | 'graded' | 'late';
  score?: number; // Total points awarded
  rubricScores?: Record<string, number>; // criterionId -> points (rubricScoresJson in Google Sheet)
  feedback?: string; // Teacher feedback
  gradedAt?: string;
  gradedBy?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: 'Ban Giám Hiệu' | 'Giáo viên Bộ môn' | 'Cố vấn Học tập';
  targetClassId?: string; // undefined means all classes
  isPinned: boolean;
  createdAt: string;
}

export interface ReportStats {
  totalStudents: number;
  totalClasses: number;
  totalLessons: number;
  totalAssignments: number;
  totalQuestions: number;
  submissionRate: number; // percentage (0 - 100)
  averageScore: number; // 0 - 10
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  subjectProgress: {
    subjectId: string;
    subjectName: string;
    completionRate: number;
    assignmentCount: number;
  }[];
  recentActivity: {
    id: string;
    type: 'submission' | 'grade' | 'lesson_complete';
    title: string;
    timestamp: string;
    studentName: string;
  }[];
}

// Data Provider Query Filters
export interface LessonFilter {
  subjectId?: string;
  topicId?: string;
  classId?: string;
  isPublished?: boolean;
}

export interface AssignmentFilter {
  classId?: string;
  subjectId?: string;
  status?: 'draft' | 'published';
}

export interface SubmissionFilter {
  assignmentId?: string;
  studentId?: string;
  classId?: string;
  status?: 'submitted' | 'graded' | 'late';
}

export interface QuestionFilter {
  subjectId?: string;
  topicId?: string;
  type?: 'multiple_choice' | 'essay' | 'true_false';
  difficulty?: 'easy' | 'medium' | 'hard';
}
