import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Users,
  FileSpreadsheet,
  Bell,
  Settings,
  BarChart,
  ClipboardCheck,
  FileBarChart,
  ArrowRight,
  Activity,
  Database,
  ShieldAlert,
  Server,
  Upload,
  FileText,
  PieChart,
  LineChart,
  Presentation,
  MessageSquare,
  ListChecks,
  Clock,
  Star,
  CheckCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import ChartsComponent from '../components/ChartsComponent';
import axios from 'axios';
import { Button, Badge } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../lib/auth';

// Department Head specific stats - Update with real data
const roleSpecificStats = {
  student: [
    { label: 'Enrolled Courses', value: '5', icon: BookOpen },
    { label: 'Assignments Due', value: '3', icon: Calendar },
    { label: 'Current GPA', value: '3.8', icon: GraduationCap },
    { label: 'Attendance Rate', value: '95%', icon: Users },
  ],
  faculty: [
    { label: 'Active Courses', value: '3', icon: BookOpen },
    { label: 'Total Students', value: '120', icon: Users },
    { label: 'Pending Grades', value: '25', icon: FileSpreadsheet },
    { label: 'Office Hours', value: '10hrs/week', icon: Calendar },
  ],
  admin: [
    { label: 'Total Users', value: '500', icon: Users },
    { label: 'Active Courses', value: '45', icon: BookOpen },
    { label: 'System Alerts', value: '2', icon: ShieldAlert },
    { label: 'Resource Usage', value: '85%', icon: Server },
  ],
  head: [
    { label: 'Department Size', value: '0', icon: Users },
    { label: 'Faculty Members', value: '0', icon: GraduationCap },
    { label: 'Course Success Rate', value: '0%', icon: BarChart },
    { label: 'Budget Utilization', value: '0%', icon: Settings },
  ],
  guest: [
    { label: 'Available Courses', value: '45', icon: BookOpen },
    { label: 'Faculty Members', value: '35', icon: Users },
    { label: 'Programs Offered', value: '8', icon: GraduationCap },
    { label: 'Success Rate', value: '92%', icon: BarChart },
  ],
};

// Department Head specific quick actions
const departmentHeadActions = [
  {
    title: 'Department Analytics',
    description: 'View department performance metrics',
    icon: BarChart,
    link: '/department-analytics',
    color: 'text-blue-600'
  },
  { 
    title: 'Approvals & Policy', 
    description: 'Manage requests & policies', 
    icon: ClipboardCheck,
    link: '/approvals-management' 
  },
  { 
    title: 'Reports & Strategy', 
    description: 'Generate reports', 
    icon: FileBarChart,
    link: '/reporting-strategy' 
  },
  { 
    title: 'Send Notice', 
    description: 'Notify department members', 
    icon: Bell,
    link: '/approvals-management' 
  },
];

// Department Head specific insights
const departmentInsights = [
  { 
    title: 'Enrollment increased in CS courses',
    trend: 'up',
    percentage: '15%'
  },
  { 
    title: 'Faculty satisfaction improved',
    trend: 'up',
    percentage: '8%'
  },
  { 
    title: 'Budget utilization decreased',
    trend: 'down',
    percentage: '5%'
  },
  { 
    title: 'Research publications increased',
    trend: 'up',
    percentage: '12%'
  },
];

// Admin specific quick actions
const adminActions = [
  {
    title: 'Course Approvals',
    description: 'Review and approve course requests',
    icon: ClipboardCheck,
    link: '/resource-allocation',
    color: 'text-green-600'
  },
  {
    title: 'User Management',
    description: 'Manage system users',
    icon: Users,
    link: '/user-management',
    color: 'text-indigo-600'
  },
  { 
    title: 'Audit Logs', 
    description: 'Review system activities', 
    icon: Activity,
    link: '/audit-logs' 
  },
  { 
    title: 'System Settings', 
    description: 'Configure system settings', 
    icon: Settings,
    link: '/system-settings' 
  },
];

// Admin specific system alerts
const systemAlerts = [
  { 
    title: 'New course approval requests pending',
    severity: 'urgent',
    time: '1 hour ago'
  },
  { 
    title: 'Server load high during peak hours',
    severity: 'warning',
    time: '3 hours ago'
  },
  { 
    title: 'Automatic backup completed successfully',
    severity: 'info',
    time: '6 hours ago'
  },
];

