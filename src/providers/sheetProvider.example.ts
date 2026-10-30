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

/**
 * Example Reference Implementation: Google Sheets Provider
 *
 * This class implements the exact same DataProvider contract.
 * To activate it, simply supply your Google Apps Script Web App URL or Google Sheets API endpoint
 * in your configuration and swap `activeDataProvider = new SheetDataProvider(...)` in `src/providers/index.ts`.
 * The UI layer does NOT need any modifications!
 */
export class SheetDataProvider implements DataProvider {
  private webAppUrl: string;

  constructor(webAppUrl: string = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec') {
    this.webAppUrl = webAppUrl;
  }

  private async request<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      if (!response.ok) {
        throw new Error(`Google Sheets API Error: ${response.statusText}`);
      }
      const json = await response.json();
      return json.data as T;
    } catch (error) {
      console.error(`[SheetDataProvider] Error in action "${action}":`, error);
      throw error;
    }
  }

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

  async getStudentProgress(studentId: string): Promise<StudentLessonProgress[]> {
    return this.request<StudentLessonProgress[]>('getStudentProgress', { studentId });
  }

  async toggleLessonProgress(studentId: string, lessonId: string): Promise<StudentLessonProgress> {
    return this.request<StudentLessonProgress>('toggleLessonProgress', { studentId, lessonId });
  }

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

  async getGradebook(classId: string): Promise<{
    classItem: ClassItem | null;
    students: Student[];
    assignments: Assignment[];
    submissions: Submission[];
  }> {
    return this.request('getGradebook', { classId });
  }

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

  async getReports(classId?: string): Promise<ReportStats> {
    return this.request<ReportStats>('getReports', { classId });
  }

  async resetToSeedData(): Promise<void> {
    return this.request<void>('resetToSeedData');
  }
}
