import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, message, Badge, Divider, Spin, Modal } from 'antd';
import axios from 'axios';
import { useAuth } from '../lib/auth';
import { 
  BookOpen, 
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft
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

interface EnrolledCoursesSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const EnrolledCoursesSidebar: React.FC<EnrolledCoursesSidebarProps> = ({ isOpen, onToggle }) => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseDetailsVisible, setCourseDetailsVisible] = useState(false);
  const [courseDetail, setCourseDetail] = useState<Course | null>(null);
  const { token } = useAuth();

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.get(`${apiUrl}/api/enrollments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setEnrollments(response.data.data);
      } else {
        message.error('Failed to fetch enrollments');
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      message.error('Failed to fetch enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEnrollments();
    }
  }, [isOpen]);

  const handleShowDetails = (course: Course) => {
    setCourseDetail(course);
    setCourseDetailsVisible(true);
  };

  const columns = [
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
      title: 'Credits',
      dataIndex: ['course', 'credits'],
      key: 'credits',
      render: (credits: number) => (
        <Badge count={credits} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
  ];

  return (
    <div className={`fixed right-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${isOpen ? 'w-80' : 'w-0'}`}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Enrolled Courses</h2>
          <Button 
            type="text" 
            icon={isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />} 
            onClick={onToggle}
          />
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Spin size="large" />
            </div>
          ) : enrollments.length > 0 ? (
            <Table 
              dataSource={enrollments} 
              columns={columns} 
              rowKey="id"
              pagination={false}
              size="small"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <BookOpen size={40} className="mb-2" />
              <p>You are not enrolled in any courses yet</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
            </span>
            <Button 
              type="primary" 
              size="small"
              onClick={fetchEnrollments}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
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

export default EnrolledCoursesSidebar; 