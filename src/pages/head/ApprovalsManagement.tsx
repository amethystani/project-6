import React, { useState, useEffect } from 'react';
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

const ApprovalsManagement: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [courseApprovals, setCourseApprovals] = useState<CourseApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const [form] = Form.useForm();

  const fetchCourseApprovals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/department-head/course-approvals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourseApprovals(response.data.data);
    } catch (error) {
      console.error('Error fetching course approvals:', error);
      message.error('Failed to fetch course approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseApprovals();
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
      fetchCourseApprovals();
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

  const columns = [
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
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Course Approvals Management</h1>
        <Button type="primary" onClick={showModal}>
          Add New Course
        </Button>
      </div>

      <Table 
        dataSource={courseApprovals} 
        columns={columns} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Add New Course"
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

export default ApprovalsManagement; 