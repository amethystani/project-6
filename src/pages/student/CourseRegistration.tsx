import React, { useState, useEffect } from 'react';
import { Button, Card, Table, Tag, message, Tooltip, Modal } from 'antd';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { 
  BookOpen, 
  Clock, 
  User, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { token } = useAuth();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses?is_active=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Failed to fetch available courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    setEnrollmentLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(response.data.data);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      message.error('Failed to fetch your enrollments');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, [token]);

  const isEnrolled = (courseId: number) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setConfirmModalVisible(true);
  };

  const handleConfirmEnroll = async () => {
    if (!selectedCourse) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/enrollments`,
        { course_id: selectedCourse.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(`Successfully enrolled in ${selectedCourse.course_code}: ${selectedCourse.title}`);
      setConfirmModalVisible(false);
      fetchEnrollments();
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      message.error(error.response?.data?.message || 'Failed to enroll in course');
    }
  };

  const columns = [
    {
      title: 'Course Code',
      dataIndex: 'course_code',
      key: 'course_code',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
    },
    {
      title: 'Prerequisites',
      dataIndex: 'prerequisites',
      key: 'prerequisites',
      render: (prerequisites: string) => prerequisites || 'None',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (description: string) => (
        <Tooltip placement="topLeft" title={description}>
          {description || 'N/A'}
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Course) => {
        const enrolled = isEnrolled(record.id);
        return (
          <Button 
            type={enrolled ? "default" : "primary"}
            disabled={enrolled}
            onClick={() => !enrolled && handleEnrollClick(record)}
          >
            {enrolled ? "Enrolled" : "Enroll"}
          </Button>
        );
      },
    },
  ];

  const enrollmentColumns = [
    {
      title: 'Course Code',
      dataIndex: ['course', 'course_code'],
      key: 'course_code',
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
    },
    {
      title: 'Credits',
      dataIndex: ['course', 'credits'],
      key: 'credits',
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
        <Tag color={status === 'enrolled' ? 'green' : 'blue'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Course Registration</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My Enrollments</h2>
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
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Courses</h2>
        <Card>
          <Table 
            dataSource={courses} 
            columns={columns} 
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </div>
      
      <Modal
        title="Confirm Enrollment"
        open={confirmModalVisible}
        onOk={handleConfirmEnroll}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Enroll"
        cancelText="Cancel"
      >
        <p>Are you sure you want to enroll in:</p>
        {selectedCourse && (
          <p className="font-semibold">{selectedCourse.course_code}: {selectedCourse.title} ({selectedCourse.credits} credits)</p>
        )}
      </Modal>
    </div>
  );
};

export default CourseRegistration; 