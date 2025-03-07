import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { Link } from 'react-router-dom';
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
  CheckCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import ChartsComponent from '../components/ChartsComponent';

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
    { label: 'Department Size', value: '650', icon: Users },
    { label: 'Faculty Members', value: '35', icon: GraduationCap },
    { label: 'Course Success Rate', value: '92%', icon: BarChart },
    { label: 'Budget Utilization', value: '75%', icon: Settings },
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
    title: 'Resource Allocation', 
    description: 'Manage system resources', 
    icon: Database,
    link: '/resource-allocation' 
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
    title: 'Server load high during peak hours',
    severity: 'warning',
    time: '3 hours ago'
  },
  { 
    title: 'Automatic backup completed successfully',
    severity: 'info',
    time: '6 hours ago'
  },
  { 
    title: 'Failed login attempts for user ID 172',
    severity: 'critical',
    time: '1 day ago'
  },
];

// Faculty specific quick actions
const facultyActions = [
  {
    title: 'Course Management',
    description: 'Manage your courses',
    icon: BookOpen,
    link: '/course-management',
    color: 'text-blue-600'
  },
  { 
    title: 'Grade Entry', 
    description: 'Enter and manage grades', 
    icon: FileSpreadsheet,
    link: '/grade-entry' 
  },
  { 
    title: 'Faculty Analytics', 
    description: 'View performance metrics', 
    icon: BarChart,
    link: '/faculty-analytics' 
  },
  { 
    title: 'Office Hours', 
    description: 'Manage office hours', 
    icon: Clock,
    link: '/schedule' 
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
    title: 'Edit Syllabus',
    description: 'Update course details and structure',
    icon: FileText,
    link: '/course-management/syllabus'
  },
  {
    title: 'Class Lists',
    description: 'View and manage student lists',
    icon: Users,
    link: '/course-management/class-lists'
  },
  {
    title: 'Post Announcements',
    description: 'Send updates to enrolled students',
    icon: MessageSquare,
    link: '/course-management/announcements'
  },
  {
    title: 'Upload Materials',
    description: 'Share study materials and resources',
    icon: Upload,
    link: '/course-management/materials'
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
    link: '/course-registration',
    color: 'text-green-600'
  },
  { 
    title: 'Assignments', 
    description: 'View and submit assignments', 
    icon: FileText,
    link: '/assignment-management' 
  },
  { 
    title: 'Academic Records', 
    description: 'View your academic record', 
    icon: GraduationCap,
    link: '/academic-records' 
  },
  { 
    title: 'Class Schedule', 
    description: 'View your class schedule', 
    icon: Calendar,
    link: '/schedule' 
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

export default function Dashboard() {
  const { user } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Get current stats based on user role
  const stats = roleSpecificStats[user?.role as keyof typeof roleSpecificStats] || roleSpecificStats.guest;
  
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

  // Get appropriate insights based on role
  const getInsights = () => {
    switch (user?.role) {
      case 'head': return departmentInsights;
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome Section with Animated Gradient Border */}
      <div className="relative p-1 rounded-lg bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 animate-gradient-x">
        <div className="bg-background p-4 md:p-6 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name}</h1>
              <p className="text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
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

      {/* Analytics Section */}
      {user?.role === 'head' && (
        <ChartsComponent defaultChart="enrollment" />
      )}
      
      {user?.role === 'faculty' && (
        <ChartsComponent defaultChart="performance" />
      )}
      
      {user?.role === 'admin' && (
        <ChartsComponent defaultChart="budget" />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 1 column on large screens */}
        <div className="bg-background border border-border rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            {getQuickActions().map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="block group"
              >
                <div className="border border-border hover:border-primary rounded-lg p-4 transition-all duration-300 hover:bg-primary/5">
                  <div className="flex items-center">
                    <div className={cn("p-2 rounded-full mr-3", action.color ? `text-[${action.color}] bg-[${action.color}]/10` : "text-primary bg-primary/10")}>
                      {React.createElement(action.icon, { className: "h-5 w-5" })}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Calendar - Takes 2 columns on large screens */}
        <div className="bg-background border border-border rounded-lg p-4 md:p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Calendar
          </h2>
          <div className="flex justify-between items-center mb-4">
            <button 
              className="btn-icon"
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
            >
              &lt;
            </button>
            <h3 className="text-lg font-medium">
              {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long' })} {selectedYear}
            </h3>
            <button 
              className="btn-icon"
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
            >
              &gt;
            </button>
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center p-2 font-medium">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before the 1st of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="text-center p-2"></div>
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const today = new Date();
              const isToday = day === today.getDate() && 
                              selectedMonth === today.getMonth() && 
                              selectedYear === today.getFullYear();
              
              const dayEvents = events.filter(event => event.day === day);
              
              return (
                <div 
                  key={`day-${day}`} 
                  className={cn(
                    "text-center p-2 rounded-md relative cursor-pointer hover:bg-primary/10 transition-colors",
                    isToday ? "bg-primary/20 font-bold" : ""
                  )}
                >
                  {day}
                  {dayEvents.length > 0 && (
                    <div className="absolute bottom-1 right-1">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Events Legend */}
          <div className="mt-4 space-y-2">
            {events.filter(event => event.day >= 1 && event.day <= 7).map((event, i) => (
              <div key={i} className="flex items-center p-2 border-l-4 border-primary bg-primary/5 rounded-r-md">
                <div className="font-medium">{event.day}</div>
                <div className="mx-2">|</div>
                <div>{event.title}</div>
                <div className={cn(
                  "ml-auto px-2 py-1 rounded-full text-xs",
                  event.type === 'meeting' ? "bg-blue-100 text-blue-600" : 
                  event.type === 'assignment' ? "bg-amber-100 text-amber-600" :
                  event.type === 'exam' ? "bg-red-100 text-red-600" :
                  "bg-green-100 text-green-600"
                )}>
                  {event.type}
                </div>
              </div>
            ))}
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
        
        {/* Notifications - Takes full width */}
        <div className="bg-background border border-border rounded-lg p-4 md:p-6 lg:col-span-3">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            Recent Notifications
          </h2>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={cn(
                "p-3 rounded-lg border border-border flex items-start",
                !notification.read ? "border-l-4 border-l-primary" : ""
              )}>
                <div className={cn(
                  "p-2 rounded-full mr-3",
                  !notification.read ? "bg-primary/10" : "bg-muted"
                )}>
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className={cn(
                      "font-medium",
                      !notification.read ? "text-primary" : ""
                    )}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <p className="text-sm mt-1">{notification.message}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                )}
              </div>
            ))}
            <button className="btn-text w-full mt-2">
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}