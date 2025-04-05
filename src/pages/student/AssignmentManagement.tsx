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
  Hourglass,
  Search,
  Filter,
  ArrowUpCircle,
  Eye
} from 'lucide-react';
import { Card, Table, Tag, Badge, Input, Button, Progress, Tabs, Tooltip, Divider, Space, Modal, Select } from 'antd';
import { toast } from 'react-hot-toast';

const { TabPane } = Tabs;
const { Search: SearchInput } = Input;

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
    fileType: 'pdf,doc,docx',
    allowsMultipleFiles: false
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
    fileType: 'pdf',
    allowsMultipleFiles: true
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
    fileType: 'pdf,docx',
    allowsMultipleFiles: false
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
    fileType: 'pdf,doc,docx',
    allowsMultipleFiles: false
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
  const [searchText, setSearchText] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [assignmentDetailsVisible, setAssignmentDetailsVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  
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

  // Show assignment details
  const showAssignmentDetails = (assignment: any) => {
    setSelectedAssignment(assignment);
    setAssignmentDetailsVisible(true);
  };

  // Get unique courses for filter
  const courses = Array.from(new Set([
    ...assignments.map(a => a.courseName), 
    ...grades.map(g => g.courseName)
  ])).sort();

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchText.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchText.toLowerCase()) ||
      assignment.courseId.toLowerCase().includes(searchText.toLowerCase()) ||
      assignment.courseName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCourse = courseFilter ? assignment.courseName === courseFilter : true;
    
    return matchesSearch && matchesCourse;
  });

  // Filter grades
  const filteredGrades = grades.filter(grade => {
    const matchesSearch = 
      grade.title.toLowerCase().includes(searchText.toLowerCase()) ||
      grade.courseId.toLowerCase().includes(searchText.toLowerCase()) ||
      grade.courseName.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesCourse = courseFilter ? grade.courseName === courseFilter : true;
    
    return matchesSearch && matchesCourse;
  });

  // Format score as percentage
  const formatScore = (score: number, maxPoints: number) => {
    const percentage = (score / maxPoints) * 100;
    return `${score}/${maxPoints} (${percentage.toFixed(1)}%)`;
  };

  // Get grade letter based on score
  const getGradeLetter = (score: number, maxPoints: number) => {
    const percentage = (score / maxPoints) * 100;
    
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  // Get color based on score
  const getScoreColor = (score: number, maxPoints: number) => {
    const percentage = (score / maxPoints) * 100;
    
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'blue';
    if (percentage >= 70) return 'geekblue';
    if (percentage >= 60) return 'orange';
    return 'red';
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Assignment Management</h1>
        
        <div className="flex items-center mt-4 md:mt-0 gap-2">
          <Button 
            type={activeTab === 'notifications' ? 'primary' : 'default'}
            className="relative"
            onClick={() => setActiveTab('notifications')}
            icon={<Bell size={16} />}
          >
            Notifications
            {notifications.some(n => !n.isRead) && (
              <Badge 
                dot 
                status="error" 
                style={{ position: 'absolute', top: 5, right: 5 }}
              />
            )}
          </Button>
          
          <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg flex items-center">
            <GradeIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Current GPA: {calculateGPA()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Tabs for different views */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        type="card"
        className="mb-6"
      >
        <TabPane 
          tab={
            <span className="flex items-center">
              <FileText size={16} className="mr-2" />
              Assignments
            </span>
          } 
          key="assignments"
        />
        
        <TabPane 
          tab={
            <span className="flex items-center">
              <CheckCircle size={16} className="mr-2" />
              Grades
            </span>
          } 
          key="grades"
        />
        
        <TabPane 
          tab={
            <span className="flex items-center">
              <Bell size={16} className="mr-2" />
              Notifications
              {notifications.some(n => !n.isRead) && (
                <Badge count={notifications.filter(n => !n.isRead).length} size="small" style={{ marginLeft: 5 }} />
              )}
            </span>
          } 
          key="notifications"
        />
      </Tabs>
      
      {/* Assignment Tab Content */}
      {activeTab === 'assignments' && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upcoming Assignments</h2>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <SearchInput
                placeholder="Search assignments"
                style={{ width: 200 }}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<Search size={16} className="text-gray-400" />}
              />
              <Select
                placeholder="Filter by Course"
                style={{ width: 200 }}
                value={courseFilter || undefined}
                onChange={setCourseFilter}
                allowClear
                onClear={() => setCourseFilter('')}
              >
                {courses.map(course => (
                  <Select.Option key={course} value={course}>{course}</Select.Option>
                ))}
              </Select>
              <Button 
                type="default" 
                icon={<Filter size={16} />}
                onClick={() => {
                  setSearchText('');
                  setCourseFilter('');
                }}
              >
                Clear
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {filteredAssignments.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <FileText size={40} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No assignments match your search criteria</p>
                </div>
              </Card>
            ) : (
              filteredAssignments.map(assignment => (
                <Card 
                  key={assignment.id} 
                  className={`assignment-card ${assignment.status === 'submitted' ? 'border-green-300' : ''}`}
                >
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Tag color="blue">{assignment.courseId}</Tag>
                        <h3 className="text-lg font-semibold ml-2">{assignment.title}</h3>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {assignment.courseName}
                      </p>
                      
                      <p className="mb-4">{assignment.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1 text-gray-500" />
                          <span className="text-sm">Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`text-sm px-2 py-1 rounded-full ${getStatusBadgeClass(assignment.dueDate)}`}>
                            {getDaysRemaining(assignment.dueDate)}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <AlertCircle size={16} className="mr-1 text-gray-500" />
                          <span className="text-sm">{assignment.maxPoints} points</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-end mt-4 md:mt-0 space-y-2">
                      {assignment.status === 'submitted' ? (
                        <Tag color="green" icon={<CheckCircle size={14} />}>
                          Submitted
                        </Tag>
                      ) : uploadProgress[assignment.id] ? (
                        <div className="w-48">
                          <Progress percent={uploadProgress[assignment.id]} status="active" />
                        </div>
                      ) : (
                        <Space>
                          <Button
                            type="primary"
                            icon={<ArrowUpCircle size={16} />}
                            onClick={() => handleSubmitAssignment(assignment.id)}
                          >
                            Submit
                          </Button>
                          <Button
                            type="default"
                            icon={<Eye size={16} />}
                            onClick={() => showAssignmentDetails(assignment)}
                          >
                            Details
                          </Button>
                        </Space>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        File types: {assignment.fileType}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Grades Tab Content */}
      {activeTab === 'grades' && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Grades</h2>
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <SearchInput
                placeholder="Search grades"
                style={{ width: 200 }}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                prefix={<Search size={16} className="text-gray-400" />}
              />
              <Select
                placeholder="Filter by Course"
                style={{ width: 200 }}
                value={courseFilter || undefined}
                onChange={setCourseFilter}
                allowClear
                onClear={() => setCourseFilter('')}
              >
                {courses.map(course => (
                  <Select.Option key={course} value={course}>{course}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {filteredGrades.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <FileText size={40} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No grades match your search criteria</p>
                </div>
              </Card>
            ) : (
              filteredGrades.map(grade => (
                <Card key={grade.assignmentId} className="grade-card">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Tag color="blue">{grade.courseId}</Tag>
                        <h3 className="text-lg font-semibold ml-2">{grade.title}</h3>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {grade.courseName}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Submitted</div>
                          <div>{formatDate(grade.submittedDate)}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500">Graded</div>
                          <div>{formatDate(grade.gradedDate)}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500">Score</div>
                          <div>{formatScore(grade.score, grade.maxPoints)}</div>
                        </div>
                      </div>
                      
                      {expandedGrade === grade.assignmentId && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-semibold mb-2">Feedback:</h4>
                          <p className="text-gray-700 dark:text-gray-300">{grade.feedback}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center items-end mt-4 md:mt-0">
                      <div className="flex items-center mb-2">
                        <Tag color={getScoreColor(grade.score, grade.maxPoints)} className="text-lg px-3 py-1">
                          {getGradeLetter(grade.score, grade.maxPoints)}
                        </Tag>
                      </div>
                      
                      <Button
                        type="link"
                        onClick={() => setExpandedGrade(expandedGrade === grade.assignmentId ? null : grade.assignmentId)}
                      >
                        {expandedGrade === grade.assignmentId ? 'Hide Feedback' : 'View Feedback'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Notifications Tab Content */}
      {activeTab === 'notifications' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Notifications</h2>
            
            <Button
              type="default"
              onClick={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
              disabled={!notifications.some(n => !n.isRead)}
            >
              Mark All as Read
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {notifications.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <Bell size={40} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No notifications at this time</p>
                </div>
              </Card>
            ) : (
              notifications.map(notification => (
                <Card 
                  key={notification.id} 
                  className={`notification-card ${!notification.isRead ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex">
                    <div className="mr-4">
                      {notification.type === 'assignment' && (
                        <FileText size={24} className="text-blue-500" />
                      )}
                      {notification.type === 'grade' && (
                        <CheckCircle size={24} className="text-green-500" />
                      )}
                      {notification.type === 'announcement' && (
                        <Bell size={24} className="text-orange-500" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300">{notification.message}</p>
                      
                      {!notification.isRead && (
                        <Badge status="processing" text="New" className="mt-2" />
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Assignment Details Modal */}
      <Modal
        title="Assignment Details"
        open={assignmentDetailsVisible}
        onCancel={() => setAssignmentDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setAssignmentDetailsVisible(false)}>
            Close
          </Button>,
          selectedAssignment && selectedAssignment.status !== 'submitted' && (
            <Button 
              key="submit" 
              type="primary"
              onClick={() => {
                setAssignmentDetailsVisible(false);
                handleSubmitAssignment(selectedAssignment.id);
              }}
            >
              Submit Assignment
            </Button>
          )
        ]}
        width={700}
      >
        {selectedAssignment && (
          <div className="py-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{selectedAssignment.title}</h3>
                <div className="flex items-center">
                  <Tag color="blue">{selectedAssignment.courseId}</Tag>
                  <span className="ml-2 text-gray-600">{selectedAssignment.courseName}</span>
                </div>
              </div>
              <div>
                <Tag 
                  color={
                    selectedAssignment.status === 'submitted' ? 'green' : 
                    getDaysRemaining(selectedAssignment.dueDate) === 'Overdue' ? 'red' : 
                    'blue'
                  }
                >
                  {selectedAssignment.status === 'submitted' ? 'Submitted' : getDaysRemaining(selectedAssignment.dueDate)}
                </Tag>
              </div>
            </div>
            
            <Divider />
            
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="whitespace-pre-line">{selectedAssignment.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="font-semibold mb-2">Due Date</h4>
                <p>{formatDate(selectedAssignment.dueDate)}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Points</h4>
                <p>{selectedAssignment.maxPoints} points possible</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Accepted File Types</h4>
                <p>{selectedAssignment.fileType}</p>
              </div>
            </div>
            
            <Divider />
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Submission Requirements</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Files must be in {selectedAssignment.fileType} format</li>
                <li>Maximum file size: 10MB</li>
                <li>{selectedAssignment.allowsMultipleFiles ? 'Multiple files allowed' : 'Only one file allowed'}</li>
                <li>Late submissions may be subject to penalty</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Grade Icon component
const GradeIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22l-3-1.5L6 22l-2-9.5L12 4l8 8.5L18 22l-3-1.5L12 22z" />
  </svg>
);

export default AssignmentManagement; 