import { DataProvider } from './dataProvider';
import {
  ClassItem,
  Student,
  Subject,
  Topic,
  Lesson,
  LessonFilter,
  QuestionItem,
  QuestionFilter,
  StudentLessonProgress,
  Assignment,
  AssignmentFilter,
  Submission,
  SubmissionFilter,
  Announcement,
  ReportStats,
} from '../types';
import {
  SEED_CLASSES,
  SEED_STUDENTS,
  SEED_SUBJECTS,
  SEED_TOPICS,
  SEED_LESSONS,
  SEED_QUESTIONS,
  SEED_ASSIGNMENTS,
  SEED_SUBMISSIONS,
  SEED_PROGRESS,
  SEED_ANNOUNCEMENTS,
} from './seedData';

const STORAGE_KEYS = {
  CLASSES: 'lms_v1_classes',
  STUDENTS: 'lms_v1_students',
  SUBJECTS: 'lms_v1_subjects',
  TOPICS: 'lms_v1_topics',
  LESSONS: 'lms_v1_lessons',
  QUESTIONS: 'lms_v1_questions',
  PROGRESS: 'lms_v1_progress',
  ASSIGNMENTS: 'lms_v1_assignments',
  SUBMISSIONS: 'lms_v1_submissions',
  ANNOUNCEMENTS: 'lms_v1_announcements',
};

// Safe storage access helper (falls back to memory if localStorage is restricted)
class StorageManager {
  private memoryFallback: Record<string, string> = {};

  get<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as T;
        }
      }
      if (this.memoryFallback[key]) {
        return JSON.parse(this.memoryFallback[key]) as T;
      }
    } catch (e) {
      console.warn(`[LMS Storage] Error reading key "${key}":`, e);
    }
    return defaultValue;
  }

  set<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, serialized);
      }
      this.memoryFallback[key] = serialized;
    } catch (e) {
      console.warn(`[LMS Storage] Error saving key "${key}":`, e);
    }
  }

  remove(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      delete this.memoryFallback[key];
    } catch (e) {
      console.warn(`[LMS Storage] Error deleting key "${key}":`, e);
    }
  }
}

const storage = new StorageManager();

