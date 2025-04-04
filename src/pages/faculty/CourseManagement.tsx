import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Calendar, 
  Users, 
  FileText, 
  Bell, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button, Form, Input, Modal, Select, Table, Tag, InputNumber, message } from 'antd';
import axios from 'axios';
import { useAuth } from '../../lib/auth';

const { Option } = Select;
const { TextArea } = Input;

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

interface CourseApproval {
  id: number;
  course_id: number;
  course: Course;
  requested_by: number;
  approved_by: number | null;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  requested_at: string;
  updated_at: string;
}

const CourseManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseApprovals, setCourseApprovals] = useState<CourseApproval[]>([]);
  const [facultyCourses, setFacultyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const [form] = Form.useForm();

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // Here we would get all courses assigned to this faculty member
      // For now, we'll use a mock empty array
      setFacultyCourses([]);
      
      // Get course requests made by this faculty
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/department-head/course-approvals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourseApprovals(response.data.data);
    } catch (error) {
      console.error('Error fetching course data:', error);
      message.error('Failed to fetch course data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [token]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/courses`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Course created successfully and is pending approval');
      setIsModalVisible(false);
      form.resetFields();
      fetchCourseData();
    } catch (error) {
      console.error('Error creating course:', error);
      message.error('Failed to create course');
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">Pending</Tag>;
      case 'approved':
        return <Tag color="green">Approved</Tag>;
      case 'rejected':
        return <Tag color="red">Rejected</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const requestColumns = [
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
    },
    {
      title: 'Requested At',
      dataIndex: 'requested_at',
      key: 'requested_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <Button 
          type="primary" 
          onClick={showModal}
          icon={<Plus size={16} />}
        >
          Request New Course
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
        {facultyCourses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No courses assigned yet.</p>
          </div>
        ) : (
          <Table 
            dataSource={facultyCourses}
            // Add course table columns here
            loading={loading}
            rowKey="id"
          />
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Course Requests</h2>
        {courseApprovals.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No course requests made yet.</p>
          </div>
        ) : (
          <Table 
            dataSource={courseApprovals} 
            columns={requestColumns} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        )}
      </div>

      <Modal
        title="Request New Course"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="course_code"
              label="Course Code"
              rules={[{ required: true, message: 'Please enter course code' }]}
            >
              <Input placeholder="e.g., CS101" />
            </Form.Item>

            <Form.Item
              name="title"
              label="Course Title"
              rules={[{ required: true, message: 'Please enter course title' }]}
            >
              <Input placeholder="e.g., Introduction to Programming" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Course description..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: 'Please select department' }]}
            >
              <Select placeholder="Select department">
                <Option value="Computer Science">Computer Science</Option>
                <Option value="Mathematics">Mathematics</Option>
                <Option value="Physics">Physics</Option>
                <Option value="Chemistry">Chemistry</Option>
                <Option value="Biology">Biology</Option>
                <Option value="Engineering">Engineering</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="credits"
              label="Credits"
              rules={[{ required: true, message: 'Please enter credits' }]}
            >
              <InputNumber min={1} max={6} placeholder="3" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="prerequisites"
              label="Prerequisites"
            >
              <Input placeholder="e.g., CS101, MATH101" />
            </Form.Item>

            <Form.Item
              name="capacity"
              label="Capacity"
              initialValue={30}
            >
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <div className="flex justify-end">
            <Button htmlType="button" onClick={handleCancel} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit for Approval
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement; 