import React, { useState, useEffect } from 'react';
import { Button, Table, Tag, message, Modal, Input, Select, Badge, Divider, InputNumber } from 'antd';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { 
  BookOpen, 
  Filter,
  Search,
  Info,
  AlertCircle,
  CheckCircle,
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

const { Search: SearchInput } = Input;
const { Option } = Select;

const AvailableCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [creditsFilter, setCreditsFilter] = useState<number | null>(null);
  const [semesterFilter, setSemesterFilter] = useState<string>('');
  const [minCapacity, setMinCapacity] = useState<number | null>(null);
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null);
  const [courseDetailsVisible, setCourseDetailsVisible] = useState(false);
  const [courseDetail, setCourseDetail] = useState<Course | null>(null);
  const { token } = useAuth();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const params = new URLSearchParams();
      
      if (searchText) params.append('search', searchText);
      if (departmentFilter) params.append('department', departmentFilter);
      if (creditsFilter) params.append('credits', creditsFilter.toString());
      if (semesterFilter) params.append('semester', semesterFilter);
      if (minCapacity) params.append('min_capacity', minCapacity.toString());
      if (maxCapacity) params.append('max_capacity', maxCapacity.toString());
      params.append('is_active', 'true');
      
      const response = await axios.get(`${apiUrl}/api/courses?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.status === 'success') {
        setCourses(response.data.data);
      } else {
        message.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Failed to fetch available courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnrollClick = (course: Course) => {
    setSelectedCourse(course);
    setConfirmModalVisible(true);
  };

  const handleConfirmEnroll = async () => {
    if (!selectedCourse) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const response = await axios.post(
        `${apiUrl}/api/enrollments`,
        { course_id: selectedCourse.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        message.success('Successfully enrolled in the course');
        setConfirmModalVisible(false);
        // Refresh the courses list
        fetchCourses();
      } else {
        message.error('Failed to enroll in the course');
      }
    } catch (error: any) {
      console.error('Error enrolling in course:', error);
      console.log('Error response data:', error.response?.data);
      
      // Handle specific error responses
      if (error.response && error.response.data) {
        const { data } = error.response;
        
        if (data.message === 'Already enrolled in this course') {
          message.error('You are already enrolled in this course');
        } 
        // Check if the error is related to prerequisites and there are actual missing prerequisites
        else if (data.message === 'Missing prerequisites' && 
                data.details && 
                data.details.missing_prerequisites && 
                Array.isArray(data.details.missing_prerequisites) &&
                data.details.missing_prerequisites.length > 0) {
          
          // Display a more detailed error message with missing prerequisites
          Modal.error({
            title: 'Prerequisites Not Met',
            content: (
              <div>
                <p>You cannot enroll in this course because you haven't completed the required prerequisites:</p>
                <ul className="mt-2">
                  {data.details.missing_prerequisites.map((prereq: string) => (
                    <li key={prereq} className="ml-4 list-disc">{prereq}</li>
                  ))}
                </ul>
                <p className="mt-3 font-semibold">Please complete these courses before attempting to enroll.</p>
              </div>
            )
          });
        } else {
          // For any other error, just show the message
          message.error(data.message || 'Failed to enroll in the course');
        }
      } else {
        message.error('Failed to enroll in the course');
      }
      
      setConfirmModalVisible(false);
    }
  };

  const handleShowDetails = (course: Course) => {
    setCourseDetail(course);
    setCourseDetailsVisible(true);
  };

  const columns = [
    {
      title: 'Course Code',
      dataIndex: 'course_code',
      key: 'course_code',
      render: (text: string, record: Course) => (
        <a onClick={() => handleShowDetails(record)}>{text}</a>
      ),
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
      render: (department: string) => (
        <Tag color="blue">{department}</Tag>
      ),
    },
    {
      title: 'Credits',
      dataIndex: 'credits',
      key: 'credits',
      render: (credits: number) => (
        <Badge count={credits} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Prerequisites',
      dataIndex: 'prerequisites',
      key: 'prerequisites',
      render: (prerequisites: string) => prerequisites || 'None',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Course) => (
        <div className="flex space-x-2">
          <Button 
            type="primary"
            onClick={() => handleEnrollClick(record)}
          >
            Enroll
          </Button>
          <Button 
            type="default" 
            onClick={() => handleShowDetails(record)}
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
        <h1 className="text-3xl font-bold">Available Courses</h1>
      </div>
      
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <SearchInput
              placeholder="Search courses"
              style={{ width: 200 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onSearch={fetchCourses}
              prefix={<Search size={16} className="text-gray-400" />}
            />
            <Select
              placeholder="Department"
              style={{ width: 150 }}
              value={departmentFilter || undefined}
              onChange={value => setDepartmentFilter(value)}
              allowClear
              onClear={() => setDepartmentFilter('')}
            >
              <Option value="Computer Science">Computer Science</Option>
              <Option value="Mathematics">Mathematics</Option>
              <Option value="Physics">Physics</Option>
              <Option value="Chemistry">Chemistry</Option>
              <Option value="Biology">Biology</Option>
              <Option value="Engineering">Engineering</Option>
              <Option value="Business">Business</Option>
              <Option value="Arts">Arts</Option>
              <Option value="Humanities">Humanities</Option>
            </Select>
            <Select
              placeholder="Credits"
              style={{ width: 120 }}
              value={creditsFilter || undefined}
              onChange={value => setCreditsFilter(value)}
              allowClear
              onClear={() => setCreditsFilter(null)}
            >
              <Option value={2}>2 Credits</Option>
              <Option value={3}>3 Credits</Option>
              <Option value={4}>4 Credits</Option>
            </Select>
            <Select
              placeholder="Semester"
              style={{ width: 150 }}
              value={semesterFilter || undefined}
              onChange={value => setSemesterFilter(value)}
              allowClear
              onClear={() => setSemesterFilter('')}
            >
              <Option value="Fall 2023">Fall 2023</Option>
              <Option value="Spring 2024">Spring 2024</Option>
              <Option value="Summer 2024">Summer 2024</Option>
            </Select>
            <InputNumber
              placeholder="Min Capacity"
              style={{ width: 120 }}
              min={1}
              value={minCapacity}
              onChange={value => setMinCapacity(value)}
            />
            <InputNumber
              placeholder="Max Capacity"
              style={{ width: 120 }}
              min={1}
              value={maxCapacity}
              onChange={value => setMaxCapacity(value)}
            />
            <Button 
              type="primary" 
              icon={<Search size={16} />}
              onClick={fetchCourses}
            >
              Search
            </Button>
            <Button 
              type="default" 
              icon={<Filter size={16} />}
              onClick={() => {
                setSearchText('');
                setDepartmentFilter('');
                setCreditsFilter(null);
                setSemesterFilter('');
                setMinCapacity(null);
                setMaxCapacity(null);
                fetchCourses();
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        <Table 
          dataSource={courses} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
          locale={{ emptyText: "No courses match your search criteria" }}
        />
      </div>
      
      {/* Enrollment Confirmation Modal */}
      <Modal
        title="Confirm Enrollment"
        open={confirmModalVisible}
        onOk={handleConfirmEnroll}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Enroll"
        cancelText="Cancel"
      >
        <div>
          <p className="text-center mb-4">Are you sure you want to enroll in this course?</p>
          {selectedCourse && selectedCourse.prerequisites && selectedCourse.prerequisites.trim() !== '' && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle size={18} className="text-amber-500 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium">Prerequisites Check</p>
                  <p className="text-sm text-gray-600">
                    This course requires the following prerequisites: <span className="font-semibold">{selectedCourse.prerequisites}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    You will only be enrolled if you have already completed these requirements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
      
      {/* Course Details Modal */}
      <Modal
        title="Course Details"
        open={courseDetailsVisible}
        onCancel={() => setCourseDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setCourseDetailsVisible(false)}>
            Close
          </Button>,
          courseDetail && (
            <Button 
              key="enroll" 
              type="primary"
              onClick={() => {
                setCourseDetailsVisible(false);
                handleEnrollClick(courseDetail);
              }}
            >
              Enroll Now
            </Button>
          )
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

export default AvailableCourses; 