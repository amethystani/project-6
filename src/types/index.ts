export type UserRole = 'student' | 'faculty' | 'admin' | 'head' | 'department_head' | 'guest';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  department?: string;
  studentId?: string;
  enrollmentYear?: string;
  major?: string;
  gpa?: string;
  creditsCompleted?: string;
  profilePicture?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor_id: string;
  capacity: number;
  enrolled: number;
  schedule: string;
  description: string;
  credits: number;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
}

export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  assignment_id: string;
  score: number;
  feedback?: string;
}

// Resource allocation types
export type ResourceType = 'room' | 'equipment' | 'lab' | 'software' | 'other';
export type ResourceStatus = 'available' | 'allocated' | 'maintenance' | 'retired';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  location: string;
  capacity?: number;
  description: string;
  acquisitionDate: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  courseId?: string;
  courseName?: string;
  purpose: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ResourceUsageReport {
  resourceId: string;
  resourceName: string;
  totalHoursUsed: number;
  totalAllocations: number;
  utilizationRate: number; // percentage
  topUsers: Array<{userId: string, userName: string, hoursUsed: number}>;
  peakUsageTimes: Array<{dayOfWeek: string, hour: number, count: number}>;
  periodStart: string;
  periodEnd: string;
}