export class MockDataProvider implements DataProvider {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!storage.get<ClassItem[] | null>(STORAGE_KEYS.CLASSES, null)) {
      this.initSeedData();
    }
  }

  private initSeedData() {
    storage.set(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    storage.set(STORAGE_KEYS.STUDENTS, SEED_STUDENTS);
    storage.set(STORAGE_KEYS.SUBJECTS, SEED_SUBJECTS);
    storage.set(STORAGE_KEYS.TOPICS, SEED_TOPICS);
    storage.set(STORAGE_KEYS.LESSONS, SEED_LESSONS);
    storage.set(STORAGE_KEYS.QUESTIONS, SEED_QUESTIONS);
    storage.set(STORAGE_KEYS.PROGRESS, SEED_PROGRESS);
    storage.set(STORAGE_KEYS.ASSIGNMENTS, SEED_ASSIGNMENTS);
    storage.set(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
    storage.set(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS);
  }

  async resetToSeedData(): Promise<void> {
    this.initSeedData();
  }

  // ================= CLASSES =================
  async getClasses(): Promise<ClassItem[]> {
    const classes = storage.get<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
    const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS, []);

    return classes.map((c) => ({
      ...c,
      studentCount: students.filter((s) => s.classId === c.id).length,
    }));
  }

  async getClassById(id: string): Promise<ClassItem | null> {
    const classes = await this.getClasses();
    return classes.find((c) => c.id === id) || null;
  }

  async createClass(data: Omit<ClassItem, 'id' | 'studentCount'>): Promise<ClassItem> {
    const classes = storage.get<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
    const newClass: ClassItem = {
      ...data,
      id: `cls-${Date.now()}`,
      joinCode: data.joinCode || `EDU-${Date.now().toString().slice(-4)}`,
      studentCount: 0,
    };
    classes.push(newClass);
    storage.set(STORAGE_KEYS.CLASSES, classes);
    return newClass;
  }

  async updateClass(id: string, data: Partial<ClassItem>): Promise<ClassItem> {
    const classes = storage.get<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
    const index = classes.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Class not found');
    classes[index] = { ...classes[index], ...data };
    storage.set(STORAGE_KEYS.CLASSES, classes);
    return classes[index];
  }

  async deleteClass(id: string): Promise<boolean> {
    const classes = storage.get<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
    const filtered = classes.filter((c) => c.id !== id);
    storage.set(STORAGE_KEYS.CLASSES, filtered);
    return true;
  }

  // ================= STUDENTS =================
  async getStudents(filters?: { classId?: string; search?: string }): Promise<Student[]> {
    let students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS, []);
    if (filters?.classId) {
      students = students.filter((s) => s.classId === filters.classId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.username?.toLowerCase().includes(q)
      );
    }
    return students;
  }

  async getStudentById(id: string): Promise<Student | null> {
    const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS, []);
    return students.find((s) => s.id === id) || null;
  }

  async createStudent(data: Omit<Student, 'id'>): Promise<Student> {
    const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS, []);
    const newStudent: Student = {
      ...data,
      id: `std-${Date.now()}`,
      username: data.username || data.email.split('@')[0],
      password: data.password || 'Password@123',
      status: data.status || 'active',
      avatar:
        data.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    students.push(newStudent);
    storage.set(STORAGE_KEYS.STUDENTS, students);
    return newStudent;
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS, []);
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Student not found');
    students[index] = { ...students[index], ...data };
    storage.set(STORAGE_KEYS.STUDENTS, students);
    return students[index];
  }

  async deleteStudent(id: string): Promise<boolean> {
    const students = storage.get<Student[]>(STORAGE_KEYS.STUDENTS, []);
    storage.set(
      STORAGE_KEYS.STUDENTS,
      students.filter((s) => s.id !== id)
    );
    return true;
  }

  // ================= SUBJECTS & TOPICS =================
  async getSubjects(): Promise<Subject[]> {
    return storage.get<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    const subjects = await this.getSubjects();
    return subjects.find((s) => s.id === id) || null;
  }

  async getTopics(subjectId?: string): Promise<Topic[]> {
    const topics = storage.get<Topic[]>(STORAGE_KEYS.TOPICS, []);
    if (subjectId) {
      return topics.filter((t) => t.subjectId === subjectId);
    }
    return topics;
  }

  async createTopic(data: Omit<Topic, 'id'>): Promise<Topic> {
    const topics = storage.get<Topic[]>(STORAGE_KEYS.TOPICS, []);
    const newTopic: Topic = {
      ...data,
      id: `top-${Date.now()}`,
    };
    topics.push(newTopic);
    storage.set(STORAGE_KEYS.TOPICS, topics);
    return newTopic;
  }

  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
    const topics = storage.get<Topic[]>(STORAGE_KEYS.TOPICS, []);
    const index = topics.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Topic not found');
    topics[index] = { ...topics[index], ...data };
    storage.set(STORAGE_KEYS.TOPICS, topics);
    return topics[index];
  }

  async deleteTopic(id: string): Promise<boolean> {
    const topics = storage.get<Topic[]>(STORAGE_KEYS.TOPICS, []);
    storage.set(
      STORAGE_KEYS.TOPICS,
      topics.filter((t) => t.id !== id)
    );
    return true;
  }

  // ================= LESSONS =================
  async getLessons(filters?: LessonFilter): Promise<Lesson[]> {
    let lessons = storage.get<Lesson[]>(STORAGE_KEYS.LESSONS, []);

    if (filters?.subjectId) {
      lessons = lessons.filter((l) => l.subjectId === filters.subjectId);
    }
    if (filters?.topicId) {
      lessons = lessons.filter((l) => l.topicId === filters.topicId);
    }
    if (filters?.classId) {
      lessons = lessons.filter(
        (l) => l.classIds && l.classIds.includes(filters.classId!)
      );
    }
    if (filters?.isPublished !== undefined) {
      lessons = lessons.filter((l) => l.isPublished === filters.isPublished);
    }

    return lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    const lessons = storage.get<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    return lessons.find((l) => l.id === id) || null;
  }

  async createLesson(
    data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Lesson> {
    const lessons = storage.get<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    const now = new Date().toISOString();
    const newLesson: Lesson = {
      ...data,
      id: `les-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    lessons.push(newLesson);
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return newLesson;
  }

  async updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson> {
    const lessons = storage.get<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    const index = lessons.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lesson not found');
    lessons[index] = {
      ...lessons[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.LESSONS, lessons);
    return lessons[index];
  }

  async deleteLesson(id: string): Promise<boolean> {
    const lessons = storage.get<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    storage.set(
      STORAGE_KEYS.LESSONS,
      lessons.filter((l) => l.id !== id)
    );
    return true;
  }

  // ================= QUESTIONS BANK =================
  async getQuestions(filters?: QuestionFilter): Promise<QuestionItem[]> {
    let questions = storage.get<QuestionItem[]>(STORAGE_KEYS.QUESTIONS, []);

    if (filters?.subjectId) {
      questions = questions.filter((q) => q.subjectId === filters.subjectId);
    }
    if (filters?.topicId) {
      questions = questions.filter((q) => q.topicId === filters.topicId);
    }
    if (filters?.type) {
      questions = questions.filter((q) => q.type === filters.type);
    }
    if (filters?.difficulty) {
      questions = questions.filter((q) => q.difficulty === filters.difficulty);
    }

    return questions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getQuestionById(id: string): Promise<QuestionItem | null> {
    const questions = storage.get<QuestionItem[]>(STORAGE_KEYS.QUESTIONS, []);
    return questions.find((q) => q.id === id) || null;
  }

  async createQuestion(
    data: Omit<QuestionItem, 'id' | 'createdAt'>
  ): Promise<QuestionItem> {
    const questions = storage.get<QuestionItem[]>(STORAGE_KEYS.QUESTIONS, []);
    const newQuestion: QuestionItem = {
      ...data,
      id: `qst-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    questions.push(newQuestion);
    storage.set(STORAGE_KEYS.QUESTIONS, questions);
    return newQuestion;
  }

  async updateQuestion(
    id: string,
    data: Partial<QuestionItem>
  ): Promise<QuestionItem> {
    const questions = storage.get<QuestionItem[]>(STORAGE_KEYS.QUESTIONS, []);
    const index = questions.findIndex((q) => q.id === id);
    if (index === -1) throw new Error('Question not found');
    questions[index] = { ...questions[index], ...data };
    storage.set(STORAGE_KEYS.QUESTIONS, questions);
    return questions[index];
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const questions = storage.get<QuestionItem[]>(STORAGE_KEYS.QUESTIONS, []);
    storage.set(
      STORAGE_KEYS.QUESTIONS,
      questions.filter((q) => q.id !== id)
    );
    return true;
  }

  // ================= STUDENT PROGRESS =================
  async getStudentProgress(studentId: string): Promise<StudentLessonProgress[]> {
    const progressList = storage.get<StudentLessonProgress[]>(STORAGE_KEYS.PROGRESS, []);
    return progressList.filter((p) => p.studentId === studentId);
  }

  async toggleLessonProgress(
    studentId: string,
    lessonId: string
  ): Promise<StudentLessonProgress> {
    const progressList = storage.get<StudentLessonProgress[]>(STORAGE_KEYS.PROGRESS, []);
    const index = progressList.findIndex(
      (p) => p.studentId === studentId && p.lessonId === lessonId
    );

    const now = new Date().toISOString();
    if (index !== -1) {
      const current = progressList[index];
      const updated: StudentLessonProgress = {
        ...current,
        isCompleted: !current.isCompleted,
        completedAt: !current.isCompleted ? now : undefined,
        lastAccessedAt: now,
      };
      progressList[index] = updated;
      storage.set(STORAGE_KEYS.PROGRESS, progressList);
      return updated;
    } else {
      const created: StudentLessonProgress = {
        id: `prog-${Date.now()}`,
        studentId,
        lessonId,
        isCompleted: true,
        completedAt: now,
        lastAccessedAt: now,
      };
      progressList.push(created);
      storage.set(STORAGE_KEYS.PROGRESS, progressList);
      return created;
    }
  }

  // ================= ASSIGNMENTS =================
  async getAssignments(filters?: AssignmentFilter): Promise<Assignment[]> {
    let assignments = storage.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    if (filters?.classId) {
      assignments = assignments.filter((a) => a.classId === filters.classId);
    }
    if (filters?.subjectId) {
      assignments = assignments.filter((a) => a.subjectId === filters.subjectId);
    }
    if (filters?.status) {
      assignments = assignments.filter((a) => a.status === filters.status);
    }
    return assignments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAssignmentById(id: string): Promise<Assignment | null> {
    const assignments = storage.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    return assignments.find((a) => a.id === id) || null;
  }

  async createAssignment(
    data: Omit<Assignment, 'id' | 'createdAt'>
  ): Promise<Assignment> {
    const assignments = storage.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    const newAssignment: Assignment = {
      ...data,
      id: `asg-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    assignments.push(newAssignment);
    storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return newAssignment;
  }

  async updateAssignment(
    id: string,
    data: Partial<Assignment>
  ): Promise<Assignment> {
    const assignments = storage.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    const index = assignments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Assignment not found');
    assignments[index] = { ...assignments[index], ...data };
    storage.set(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return assignments[index];
  }

  async deleteAssignment(id: string): Promise<boolean> {
    const assignments = storage.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    storage.set(
      STORAGE_KEYS.ASSIGNMENTS,
      assignments.filter((a) => a.id !== id)
    );
    return true;
  }

  // ================= SUBMISSIONS =================
  async getSubmissions(filters?: SubmissionFilter): Promise<Submission[]> {
    let submissions = storage.get<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    if (filters?.assignmentId) {
      submissions = submissions.filter(
        (s) => s.assignmentId === filters.assignmentId
      );
    }
    if (filters?.studentId) {
      submissions = submissions.filter((s) => s.studentId === filters.studentId);
    }
    if (filters?.status) {
      submissions = submissions.filter((s) => s.status === filters.status);
    }
    return submissions;
  }

  async getSubmissionById(id: string): Promise<Submission | null> {
    const submissions = storage.get<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    return submissions.find((s) => s.id === id) || null;
  }

  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    content: string;
    attachmentUrl?: string;
  }): Promise<Submission> {
    const submissions = storage.get<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    const assignments = storage.get<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
    const assignment = assignments.find((a) => a.id === data.assignmentId);

    const now = new Date();
    const isLate = assignment
      ? now.getTime() > new Date(assignment.dueDate).getTime()
      : false;

    const index = submissions.findIndex(
      (s) =>
        s.assignmentId === data.assignmentId && s.studentId === data.studentId
    );

    if (index !== -1) {
      submissions[index] = {
        ...submissions[index],
        content: data.content,
        attachmentUrl: data.attachmentUrl,
        submittedAt: now.toISOString(),
        status: isLate ? 'late' : 'submitted',
      };
      storage.set(STORAGE_KEYS.SUBMISSIONS, submissions);
      return submissions[index];
    } else {
      const newSubmission: Submission = {
        id: `subm-${Date.now()}`,
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        submittedAt: now.toISOString(),
        content: data.content,
        attachmentUrl: data.attachmentUrl,
        status: isLate ? 'late' : 'submitted',
      };
      submissions.push(newSubmission);
      storage.set(STORAGE_KEYS.SUBMISSIONS, submissions);
      return newSubmission;
    }
  }

  async gradeSubmission(
    id: string,
    gradeData: {
      score: number;
      rubricScores: Record<string, number>;
      feedback: string;
      gradedBy: string;
    }
  ): Promise<Submission> {
    const submissions = storage.get<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    const index = submissions.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Submission not found');

    const updated: Submission = {
      ...submissions[index],
      score: gradeData.score,
      rubricScores: gradeData.rubricScores,
      feedback: gradeData.feedback,
      gradedBy: gradeData.gradedBy,
      gradedAt: new Date().toISOString(),
      status: 'graded',
    };

    submissions[index] = updated;
    storage.set(STORAGE_KEYS.SUBMISSIONS, submissions);
    return updated;
  }

  // ================= GRADEBOOK =================
  async getGradebook(classId: string): Promise<{
    classItem: ClassItem | null;
    students: Student[];
    assignments: Assignment[];
    submissions: Submission[];
  }> {
    const classItem = await this.getClassById(classId);
    const students = await this.getStudents({ classId });
    const assignments = await this.getAssignments({ classId });
    const assignmentIds = new Set(assignments.map((a) => a.id));

    const allSubmissions = storage.get<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    const submissions = allSubmissions.filter((s) =>
      assignmentIds.has(s.assignmentId)
    );

    return {
      classItem,
      students,
      assignments,
      submissions,
    };
  }

  // ================= ANNOUNCEMENTS =================
  async getAnnouncements(filters?: { targetClassId?: string }): Promise<Announcement[]> {
    let list = storage.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    if (filters?.targetClassId) {
      list = list.filter(
        (a) => !a.targetClassId || a.targetClassId === filters.targetClassId
      );
    }
    return list.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    const list = storage.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    return list.find((a) => a.id === id) || null;
  }

  async createAnnouncement(
    data: Omit<Announcement, 'id' | 'createdAt'>
  ): Promise<Announcement> {
    const list = storage.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    const created: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(created);
    storage.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
    return created;
  }

  async updateAnnouncement(
    id: string,
    data: Partial<Announcement>
  ): Promise<Announcement> {
    const list = storage.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    const index = list.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Announcement not found');
    list[index] = { ...list[index], ...data };
    storage.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
    return list[index];
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const list = storage.get<Announcement[]>(STORAGE_KEYS.ANNOUNCEMENTS, []);
    storage.set(
      STORAGE_KEYS.ANNOUNCEMENTS,
      list.filter((a) => a.id !== id)
    );
    return true;
  }

  // ================= REPORTS =================
  async getReports(classId?: string): Promise<ReportStats> {
    const students = await this.getStudents(classId ? { classId } : undefined);
    const classes = await this.getClasses();
    const lessons = await this.getLessons(classId ? { classId } : undefined);
    const assignments = await this.getAssignments(
      classId ? { classId } : undefined
    );
    const questions = await this.getQuestions();

    const assignmentIds = new Set(assignments.map((a) => a.id));
    const allSubmissions = storage.get<Submission[]>(STORAGE_KEYS.SUBMISSIONS, []);
    const submissions = allSubmissions.filter((s) =>
      assignmentIds.has(s.assignmentId)
    );

    const totalPossibleSubmissions = students.length * assignments.length;
    const submissionRate =
      totalPossibleSubmissions > 0
        ? Math.round((submissions.length / totalPossibleSubmissions) * 100)
        : 85;

    const gradedSubmissions = submissions.filter(
      (s) => s.status === 'graded' && typeof s.score === 'number'
    );
    const totalScore = gradedSubmissions.reduce(
      (acc, cur) => acc + (cur.score || 0),
      0
    );
    const averageScore =
      gradedSubmissions.length > 0
        ? Number((totalScore / gradedSubmissions.length).toFixed(1))
        : 8.4;

    const ranges = [
      { range: 'Xuất sắc (9.0 - 10)', min: 9.0, max: 10.0, count: 0 },
      { range: 'Giỏi (8.0 - 8.9)', min: 8.0, max: 8.99, count: 0 },
      { range: 'Khá (6.5 - 7.9)', min: 6.5, max: 7.99, count: 0 },
      { range: 'Trung bình (5.0 - 6.4)', min: 5.0, max: 6.49, count: 0 },
      { range: 'Cần cố gắng (< 5.0)', min: 0, max: 4.99, count: 0 },
    ];

    gradedSubmissions.forEach((s) => {
      const score = s.score ?? 0;
      for (const r of ranges) {
        if (score >= r.min && score <= r.max) {
          r.count++;
          break;
        }
      }
    });

    const totalGraded = Math.max(gradedSubmissions.length, 1);
    const scoreDistribution = ranges.map((r) => ({
      range: r.range,
      count: r.count,
      percentage: Math.round((r.count / totalGraded) * 100),
    }));

    const subjects = await this.getSubjects();
    const progressList = storage.get<StudentLessonProgress[]>(STORAGE_KEYS.PROGRESS, []);
    const subjectProgress = subjects.map((sub) => {
      const subLessons = lessons.filter((l) => l.subjectId === sub.id);
      const subAssignments = assignments.filter((a) => a.subjectId === sub.id);

      const completedCount = progressList.filter(
        (p) => p.isCompleted && subLessons.some((l) => l.id === p.lessonId)
      ).length;
      const totalOpportunities = Math.max(
        subLessons.length * Math.max(students.length, 1),
        1
      );
      const completionRate = Math.min(
        100,
        Math.round((completedCount / totalOpportunities) * 100) || 75
      );

      return {
        subjectId: sub.id,
        subjectName: sub.name,
        completionRate,
        assignmentCount: subAssignments.length,
      };
    });

    const studentMap = new Map(students.map((s) => [s.id, s.name]));
    const recentActivity: ReportStats['recentActivity'] = [
      ...submissions.map((sub) => ({
        id: `act-${sub.id}`,
        type: (sub.status === 'graded' ? 'grade' : 'submission') as
          | 'grade'
          | 'submission',
        title:
          sub.status === 'graded'
            ? `Đã chấm bài: ${sub.score} điểm`
            : `Đã nộp bài tập mới`,
        timestamp: sub.gradedAt || sub.submittedAt,
        studentName: studentMap.get(sub.studentId) || 'Học sinh',
      })),
      ...progressList.slice(0, 5).map((p) => ({
        id: `act-${p.id}`,
        type: 'lesson_complete' as const,
        title: `Đã hoàn thành bài học`,
        timestamp: p.completedAt || p.lastAccessedAt,
        studentName: studentMap.get(p.studentId) || 'Học sinh',
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    return {
      totalStudents: students.length,
      totalClasses: classes.length,
      totalLessons: lessons.length,
      totalAssignments: assignments.length,
      totalQuestions: questions.length,
      submissionRate,
      averageScore,
      scoreDistribution,
      subjectProgress,
      recentActivity,
    };
  }

  // Two-way synchronization helpers for Google Sheets sync
  async exportAllData(): Promise<Record<string, unknown>> {
    return {
      classes: await this.getClasses(),
      students: await this.getStudents(),
      subjects: await this.getSubjects(),
      topics: await this.getTopics(),
      lessons: await this.getLessons(),
      questions: await this.getQuestions(),
      assignments: await this.getAssignments(),
      submissions: await this.getSubmissions(),
      progress: storage.get<StudentLessonProgress[]>(STORAGE_KEYS.PROGRESS, []),
      announcements: await this.getAnnouncements(),
      exportedAt: new Date().toISOString(),
    };
  }

  async importAllData(payload: Record<string, any>): Promise<boolean> {
    if (payload.classes && Array.isArray(payload.classes)) {
      storage.set(STORAGE_KEYS.CLASSES, payload.classes);
    }
    if (payload.students && Array.isArray(payload.students)) {
      storage.set(STORAGE_KEYS.STUDENTS, payload.students);
    }
    if (payload.subjects && Array.isArray(payload.subjects)) {
      storage.set(STORAGE_KEYS.SUBJECTS, payload.subjects);
    }
    if (payload.topics && Array.isArray(payload.topics)) {
      storage.set(STORAGE_KEYS.TOPICS, payload.topics);
    }
    if (payload.lessons && Array.isArray(payload.lessons)) {
      storage.set(STORAGE_KEYS.LESSONS, payload.lessons);
    }
    if (payload.questions && Array.isArray(payload.questions)) {
      storage.set(STORAGE_KEYS.QUESTIONS, payload.questions);
    }
    if (payload.assignments && Array.isArray(payload.assignments)) {
      storage.set(STORAGE_KEYS.ASSIGNMENTS, payload.assignments);
    }
    if (payload.submissions && Array.isArray(payload.submissions)) {
      storage.set(STORAGE_KEYS.SUBMISSIONS, payload.submissions);
    }
    if (payload.progress && Array.isArray(payload.progress)) {
      storage.set(STORAGE_KEYS.PROGRESS, payload.progress);
    }
    if (payload.announcements && Array.isArray(payload.announcements)) {
      storage.set(STORAGE_KEYS.ANNOUNCEMENTS, payload.announcements);
    }
    return true;
  }
}
