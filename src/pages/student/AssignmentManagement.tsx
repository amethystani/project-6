import React, { useState } from 'react';
import { 
  BookOpen, 
  Upload, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Bell, 
  FileText,
  AlertCircle,
  Clock,
  Hourglass
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Mock data for assignments
const ASSIGNMENTS = [
  {
    id: 'assign1',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    title: 'Algorithm Design Exercise',
    description: 'Implement three sorting algorithms and compare their performance.',
    dueDate: '2023-05-15T23:59:59',
    status: 'pending',
    maxPoints: 100,
  },
  {
    id: 'assign2',
    courseId: 'MATH201',
    courseName: 'Linear Algebra',
    title: 'Matrix Operations',
    description: 'Solve the given set of matrix operations and transformations.',
    dueDate: '2023-05-10T23:59:59',
    status: 'pending',
    maxPoints: 50,
  },
  {
    id: 'assign3',
    courseId: 'PHYS101',
    courseName: 'Physics I: Mechanics',
    title: 'Force and Motion Lab Report',
    description: 'Write a lab report on the experiments conducted on force and motion.',
    dueDate: '2023-05-22T23:59:59',
    status: 'pending',
    maxPoints: 80,
  },
  {
    id: 'assign4',
    courseId: 'ENG102',
    courseName: 'Academic Writing',
    title: 'Research Paper Draft',
    description: 'Submit a draft of your final research paper with proper citations.',
    dueDate: '2023-05-18T23:59:59',
    status: 'pending',
    maxPoints: 60,
  }
];

// Mock data for grades
const GRADES = [
  {
    assignmentId: 'prev1',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    title: 'Programming Basics Quiz',
    submittedDate: '2023-04-15T14:30:00',
    gradedDate: '2023-04-18T10:15:00',
    score: 92,
    maxPoints: 100,
    feedback: 'Excellent work on recursion concepts. Could improve on time complexity analysis.'
  },
  {
    assignmentId: 'prev2',
    courseId: 'MATH201',
    courseName: 'Linear Algebra',
    title: 'Vector Spaces Problem Set',
    submittedDate: '2023-04-12T23:45:00',
    gradedDate: '2023-04-16T15:20:00',
    score: 88,
    maxPoints: 100,
    feedback: 'Good understanding of vector spaces. Work on the proof techniques.'
  },
  {
    assignmentId: 'prev3',
    courseId: 'PHYS101',
    courseName: 'Physics I: Mechanics',
    title: 'Kinematics Quiz',
    submittedDate: '2023-04-10T11:30:00',
    gradedDate: '2023-04-14T09:00:00',
    score: 78,
    maxPoints: 100,
    feedback: 'Solid grasp of basic concepts. More practice needed on acceleration problems.'
  }
];

// Notifications data
const NOTIFICATIONS = [
  {
    id: 'notif1',
    type: 'assignment',
    title: 'Assignment Due Soon',
    message: 'Algorithm Design Exercise is due in 2 days',
    date: '2023-05-13T10:00:00',
    isRead: false,
    relatedId: 'assign1'
  },
  {
    id: 'notif2',
    type: 'grade',
    title: 'New Grade Posted',
    message: 'Your Kinematics Quiz has been graded',
    date: '2023-04-14T09:15:00',
    isRead: true,
    relatedId: 'prev3'
  },
  {
    id: 'notif3',
    type: 'announcement',
    title: 'Class Cancelled',
    message: 'Linear Algebra class on May 12th is cancelled',
    date: '2023-05-08T16:30:00',
    isRead: false,
    relatedId: null
  }
];

const AssignmentManagement = () => {
  const [assignments, setAssignments] = useState(ASSIGNMENTS);
  const [grades, setGrades] = useState(GRADES);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState('assignments');
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [expandedGrade, setExpandedGrade] = useState<string | null>(null);
  
  // Function to calculate GPA
  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    
    const totalPoints = grades.reduce((sum, grade) => sum + grade.score, 0);
    const maxPoints = grades.reduce((sum, grade) => sum + grade.maxPoints, 0);
    
    // Convert to 4.0 scale (simple approximation)
    const gpaValue = ((totalPoints / maxPoints) * 4);
    return Math.min(Number(gpaValue.toFixed(2)), 4.0);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Submit assignment function
  const handleSubmitAssignment = (assignmentId: string) => {
    // Simulate file upload with progress
    const simulateUpload = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({...prev, [assignmentId]: progress}));
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Update assignment status
          setAssignments(assignments.map(assignment => 
            assignment.id === assignmentId 
              ? {...assignment, status: 'submitted'} 
              : assignment
          ));
          
          // Clear progress after a delay
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = {...prev};
              delete newProgress[assignmentId];
              return newProgress;
            });
            
            toast.success('Assignment submitted successfully!');
          }, 1000);
        }
      }, 300);
    };
    
    simulateUpload();
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? {...notification, isRead: true}
        : notification
    ));
  };

  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due Today';
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} left`;
  };

  // Get status badge class
  const getStatusBadgeClass = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'bg-red-100 text-red-800';
    if (diffDays <= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Assignment Management</h1>
        
        <div className="relative mt-4 md:mt-0">
          <button 
            className="flex items-center p-2 text-gray-600 hover:text-primary"
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} />
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'assignments' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('grades')}
            className={`py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'grades' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Grades
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-3 border-b-2 font-medium text-sm ${
              activeTab === 'notifications' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notifications
            {notifications.some(n => !n.isRead) && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary text-white">
                {notifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
        </nav>
      </div>
      
      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2" /> 
            Upcoming Assignments
          </h2>
          
          {assignments.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No pending assignments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map(assignment => (
                <div key={assignment.id} className="border rounded-lg shadow-sm bg-white overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedAssignment(
                      expandedAssignment === assignment.id ? null : assignment.id
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.courseId}: {assignment.courseName}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${getStatusBadgeClass(assignment.dueDate)}`}>
                          {getDaysRemaining(assignment.dueDate)}
                        </span>
                        {assignment.status === 'submitted' ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <Clock size={20} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {expandedAssignment === assignment.id && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="mb-3">{assignment.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Calendar size={16} className="mr-1" />
                            <span>Due: {formatDate(assignment.dueDate)}</span>
                          </div>
                          <div>
                            <span>Max Points: {assignment.maxPoints}</span>
                          </div>
                        </div>
                        
                        {assignment.status !== 'submitted' ? (
                          <div>
                            {uploadProgress[assignment.id] !== undefined ? (
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                                <div 
                                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                                  style={{ width: `${uploadProgress[assignment.id]}%` }}
                                ></div>
                                <p className="text-xs text-gray-500 mt-1 text-right">
                                  Uploading: {uploadProgress[assignment.id]}%
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center mt-2">
                                <label className="flex-1 mr-4">
                                  <div className="relative flex items-center p-2 rounded-md border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                                    <Upload size={18} className="mr-2 text-gray-500" />
                                    <span className="text-gray-500">Choose file to upload</span>
                                    <input 
                                      type="file" 
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                      onChange={() => handleSubmitAssignment(assignment.id)}
                                    />
                                  </div>
                                </label>
                                <button 
                                  onClick={() => handleSubmitAssignment(assignment.id)}
                                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
                            <CheckCircle size={18} className="text-green-500 mr-2" />
                            <p className="text-green-800">
                              Submitted successfully on {formatDate(new Date().toISOString())}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Grade Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Current GPA</h3>
                <p className="text-3xl font-bold text-primary">{calculateGPA()}</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Assignments Completed</h3>
                <p className="text-3xl font-bold text-green-600">{grades.length}</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Average Score</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {grades.length > 0 
                    ? `${Math.round(grades.reduce((sum, grade) => sum + (grade.score / grade.maxPoints * 100), 0) / grades.length)}%` 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Grade Details</h2>
            {grades.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No grades available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Assignment</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Course</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Score</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Submitted</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Graded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {grades.map(grade => (
                      <React.Fragment key={grade.assignmentId}>
                        <tr 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setExpandedGrade(
                            expandedGrade === grade.assignmentId ? null : grade.assignmentId
                          )}
                        >
                          <td className="py-3 px-4">
                            <div className="font-medium">{grade.title}</div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {grade.courseId}: {grade.courseName}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="mr-2 font-medium">
                                {grade.score}/{grade.maxPoints}
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    (grade.score / grade.maxPoints) > 0.8 
                                      ? 'bg-green-500' 
                                      : (grade.score / grade.maxPoints) > 0.7 
                                        ? 'bg-yellow-500' 
                                        : 'bg-red-500'
                                  }`}
                                  style={{ width: `${(grade.score / grade.maxPoints) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(grade.submittedDate)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(grade.gradedDate)}
                          </td>
                        </tr>
                        {expandedGrade === grade.assignmentId && (
                          <tr>
                            <td colSpan={5} className="py-3 px-4 bg-gray-50">
                              <div className="border-t pt-3">
                                <h4 className="font-medium mb-2">Instructor Feedback:</h4>
                                <p className="text-gray-700">{grade.feedback}</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          {notifications.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`p-4 border rounded-lg flex ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="mr-4">
                    {notification.type === 'assignment' && (
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Calendar size={20} className="text-blue-600" />
                      </div>
                    )}
                    {notification.type === 'grade' && (
                      <div className="bg-green-100 p-2 rounded-full">
                        <FileText size={20} className="text-green-600" />
                      </div>
                    )}
                    {notification.type === 'announcement' && (
                      <div className="bg-amber-100 p-2 rounded-full">
                        <Bell size={20} className="text-amber-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <div className="ml-2 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement; 