// Admin pending course approvals
const pendingCourseApprovals = [
  {
    id: 1,
    courseCode: 'CS401',
    title: 'Advanced Machine Learning',
    requestedBy: 'Dr. Smith',
    department: 'Computer Science',
    requestedAt: '2 days ago'
  },
  {
    id: 2,
    courseCode: 'MATH302',
    title: 'Differential Equations',
    requestedBy: 'Dr. Johnson',
    department: 'Mathematics',
    requestedAt: '3 days ago'
  },
  {
    id: 3,
    courseCode: 'PHY101',
    title: 'Introduction to Physics',
    requestedBy: 'Dr. Williams',
    department: 'Physics',
    requestedAt: '4 days ago'
  }
];

// Faculty course requests
const facultyCourseRequests = [
  {
    id: 1,
    courseCode: 'CS501',
    title: 'Advanced Algorithms',
    status: 'pending',
    requestedAt: '2 days ago'
  },
  {
    id: 2,
    courseCode: 'CS405',
    title: 'Mobile App Development',
    status: 'approved',
    requestedAt: '1 week ago'
  }
];

// Faculty specific quick actions
const facultyActions = [
  {
    title: 'Manage Courses',
    description: 'Update course materials and syllabi',
    icon: BookOpen,
    link: '/dashboard/course-management',
    color: 'text-blue-600'
  },
  {
    title: 'Grade Entry',
    description: 'Enter and manage student grades',
    icon: FileSpreadsheet,
    link: '/dashboard/grade-entry',
    color: 'text-green-600'
  },
  { 
    title: 'Class Schedules', 
    description: 'View teaching timetable', 
    icon: Calendar,
    link: '/dashboard/faculty-schedule' 
  },
  { 
    title: 'Faculty Analytics', 
    description: 'View teaching performance metrics', 
    icon: BarChart,
    link: '/dashboard/faculty-analytics' 
  },
];

// Faculty pending tasks
const pendingGrades = [
  { 
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    dueDate: 'Mar 15, 2024',
    studentsCount: 35
  },
  { 
    courseCode: 'CS305',
    courseName: 'Data Structures and Algorithms',
    dueDate: 'Mar 18, 2024',
    studentsCount: 42
  },
  { 
    courseCode: 'CS401',
    courseName: 'Advanced Database Systems',
    dueDate: 'Mar 22, 2024',
    studentsCount: 28
  },
];

// Faculty course management tools
const courseManagementTools = [
  {
    title: 'Course Materials',
    description: 'Upload lecture notes and resources',
    icon: Upload,
    link: '/dashboard/course-management/materials'
  },
  {
    title: 'Assignment Creation',
    description: 'Create and manage assignments',
    icon: FileText,
    link: '/dashboard/course-management/assignments'
  },
  {
    title: 'Student Roster',
    description: 'View and manage class lists',
    icon: Users,
    link: '/dashboard/course-management/roster'
  },
  {
    title: 'Announcements',
    description: 'Send updates to your students',
    icon: MessageSquare,
    link: '/dashboard/course-management/announcements'
  }
];

// Faculty grading tools
const gradingTools = [
  {
    title: 'Grade Entry',
    description: 'Enter or update student grades',
    icon: FileSpreadsheet,
    link: '/grade-management/entry'
  },
  {
    title: 'Bulk Upload',
    description: 'Upload CSV or Excel grade files',
    icon: Upload,
    link: '/grade-management/bulk-upload'
  },
  {
    title: 'Auto Calculate',
    description: 'Calculate weighted or curved grades',
    icon: PieChart,
    link: '/grade-management/auto-calculate'
  },
  {
    title: 'Rubric Builder',
    description: 'Create and manage grading rubrics',
    icon: ListChecks,
    link: '/grade-management/rubrics'
  }
];

// Faculty performance metrics
const coursePerformanceMetrics = [
  {
    courseCode: 'CS101',
    courseName: 'Introduction to Programming',
    avgScore: '78%',
    passRate: '92%',
    trend: 'up',
    change: '5%'
  },
  {
    courseCode: 'CS305',
    courseName: 'Data Structures and Algorithms',
    avgScore: '72%',
    passRate: '85%',
    trend: 'down',
    change: '3%'
  },
  {
    courseCode: 'CS401',
    courseName: 'Advanced Database Systems',
    avgScore: '81%',
    passRate: '94%',
    trend: 'up',
    change: '7%'
  }
];

