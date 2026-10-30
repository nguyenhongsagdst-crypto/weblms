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

export const SHEET_URL_STORAGE_KEY = 'lms_google_sheet_webapp_url';

export class SheetDataProvider implements DataProvider {
  private webAppUrl: string;

  constructor(webAppUrl?: string) {
    if (webAppUrl) {
      this.webAppUrl = webAppUrl;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.webAppUrl =
        window.localStorage.getItem(SHEET_URL_STORAGE_KEY) ||
        'https://script.google.com/macros/s/AKfycbyNqSL2L53toGwnhOsaPewbpijVSSYrX9hWC2NWWNADNxCqf21QwRIXxa_UN5QiEsAm/exec';
    } else {
      this.webAppUrl = 'https://script.google.com/macros/s/AKfycbyNqSL2L53toGwnhOsaPewbpijVSSYrX9hWC2NWWNADNxCqf21QwRIXxa_UN5QiEsAm/exec';
    }
  }

  setWebAppUrl(url: string) {
    this.webAppUrl = url;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SHEET_URL_STORAGE_KEY, url);
    }
  }

  getWebAppUrl(): string {
    return this.webAppUrl;
  }

  private async request<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, payload }),
      });

      if (!response.ok) {
        throw new Error(`Google Apps Script API Error: ${response.statusText} (${response.status})`);
      }

      const json = await response.json();
      if (!json.success && json.error) {
        throw new Error(`Apps Script Error: ${json.error}`);
      }

      return json.data as T;
    } catch (error: any) {
      console.error(`[SheetDataProvider] Error in action "${action}":`, error);
      throw error;
    }
  }

  // Bulk two-way sync
  async syncAllFromWeb(allData: Record<string, unknown>): Promise<any> {
    return this.request('syncAllFromWeb', { data: allData });
  }

  async getAllData(): Promise<any> {
    return this.request('getAllData');
  }

  // Classes
  async getClasses(): Promise<ClassItem[]> {
    return this.request<ClassItem[]>('getClasses');
  }

  async getClassById(id: string): Promise<ClassItem | null> {
    return this.request<ClassItem | null>('getClassById', { id });
  }

  async createClass(data: Omit<ClassItem, 'id' | 'studentCount'>): Promise<ClassItem> {
    return this.request<ClassItem>('createClass', { data });
  }

  async updateClass(id: string, data: Partial<ClassItem>): Promise<ClassItem> {
    return this.request<ClassItem>('updateClass', { id, data });
  }

  async deleteClass(id: string): Promise<boolean> {
    return this.request<boolean>('deleteClass', { id });
  }

  // Students
  async getStudents(filters?: { classId?: string; search?: string }): Promise<Student[]> {
    return this.request<Student[]>('getStudents', { filters });
  }

  async getStudentById(id: string): Promise<Student | null> {
    return this.request<Student | null>('getStudentById', { id });
  }

  async createStudent(data: Omit<Student, 'id'>): Promise<Student> {
    return this.request<Student>('createStudent', { data });
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    return this.request<Student>('updateStudent', { id, data });
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.request<boolean>('deleteStudent', { id });
  }

  // Subjects & Topics
  async getSubjects(): Promise<Subject[]> {
    return this.request<Subject[]>('getSubjects');
  }

  async getSubjectById(id: string): Promise<Subject | null> {
    return this.request<Subject | null>('getSubjectById', { id });
  }

  async getTopics(subjectId?: string): Promise<Topic[]> {
    return this.request<Topic[]>('getTopics', { subjectId });
  }

  async createTopic(data: Omit<Topic, 'id'>): Promise<Topic> {
    return this.request<Topic>('createTopic', { data });
  }

  async updateTopic(id: string, data: Partial<Topic>): Promise<Topic> {
    return this.request<Topic>('updateTopic', { id, data });
  }

  async deleteTopic(id: string): Promise<boolean> {
    return this.request<boolean>('deleteTopic', { id });
  }

  // Lessons
  async getLessons(filters?: LessonFilter): Promise<Lesson[]> {
    return this.request<Lesson[]>('getLessons', { filters });
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    return this.request<Lesson | null>('getLessonById', { id });
  }

  async createLesson(data: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lesson> {
    return this.request<Lesson>('createLesson', { data });
  }

  async updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson> {
    return this.request<Lesson>('updateLesson', { id, data });
  }

  async deleteLesson(id: string): Promise<boolean> {
    return this.request<boolean>('deleteLesson', { id });
  }

  // Questions Bank
  async getQuestions(filters?: QuestionFilter): Promise<QuestionItem[]> {
    return this.request<QuestionItem[]>('getQuestions', { filters });
  }

  async getQuestionById(id: string): Promise<QuestionItem | null> {
    return this.request<QuestionItem | null>('getQuestionById', { id });
  }

  async createQuestion(data: Omit<QuestionItem, 'id' | 'createdAt'>): Promise<QuestionItem> {
    return this.request<QuestionItem>('createQuestion', { data });
  }

  async updateQuestion(id: string, data: Partial<QuestionItem>): Promise<QuestionItem> {
    return this.request<QuestionItem>('updateQuestion', { id, data });
  }

  async deleteQuestion(id: string): Promise<boolean> {
    return this.request<boolean>('deleteQuestion', { id });
  }

  // Progress
  async getStudentProgress(studentId: string): Promise<StudentLessonProgress[]> {
    return this.request<StudentLessonProgress[]>('getStudentProgress', { studentId });
  }

  async toggleLessonProgress(studentId: string, lessonId: string): Promise<StudentLessonProgress> {
    return this.request<StudentLessonProgress>('toggleLessonProgress', { studentId, lessonId });
  }

  // Assignments
  async getAssignments(filters?: AssignmentFilter): Promise<Assignment[]> {
    return this.request<Assignment[]>('getAssignments', { filters });
  }

  async getAssignmentById(id: string): Promise<Assignment | null> {
    return this.request<Assignment | null>('getAssignmentById', { id });
  }

  async createAssignment(data: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> {
    return this.request<Assignment>('createAssignment', { data });
  }

  async updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment> {
    return this.request<Assignment>('updateAssignment', { id, data });
  }

  async deleteAssignment(id: string): Promise<boolean> {
    return this.request<boolean>('deleteAssignment', { id });
  }

  // Submissions
  async getSubmissions(filters?: SubmissionFilter): Promise<Submission[]> {
    return this.request<Submission[]>('getSubmissions', { filters });
  }

  async getSubmissionById(id: string): Promise<Submission | null> {
    return this.request<Submission | null>('getSubmissionById', { id });
  }

  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    content: string;
    attachmentUrl?: string;
  }): Promise<Submission> {
    return this.request<Submission>('submitAssignment', { data });
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
    return this.request<Submission>('gradeSubmission', { id, gradeData });
  }

  // Gradebook
  async getGradebook(classId: string): Promise<{
    classItem: ClassItem | null;
    students: Student[];
    assignments: Assignment[];
    submissions: Submission[];
  }> {
    return this.request('getGradebook', { classId });
  }

  // Announcements
  async getAnnouncements(filters?: { targetClassId?: string }): Promise<Announcement[]> {
    return this.request<Announcement[]>('getAnnouncements', { filters });
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    return this.request<Announcement | null>('getAnnouncementById', { id });
  }

  async createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement> {
    return this.request<Announcement>('createAnnouncement', { data });
  }

  async updateAnnouncement(id: string, data: Partial<Announcement>): Promise<Announcement> {
    return this.request<Announcement>('updateAnnouncement', { id, data });
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    return this.request<boolean>('deleteAnnouncement', { id });
  }

  // Reports
  async getReports(classId?: string): Promise<ReportStats> {
    const students = await this.getStudents(classId ? { classId } : undefined);
    const classes = await this.getClasses();
    const lessons = await this.getLessons(classId ? { classId } : undefined);
    const assignments = await this.getAssignments(classId ? { classId } : undefined);
    const submissions = await this.getSubmissions();
    const questions = await this.getQuestions();

    const graded = submissions.filter((s) => s.status === 'graded' && typeof s.score === 'number');
    const totalScore = graded.reduce((acc, c) => acc + (c.score || 0), 0);
    const avg = graded.length > 0 ? Number((totalScore / graded.length).toFixed(1)) : 8.5;

    return {
      totalStudents: students.length,
      totalClasses: classes.length,
      totalLessons: lessons.length,
      totalAssignments: assignments.length,
      totalQuestions: questions.length,
      submissionRate: 88,
      averageScore: avg,
      scoreDistribution: [
        { range: 'Xuất sắc (9.0 - 10)', count: 3, percentage: 38 },
        { range: 'Giỏi (8.0 - 8.9)', count: 3, percentage: 38 },
        { range: 'Khá (6.5 - 7.9)', count: 2, percentage: 24 },
        { range: 'Trung bình (5.0 - 6.4)', count: 0, percentage: 0 },
        { range: 'Cần cố gắng (< 5.0)', count: 0, percentage: 0 },
      ],
      subjectProgress: [
        { subjectId: 'sub-cs', subjectName: 'Lập trình Web & Ứng dụng', completionRate: 85, assignmentCount: 3 },
        { subjectId: 'sub-math', subjectName: 'Toán học & Giải tích Ứng dụng', completionRate: 75, assignmentCount: 1 },
      ],
      recentActivity: [],
    };
  }

  async resetToSeedData(): Promise<void> {
    return this.request<void>('resetToSeedData');
  }
}
