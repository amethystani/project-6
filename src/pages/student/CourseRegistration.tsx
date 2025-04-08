import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, message, Tooltip, Modal, Badge, Divider, Row, Col, Statistic, Spin } from 'antd';
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

  const fetchEnrollments = async () => {
    setEnrollmentLoading(true);
    try {
      // In a real implementation, replace this with actual API call
      // const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/enrollments`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // Mock data
      const mockEnrollments = [
        {
          id: 1,
          student_id: 1,
          course_id: 1,
          enrollment_date: '2024-01-15',
          status: 'active',
          course: {
            id: 1,
            course_code: 'CS101',
            title: 'Introduction to Computer Science',
            description: 'An introductory course to computer science fundamentals',
            credits: 3,
            department: 'Computer Science',
            prerequisites: '',
            capacity: 30,
            is_active: true,
            created_at: '2024-01-01',
            created_by: 1
          }
        },
        {
          id: 2,
          student_id: 1,
          course_id: 2,
          enrollment_date: '2024-01-15',
          status: 'active',
          course: {
            id: 2,
            course_code: 'MATH201',
            title: 'Linear Algebra',
            description: 'Study of linear equations and their applications',
            credits: 4,
            department: 'Mathematics',
            prerequisites: 'MATH101',
            capacity: 25,
            is_active: true,
            created_at: '2024-01-01',
            created_by: 1
          }
        }
      ];
      
      setEnrollments(mockEnrollments);
      setTotalCredits(mockEnrollments.reduce((sum, enrollment) => sum + enrollment.course.credits, 0));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      message.error('Failed to fetch enrollments');
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