// Student quick actions
const studentActions = [
  {
    title: 'Course Registration',
    description: 'Register for courses',
    icon: BookOpen,
    link: '/dashboard/course-registration',
    color: 'text-green-600'
  },
  { 
    title: 'Assignments', 
    description: 'View and submit assignments', 
    icon: FileText,
    link: '/dashboard/assignment-management' 
  },
  { 
    title: 'Academic Records', 
    description: 'View your academic record', 
    icon: GraduationCap,
    link: '/dashboard/academic-records' 
  },
  { 
    title: 'Class Schedule', 
    description: 'View your class schedule', 
    icon: Calendar,
    link: '/dashboard/student-schedule' 
  },
];

// Faculty specific insights
const facultyInsights = [
  { 
    title: 'Student engagement increased',
    trend: 'up',
    percentage: '10%'
  },
  { 
    title: 'Assignment completion rate improved',
    trend: 'up',
    percentage: '7%'
  },
  { 
    title: 'Exam average scores decreased',
    trend: 'down',
    percentage: '3%'
  },
  { 
    title: 'Office hours attendance increased',
    trend: 'up',
    percentage: '15%'
  },
];

// Student specific insights
const studentInsights = [
  { 
    title: 'Your GPA increased this semester',
    trend: 'up',
    percentage: '5%'
  },
  { 
    title: 'Assignment scores improved',
    trend: 'up',
    percentage: '12%'
  },
  { 
    title: 'Study time decreased',
    trend: 'down',
    percentage: '8%'
  },
  { 
    title: 'Course satisfaction increased',
    trend: 'up',
    percentage: '10%'
  },
];

// Admin specific insights
const adminInsights = [
  { 
    title: 'System performance improved',
    trend: 'up',
    percentage: '12%'
  },
  { 
    title: 'User logins increased',
    trend: 'up',
    percentage: '20%'
  },
  { 
    title: 'Error rates decreased',
    trend: 'down',
    percentage: '35%'
  },
  { 
    title: 'Resource utilization optimized',
    trend: 'up',
    percentage: '8%'
  },
];

// Department head course requests
const departmentHeadCourseRequests = [
  {
    id: 1,
    courseCode: 'CS501',
    title: 'Advanced Algorithms',
    status: 'pending',
    requestedAt: '2 days ago'
  },
  {
    id: 2,
    courseCode: 'CS405',
    title: 'Mobile App Development',
    status: 'approved',
    requestedAt: '1 week ago'
  },
  {
    id: 3,
    courseCode: 'CS301',
    title: 'Database Systems',
    status: 'rejected',
    requestedAt: '2 weeks ago'
  }
];

// Define interfaces for course request types
interface CourseApproval {
  id: number;
  course: {
    course_code: string;
    title: string;
    department: string;
  };
  requested_by: string | number;
  requested_at: string;
  status: string;
}

interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  type: string;
  day: number;
}

