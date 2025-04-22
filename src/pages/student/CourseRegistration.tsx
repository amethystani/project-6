import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, message, Tooltip, Modal, Badge, Divider, Row, Col, Statistic, Spin, Popconfirm } from 'antd';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CreditCard, 
  Info, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: number;
  course_code: string;
  title: string;
  description: string;
  credits: number;
  department: string;
  prerequisites: string;
  capacity: number;
  is_active: boolean;
  created_at: string;
  created_by: number;
}

interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  enrollment_date: string;
  status: string;
  course: Course;
}

const CourseRegistration: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [courseDetailsVisible, setCourseDetailsVisible] = useState(false);
  const [courseDetail, setCourseDetail] = useState<Course | null>(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const { token } = useAuth();
  const [droppingCourseId, setDroppingCourseId] = useState<number | null>(null);

  const fetchEnrollments = async () => {
    setEnrollmentLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      // Get fresh token from localStorage to ensure it's current
      const freshToken = localStorage.getItem('token');
      
      if (!freshToken) {
        message.error('You must be logged in to view your enrollments');
        setEnrollments([]);
        setTotalCredits(0);
        return;
      }
      
      const response = await axios.get(`${apiUrl}/api/enrollments/`, {
        headers: { 
          Authorization: `Bearer ${freshToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status === 'success') {
        const enrollmentsData = response.data.data || [];
        console.log('Fetched enrollments:', enrollmentsData);
        
        // Process enrollments data to ensure it has the expected structure
        const processedEnrollments = enrollmentsData.map((enrollment: any) => {
          // Check if course is already an object or just an ID
          if (typeof enrollment.course === 'object' && enrollment.course !== null) {
            return enrollment;
          } else {
            // If we only have course_id but not the course object, create a placeholder
            return {
              ...enrollment,
              course: {
                id: enrollment.course_id,
                course_code: enrollment.course_code || `Course ${enrollment.course_id}`,
                title: enrollment.course_name || `Unknown Course ${enrollment.course_id}`,
                description: 'Loading course details...',
                credits: enrollment.credits || 0,
                department: enrollment.department || 'Unknown',
                prerequisites: '',
                capacity: 0,
                is_active: true,
                created_at: enrollment.enrollment_date || new Date().toISOString(),
                created_by: 0
              }
            };
          }
        });
        
        setEnrollments(processedEnrollments);
        setTotalCredits(processedEnrollments.reduce((sum: number, enrollment: Enrollment) => {
          const credits = enrollment.course?.credits || 0;
          return sum + credits;
        }, 0));
      } else {
        message.error('Failed to fetch enrollments');
        setEnrollments([]);
        setTotalCredits(0);
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      message.error('Failed to fetch enrollments');
      setEnrollments([]);
      setTotalCredits(0);
    } finally {
      setEnrollmentLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const handleShowDetails = (course: Course) => {
    setCourseDetail(course);
    setCourseDetailsVisible(true);
  };

  const handleDropCourse = async (courseId: number) => {
    setDroppingCourseId(courseId);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const freshToken = localStorage.getItem('token');
      
      if (!freshToken) {
        message.error('You must be logged in to drop courses');
        return;
      }
      
      const response = await axios.delete(`${apiUrl}/api/enrollments/${courseId}`, {
        headers: { 
          Authorization: `Bearer ${freshToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.status === 'success') {
        message.success('Successfully dropped the course');
        // Refresh the enrollments list
        fetchEnrollments();
      } else {
        message.error('Failed to drop the course');
      }
    } catch (error) {
      console.error('Error dropping course:', error);
      message.error('Failed to drop the course');
    } finally {
      setDroppingCourseId(null);
    }
  };

  const enrollmentColumns = [
    {
      title: 'Course Code',
      dataIndex: ['course', 'course_code'],
      key: 'course_code',
      render: (text: string, record: Enrollment) => (
        <a onClick={() => handleShowDetails(record.course)}>{text}</a>
      ),
    },
    {
      title: 'Title',
      dataIndex: ['course', 'title'],
      key: 'title',
    },
    {
      title: 'Department',
      dataIndex: ['course', 'department'],
      key: 'department',
      render: (department: string) => (
        <Tag color="blue">{department}</Tag>
      ),
    },
    {
      title: 'Credits',
      dataIndex: ['course', 'credits'],
      key: 'credits',
      render: (credits: number) => (
        <Badge count={credits} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Enrollment Date',
      dataIndex: 'enrollment_date',
      key: 'enrollment_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Enrollment) => (
        <div className="flex space-x-2">
          <Popconfirm
            title="Drop this course?"
            description="Are you sure you want to drop this course? This action cannot be undone."
            onConfirm={() => handleDropCourse(record.course_id)}
            okText="Yes, Drop Course"
            cancelText="Cancel"
          >
            <Button 
              type="default" 
              danger
              icon={<Trash2 size={16} />}
              loading={droppingCourseId === record.course_id}
            >
              Drop
            </Button>
          </Popconfirm>
          <Button 
            type="default" 
            onClick={() => handleShowDetails(record.course)}
            icon={<Info size={16} />}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Registration</h1>
      </div>
      
      {/* Current registration summary */}
      <div className="mb-8 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold mb-1">Your Registration Summary</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Currently enrolled in {enrollments.length} course{enrollments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-white dark:bg-gray-800 py-2 px-6 rounded-full shadow-sm">
            <span className="text-gray-600 dark:text-gray-400 mr-2">Total Credits:</span>
            <span className="text-xl font-bold text-primary">{totalCredits}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Enrollments</h2>
          <div className="flex items-center gap-2">
            <Link to="/dashboard/available-courses">
              <Button type="primary" icon={<BookOpen size={16} />}>
                Browse Available Courses
              </Button>
            </Link>
            <Button 
              type="default" 
              icon={<Clock size={16} />}
              onClick={fetchEnrollments}
              loading={enrollmentLoading}
            >
              Refresh
            </Button>
          </div>
        </div>
        <Card>
          <Table 
            dataSource={enrollments} 
            columns={enrollmentColumns} 
            rowKey="id"
            loading={enrollmentLoading}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: "You're not enrolled in any courses yet" }}
          />
        </Card>
      </div>
      
      {/* Course Details Modal */}
      <Modal
        title="Course Details"
        open={courseDetailsVisible}
        onCancel={() => setCourseDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCourseDetailsVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {courseDetail && (
          <div className="py-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{courseDetail.course_code}</h3>
                <h4 className="text-xl">{courseDetail.title}</h4>
              </div>
              <div className="flex flex-col items-end">
                <Badge count={courseDetail.credits} style={{ backgroundColor: '#52c41a' }} />
                <Tag color="blue" className="mt-2">{courseDetail.department}</Tag>
              </div>
            </div>
            
            <Divider />
            
            <div className="mb-4">
              <h5 className="font-semibold mb-2">Description</h5>
              <p>{courseDetail.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold mb-2">Prerequisites</h5>
                <p>{courseDetail.prerequisites || 'None'}</p>
              </div>
              <div>
                <h5 className="font-semibold mb-2">Class Capacity</h5>
                <p>{courseDetail.capacity} students</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseRegistration; 