interface CourseRequest {
  id: number;
  courseCode: string;
  title: string;
  status: string;
  requestedAt: string;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [adminPendingApprovals, setAdminPendingApprovals] = useState<CourseRequest[]>([]);
  const [loadingAdminApprovals, setLoadingAdminApprovals] = useState(false);
  const location = useLocation();
  const { token } = useAuth();
  // New states for real-time data
  const [departmentAnalytics, setDepartmentAnalytics] = useState<Record<string, any>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [busyDays, setBusyDays] = useState<number[]>([]);
  // State for storing stats to force re-render
  const [stats, setStats] = useState(roleSpecificStats[user?.role as keyof typeof roleSpecificStats] || roleSpecificStats.guest);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedTool, setSelectedTool] = useState<(typeof courseManagementTools)[0] | null>(null);
  
  // Fetch real data when component mounts
  useEffect(() => {
    if (user?.role === 'head') {
      fetchDepartmentAnalytics();
      generateCalendarEvents();
    }
    if (user?.role === 'admin') {
      fetchAdminPendingApprovals();
      generateCalendarEvents();
    }
    if (user?.role === 'faculty' || user?.role === 'student') {
      generateCalendarEvents();
    }
  }, [user, token]);
  
  // Update the stats when role changes
  useEffect(() => {
    setStats(roleSpecificStats[user?.role as keyof typeof roleSpecificStats] || roleSpecificStats.guest);
  }, [user?.role]);

  // Add the generateCalendarEvents function that creates role-specific events
  const generateCalendarEvents = () => {
    const events: Array<{id: number, date: Date, title: string, type: string, day: number}> = [];
    const today = new Date();
    const currentMonth = selectedMonth;
    const currentYear = selectedYear;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Reset busy days
    const newBusyDays: Record<string, number> = {};
    
    // Generate events based on user role
    if (user?.role === 'admin') {
      // Admin events - focused on approvals and administrative tasks
      events.push({ 
        id: 1, 
        date: new Date(currentYear, currentMonth, Math.min(5, daysInMonth)), 
        title: 'Faculty Meeting', 
        type: 'meeting',
        day: Math.min(5, daysInMonth)
      });
      events.push({ 
        id: 2, 
        date: new Date(currentYear, currentMonth, Math.min(10, daysInMonth)), 
        title: 'Budget Review', 
        type: 'deadline',
        day: Math.min(10, daysInMonth)
      });
      events.push({ 
        id: 3, 
        date: new Date(currentYear, currentMonth, Math.min(15, daysInMonth)), 
        title: 'Course Approval Deadline', 
        type: 'deadline',
        day: Math.min(15, daysInMonth)
      });
      events.push({ 
        id: 4, 
        date: new Date(currentYear, currentMonth, Math.min(20, daysInMonth)), 
        title: 'Department Heads Meeting', 
        type: 'meeting',
        day: Math.min(20, daysInMonth)
      });
    } else if (user?.role === 'faculty') {
      // Faculty events - focused on teaching and research
      events.push({ 
        id: 1, 
        date: new Date(currentYear, currentMonth, Math.min(3, daysInMonth)), 
        title: 'Office Hours', 
        type: 'meeting',
        day: Math.min(3, daysInMonth)
      });
      events.push({ 
        id: 2, 
        date: new Date(currentYear, currentMonth, Math.min(10, daysInMonth)), 
        title: 'Research Presentation', 
        type: 'presentation',
        day: Math.min(10, daysInMonth)
      });
      events.push({ 
        id: 3, 
        date: new Date(currentYear, currentMonth, Math.min(15, daysInMonth)), 
        title: 'Midterm Exam', 
        type: 'exam',
        day: Math.min(15, daysInMonth)
      });
      events.push({ 
        id: 4, 
        date: new Date(currentYear, currentMonth, Math.min(22, daysInMonth)), 
        title: 'Course Materials Deadline', 
        type: 'deadline',
        day: Math.min(22, daysInMonth)
      });
    } else if (user?.role === 'head') {
      // Department Head events - focused on departmental oversight
      events.push({ 
        id: 1, 
        date: new Date(currentYear, currentMonth, Math.min(4, daysInMonth)), 
        title: 'Faculty Performance Review', 
        type: 'meeting',
        day: Math.min(4, daysInMonth)
      });
      events.push({ 
        id: 2, 
        date: new Date(currentYear, currentMonth, Math.min(10, daysInMonth)), 
        title: 'Department Budget Planning', 
        type: 'deadline',
        day: Math.min(10, daysInMonth)
      });
      events.push({ 
        id: 3, 
        date: new Date(currentYear, currentMonth, Math.min(15, daysInMonth)), 
        title: 'Course Approvals Due', 
        type: 'deadline',
        day: Math.min(15, daysInMonth)
      });
      events.push({ 
        id: 4, 
        date: new Date(currentYear, currentMonth, Math.min(20, daysInMonth)), 
        title: 'Academic Council Meeting', 
        type: 'meeting',
        day: Math.min(20, daysInMonth)
      });
      events.push({ 
        id: 5, 
        date: new Date(currentYear, currentMonth, Math.min(25, daysInMonth)), 
        title: 'Strategic Planning Session', 
        type: 'meeting',
        day: Math.min(25, daysInMonth)
      });
    } else if (user?.role === 'student') {
      // Student events - focused on academic deadlines
      events.push({ 
        id: 1, 
        date: new Date(currentYear, currentMonth, Math.min(5, daysInMonth)), 
        title: 'Course Registration Begins', 
        type: 'deadline',
        day: Math.min(5, daysInMonth)
      });
      events.push({ 
        id: 2, 
        date: new Date(currentYear, currentMonth, Math.min(12, daysInMonth)), 
        title: 'Midterm Exams', 
        type: 'exam',
        day: Math.min(12, daysInMonth)
      });
      events.push({ 
        id: 3, 
        date: new Date(currentYear, currentMonth, Math.min(20, daysInMonth)), 
        title: 'Assignment Due', 
        type: 'deadline',
        day: Math.min(20, daysInMonth)
      });
      events.push({ 
        id: 4, 
        date: new Date(currentYear, currentMonth, Math.min(25, daysInMonth)), 
        title: 'Study Group Meeting', 
        type: 'meeting',
        day: Math.min(25, daysInMonth)
      });
    }
    
    // Add some additional random events to create busy days
    const numRandomEvents = Math.floor(Math.random() * 5) + 3; // 3-7 random events
    for (let i = 0; i < numRandomEvents; i++) {
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1;
      const eventTypes = ['meeting', 'deadline', 'exam', 'presentation'] as const;
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const titles: Record<string, string[]> = {
        meeting: ['Committee Meeting', 'Staff Meeting', 'Advisory Meeting', 'Consultation Hours'],
        deadline: ['Report Submission', 'Project Deadline', 'Review Deadline', 'Documentation Due'],
        exam: ['Final Exam', 'Quiz', 'Assessment', 'Evaluation'],
        presentation: ['Guest Lecture', 'Student Presentation', 'Workshop', 'Seminar']
      };
      const randomTitle = titles[randomType][Math.floor(Math.random() * titles[randomType].length)];
      
      events.push({
        id: 100 + i,
        date: new Date(currentYear, currentMonth, randomDay),
        title: randomTitle,
        type: randomType,
        day: randomDay
      });
    }
    
    // Calculate busy days (days with more than one event)
    events.forEach(event => {
      const day = event.date.getDate().toString();
      if (!newBusyDays[day]) {
        newBusyDays[day] = 0;
      }
      newBusyDays[day]++;
    });
    
    // Set days with more than one event as busy
    const busyDaysArray: number[] = [];
    Object.entries(newBusyDays).forEach(([day, count]) => {
      if (count > 1) {
        busyDaysArray.push(parseInt(day));
      }
    });
    
    setCalendarEvents(events);
    setBusyDays(busyDaysArray);
  };

  // Fetch department analytics data
  const fetchDepartmentAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/department-head/analytics`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status === 'success') {
        setDepartmentAnalytics(response.data.data);
        
        // Create a new copy of stats to update with real data
        const newStats = [...stats];
        
        // Update Department Size (total enrollments)
        if (response.data.data.enrollment_statistics && response.data.data.enrollment_statistics.total_enrollments !== undefined) {
          newStats[0] = { 
            ...newStats[0], 
            value: response.data.data.enrollment_statistics.total_enrollments.toString() 
          };
        }
        
        // Update Faculty Members count
        if (response.data.data.faculty_statistics && response.data.data.faculty_statistics.total_faculty !== undefined) {
          newStats[1] = { 
            ...newStats[1], 
            value: response.data.data.faculty_statistics.total_faculty.toString() 
          };
        }
        
        // Update Course Success Rate
        if (response.data.data.course_statistics && response.data.data.course_statistics.success_rate !== undefined) {
          newStats[2] = { 
            ...newStats[2], 
            value: `${Math.round(response.data.data.course_statistics.success_rate)}%`
          };
        }
        
        // Update Budget Utilization
        if (response.data.data.budget_statistics && response.data.data.budget_statistics.utilization_rate !== undefined) {
          newStats[3] = { 
            ...newStats[3], 
            value: `${Math.round(response.data.data.budget_statistics.utilization_rate)}%`
          };
        }
        
        // Update the roleSpecificStats directly for the head role
        roleSpecificStats.head = newStats;
        
        // Force a re-render by setting stats again
        setStats(newStats);
      } else {
        console.error('Failed to fetch department analytics');
      }
    } catch (error) {
      console.error('Error fetching department analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchAdminPendingApprovals = async () => {
    setLoadingAdminApprovals(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/approvals/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const formattedApprovals = response.data.data.map((approval: CourseApproval) => ({
        id: approval.id,
        courseCode: approval.course.course_code,
        title: approval.course.title,
        status: approval.status,
        requestedAt: approval.requested_at
      }));
      
      setAdminPendingApprovals(formattedApprovals);
      setLoadingAdminApprovals(false);
    } catch (error) {
      console.error("Error fetching admin pending approvals:", error);
      setLoadingAdminApprovals(false);
    }
  };

  // Get appropriate quick actions based on role
  const getQuickActions = () => {
    switch (user?.role) {
      case 'head': return departmentHeadActions;
      case 'admin': return adminActions;
      case 'faculty': return facultyActions;
      case 'student': return studentActions;
      default: return [];
    }
  };

  // In the Dashboard component, add a function to get real insights
  const getInsightsFromAnalytics = () => {
    if (!departmentAnalytics || Object.keys(departmentAnalytics).length === 0) {
      return departmentInsights;
    }
    
    const realInsights = [];
    
    // Add enrollment insight if available
    if (departmentAnalytics.enrollment_statistics?.trend_percentage) {
      const enrollmentTrend = departmentAnalytics.enrollment_statistics.trend_percentage;
      realInsights.push({
        title: `Enrollment ${enrollmentTrend > 0 ? 'increased' : 'decreased'} in department`,
        trend: enrollmentTrend > 0 ? 'up' : 'down',
        percentage: `${Math.abs(enrollmentTrend)}%`
      });
    }
    
    // Add faculty insight if available
    if (departmentAnalytics.faculty_statistics?.satisfaction_trend) {
      const satisfactionTrend = departmentAnalytics.faculty_statistics.satisfaction_trend;
      realInsights.push({
        title: `Faculty satisfaction ${satisfactionTrend > 0 ? 'improved' : 'declined'}`,
        trend: satisfactionTrend > 0 ? 'up' : 'down',
        percentage: `${Math.abs(satisfactionTrend)}%`
      });
    }
    
    // Add budget insight if available
    if (departmentAnalytics.budget_statistics?.utilization_trend) {
      const budgetTrend = departmentAnalytics.budget_statistics.utilization_trend;
      realInsights.push({
        title: `Budget utilization ${budgetTrend > 0 ? 'increased' : 'decreased'}`,
        trend: budgetTrend > 0 ? 'up' : 'down',
        percentage: `${Math.abs(budgetTrend)}%`
      });
    }
    
    // Add research insight if available
    if (departmentAnalytics.research_statistics?.publication_trend) {
      const researchTrend = departmentAnalytics.research_statistics.publication_trend;
      realInsights.push({
        title: `Research publications ${researchTrend > 0 ? 'increased' : 'decreased'}`,
        trend: researchTrend > 0 ? 'up' : 'down',
        percentage: `${Math.abs(researchTrend)}%`
      });
    }
    
    // If we have insights from the API, return them, otherwise fallback to mock data
    return realInsights.length > 0 ? realInsights : departmentInsights;
  };

  // Replace the getInsights function with the updated one
  const getInsights = () => {
    switch (user?.role) {
      case 'head': return getInsightsFromAnalytics();
      case 'admin': return adminInsights;
      case 'faculty': return facultyInsights;
      case 'student': return studentInsights;
      default: return [];
    }
  };
  
  // Calendar data generation 
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
  
  // Simulated events for the calendar
  const events = [
    { day: 5, title: 'Department Meeting', type: 'meeting' },
    { day: 12, title: 'Assignment Due', type: 'assignment' },
    { day: 15, title: 'Midterm Exams', type: 'exam' },
    { day: 22, title: 'Workshop', type: 'workshop' },
  ];

  // Recent notifications
  const notifications = [
    { id: 1, title: 'System Update', message: 'The system will be down for maintenance on Saturday', time: '2 hours ago', read: false },
    { id: 2, title: 'New Course Available', message: 'A new course has been added to your curriculum', time: '1 day ago', read: true },
    { id: 3, title: 'Upcoming Event', message: 'Department seminar scheduled for next week', time: '2 days ago', read: true },
  ];

  // Add the prevMonth and nextMonth functions to the Dashboard component
  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    // Re-generate calendar events for the new month
    generateCalendarEvents();
  };

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    // Re-generate calendar events for the new month
    generateCalendarEvents();
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section with Animated Gradient Border */}
      <div className="relative p-1 rounded-lg bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 animate-gradient-x">
        <div className="bg-background p-4 md:p-6 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center">
              <img src="/assets/logo/logo.jpg" alt="Logo" className="h-12 w-auto mr-4 rounded" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name}</h1>
                <p className="text-muted-foreground mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <div className="bg-primary/10 px-4 py-2 rounded-md flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <span className="text-sm font-medium">
                  {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="bg-primary/10 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                <span>
                  {user?.role === 'student' ? 'Spring Semester' : 
                   user?.role === 'faculty' ? 'Teaching Period' : 
                   user?.role === 'admin' ? 'Admin Dashboard' : 
                   user?.role === 'head' ? 'Department Overview' : 'Dashboard'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-background border border-border p-4 rounded-lg transform hover:scale-105 transition-transform duration-300 hover:shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{stat.label}</p>
                  <h2 className="text-3xl font-bold mt-1">{stat.value}</h2>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin-specific Course Approvals Section */}
      {user?.role === 'admin' && (
        <div className="bg-background border border-border rounded-lg p-4 md:p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <ClipboardCheck className="h-5 w-5 mr-2 text-primary" />
              Pending Course Approvals
            </h2>
            <div className="flex items-center space-x-2">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchAdminPendingApprovals}
                loading={loadingAdminApprovals}
              >
                Refresh
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loadingAdminApprovals ? (
              <div className="text-center py-8">Loading pending approvals...</div>
            ) : adminPendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending course approvals found.
              </div>
            ) : (
              <div className="text-center p-4">
                <p className="mb-4">
                  You have <span className="font-bold text-primary">{adminPendingApprovals.length}</span> pending course approval{adminPendingApprovals.length !== 1 ? 's' : ''} that require your attention.
                </p>
                <Link
                  to="/dashboard/resource-allocation"
                  className="bg-primary text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 inline-block"
                >
                  Review Course Approvals
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Faculty-specific Current Teaching Load Section */}
      {user?.role === 'faculty' && (
        <div className="bg-background border border-border rounded-lg p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              Current Teaching Load
            </h2>
            <Link 
              to="/dashboard/course-management" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Course Materials
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-4">Course Code</th>
                  <th className="text-left py-2 px-4">Course Title</th>
                  <th className="text-left py-2 px-4">Students</th>
                  <th className="text-left py-2 px-4">Pending Grades</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coursePerformanceMetrics.map((course) => (
                  <tr key={course.courseCode} className="border-b border-border hover:bg-background/50">
                    <td className="py-2 px-4">{course.courseCode}</td>
                    <td className="py-2 px-4">{course.courseName}</td>
                    <td className="py-2 px-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-primary" />
                        {Math.floor(Math.random() * 40) + 15}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        Math.random() > 0.5 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {Math.random() > 0.5 ? `${Math.floor(Math.random() * 10) + 1} pending` : 'None'}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex space-x-2">
                        <Link to={`/dashboard/course-management/${course.courseCode.toLowerCase()}`} className="text-primary hover:underline text-sm">
                          Manage
                        </Link>
                        <Link to={`/dashboard/grade-entry/${course.courseCode.toLowerCase()}`} className="text-primary hover:underline text-sm">
                          Enter Grades
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {/* Commenting out duplicate charts components
      {user?.role === 'head' && (
        <ChartsComponent defaultChart="enrollment" />
      )}
      
      {user?.role === 'faculty' && (
        <ChartsComponent defaultChart="performance" />
      )}
      
      {user?.role === 'admin' && (
        <ChartsComponent defaultChart="budget" />
      )}
      */}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Quick Actions */}
        <div className="bg-background border border-border rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <ArrowRight className="h-5 w-5 mr-2 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {user?.role === 'student' ? (
              <>
                {studentActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-start p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${action.color || 'bg-primary/10'}`}>
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </>
            ) : user?.role === 'faculty' ? (
              <>
                {facultyActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-start p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${action.color || 'bg-primary/10'}`}>
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </>
            ) : null}
          </div>
        </div>

        {/* Faculty-specific Course Management Tools */}
        {user?.role === 'faculty' && (
          <div className="bg-background border border-border rounded-lg p-4 md:p-6">
            <h2 className="text-xl font-bold flex items-center mb-4">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              Course Management Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {courseManagementTools.map((tool, index) => (
                <Link
                  key={index}
                  to={tool.link}
                  className="flex items-start p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <tool.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium">{tool.title}</h3>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Calendar - Takes 2 columns on large screens */}
        <div className="bg-background border border-border rounded-lg p-4 md:p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Calendar
          </h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex space-x-1">
                  <button onClick={prevMonth} className="p-1 hover:bg-primary/10 rounded">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextMonth} className="p-1 hover:bg-primary/10 rounded">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center text-xs leading-6 text-muted-foreground">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="mt-2 grid grid-cols-7 text-sm">
                {[...Array(firstDayOfMonth).keys()].map((_, i) => (
                  <div key={`empty-${i}`} className="py-2" />
                ))}
                {[...Array(daysInMonth).keys()].map((_, i) => {
                  const day = i + 1;
                  const date = new Date(selectedYear, selectedMonth, day);
                  const isToday = 
                    date.getDate() === new Date().getDate() &&
                    date.getMonth() === new Date().getMonth() &&
                    date.getFullYear() === new Date().getFullYear();
                  
                  const dayEvents = calendarEvents.filter(event => event.day === day);
                  const hasEvents = dayEvents.length > 0;
                  const isBusy = busyDays.includes(day);
                  
                  return (
                    <div key={`day-${day}`} 
                      className={`relative py-2 px-1 cursor-pointer hover:bg-primary/5 transition-colors ${
                        isToday ? 'bg-primary/10 font-bold' : ''
                      }`}
                      title={dayEvents.map(e => e.title).join(', ')}
                    >
                      <div className={`flex flex-col items-center ${isToday ? 'text-primary' : ''}`}>
                        <span>{day}</span>
                        {hasEvents && (
                          <div className="mt-1 flex space-x-0.5">
                            {isBusy ? (
                              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                            {dayEvents.length > 1 && (
                              <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                            )}
                          </div>
                        )}
                      </div>
                      {dayEvents.length > 0 && dayEvents[0].type === 'today' && (
                        <div className="absolute -top-1 -right-1">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Events list */}
              <div className="mt-4 max-h-32 overflow-y-auto">
                <h4 className="text-sm font-medium mb-2">Upcoming Events</h4>
                <div className="space-y-2">
                  {calendarEvents
                    .filter(event => event.day >= new Date().getDate() || selectedMonth > new Date().getMonth())
                    .sort((a, b) => a.day - b.day)
                    .slice(0, 3)
                    .map((event, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          event.type === 'meeting' ? 'bg-blue-500' :
                          event.type === 'deadline' ? 'bg-red-500' :
                          event.type === 'exam' ? 'bg-yellow-500' :
                          event.type === 'today' ? 'bg-green-500' :
                          'bg-primary'
                        }`} />
                        <span className="font-medium mr-2">{event.day}</span>
                        <span>{event.title}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Insights and Analytics */}
        <div className="bg-background border border-border rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            Insights & Analytics
          </h2>
          <div className="space-y-4">
            {getInsights().slice(0, 4).map((insight, i) => (
              <div key={i} className="flex items-start p-3 rounded-lg hover:bg-primary/5 transition-colors">
                <div className={cn(
                  "p-2 rounded-full mr-3",
                  insight.trend === 'up' ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
                )}>
                  {insight.trend === 'up' ? <ArrowRight className="h-4 w-4 rotate-[-45deg]" /> : <ArrowRight className="h-4 w-4 rotate-45" />}
                </div>
                <div>
                  <div className="font-medium">{insight.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {insight.trend === 'up' ? 'Increased by ' : 'Decreased by '}
                    <span className={insight.trend === 'up' ? "text-green-600" : "text-red-600"}>
                      {insight.percentage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Link to="/department-analytics" className="block mt-4 text-sm text-primary hover:underline">
              View all analytics →
            </Link>
          </div>
        </div>
      </div>

      {/* Admin-specific System Alerts Section */}
      {user?.role === 'admin' && (
        <div className="bg-background border border-border rounded-lg p-4 md:p-6 mb-6">
          <h2 className="text-xl font-bold flex items-center mb-4">
            <ShieldAlert className="h-5 w-5 mr-2 text-primary" />
            System Alerts
          </h2>
          <div className="space-y-3">
            {systemAlerts.map((alert, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'urgent' 
                    ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' 
                    : alert.severity === 'warning' 
                    ? 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                    : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex items-center">
                    {alert.severity === 'urgent' && (
                      <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    {alert.severity === 'warning' && (
                      <Bell className="h-5 w-5 text-amber-500 mr-2" />
                    )}
                    {alert.severity === 'info' && (
                      <Bell className="h-5 w-5 text-blue-500 mr-2" />
                    )}
                    <span className="font-medium">{alert.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
                {alert.severity === 'urgent' && alert.title.includes('course approval') && (
                  <div className="mt-2 flex justify-end">
                    <Link 
                      to="/resource-allocation" 
                      className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-medium"
                    >
                      Review Now
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard Charts - Only visible for roles that need analytics */}
      {(user?.role === 'admin' || user?.role === 'head') && (
        <div className="grid grid-cols-1 gap-6">
          <ChartsComponent
            defaultChart={user?.role === 'head' ? 'enrollment' : 'performance'}
            analyticsData={departmentAnalytics} // Pass the analytics data to the charts component
            isLoading={loadingAnalytics}
          />
        </div>
      )}
    </div>
  );
}