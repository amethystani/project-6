import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  HardDrive, 
  Cpu, 
  BarChart3, 
  PieChart,
  Clock,
  Calendar,
  Users,
  Building,
  Laptop,
  Printer,
  Wifi,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { Card, Tabs, Select, Table, Tag, Button, Tooltip, message, Modal, Space, Input } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../../lib/auth';

// Define types for resources
interface Resource {
  id: string;
  name: string;
  type: 'server' | 'storage' | 'network' | 'classroom' | 'lab' | 'software' | 'hardware';
  status: 'available' | 'in-use' | 'maintenance' | 'reserved';
  capacity: number;
  utilization: number;
  location?: string;
  assignedTo?: string;
  lastUpdated: string;
}

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

// Mock data for resources
const resourcesData: Resource[] = [
  {
    id: 'res-001',
    name: 'Main Database Server',
    type: 'server',
    status: 'in-use',
    capacity: 100,
    utilization: 68,
    location: 'Data Center A',
    lastUpdated: '2024-03-06T10:30:00'
  },
  {
    id: 'res-002',
    name: 'Storage Array 1',
    type: 'storage',
    status: 'in-use',
    capacity: 20000,
    utilization: 45,
    location: 'Data Center A',
    lastUpdated: '2024-03-06T09:15:00'
  },
  {
    id: 'res-003',
    name: 'Web Application Server',
    type: 'server',
    status: 'in-use',
    capacity: 100,
    utilization: 82,
    location: 'Data Center B',
    lastUpdated: '2024-03-06T11:45:00'
  },
  {
    id: 'res-004',
    name: 'Backup Storage',
    type: 'storage',
    status: 'available',
    capacity: 50000,
    utilization: 30,
    location: 'Data Center B',
    lastUpdated: '2024-03-05T16:20:00'
  },
  {
    id: 'res-005',
    name: 'Core Network Switch',
    type: 'network',
    status: 'in-use',
    capacity: 10000,
    utilization: 55,
    location: 'Network Room',
    lastUpdated: '2024-03-06T08:30:00'
  },
  {
    id: 'res-006',
    name: 'Computer Lab 101',
    type: 'lab',
    status: 'in-use',
    capacity: 30,
    utilization: 90,
    location: 'Building A, Floor 1',
    assignedTo: 'CS Department',
    lastUpdated: '2024-03-06T09:00:00'
  },
  {
    id: 'res-007',
    name: 'Lecture Hall 305',
    type: 'classroom',
    status: 'reserved',
    capacity: 120,
    utilization: 0,
    location: 'Building B, Floor 3',
    assignedTo: 'Mathematics Department',
    lastUpdated: '2024-03-06T10:15:00'
  },
  {
    id: 'res-008',
    name: 'MATLAB License Pack',
    type: 'software',
    status: 'in-use',
    capacity: 50,
    utilization: 42,
    assignedTo: 'Engineering Department',
    lastUpdated: '2024-03-05T14:30:00'
  },
  {
    id: 'res-009',
    name: 'Research Workstations',
    type: 'hardware',
    status: 'in-use',
    capacity: 15,
    utilization: 80,
    location: 'Research Lab',
    assignedTo: 'Physics Department',
    lastUpdated: '2024-03-06T11:00:00'
  },
  {
    id: 'res-010',
    name: 'Wireless Access Points',
    type: 'network',
    status: 'maintenance',
    capacity: 200,
    utilization: 0,
    location: 'Campus-wide',
    lastUpdated: '2024-03-04T09:45:00'
  },
];

// Custom Flask icon component
const Flask = ({ className }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M9 3h6v3H9z"></path>
      <path d="M10 6v14a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V6"></path>
      <path d="M8.5 12.5L5 16"></path>
      <path d="M15.5 12.5L19 16"></path>
      <path d="M8 16h8"></path>
    </svg>
  );
};

const ResourceAllocation = () => {
  const [activeTabKey, setActiveTabKey] = useState<string>('1');
  const [courseApprovals, setCourseApprovals] = useState<CourseApproval[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>();
  const [currentApproval, setCurrentApproval] = useState<CourseApproval | null>(null);
  const [comment, setComment] = useState('');
  const { token } = useAuth();

  const fetchCourseApprovals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/course-approvals?status=${selectedStatus}`, {
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
    if (activeTabKey === '3') {
      fetchCourseApprovals();
    }
  }, [selectedStatus, activeTabKey, token]);

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  const showCommentModal = (approval: CourseApproval, type: 'approve' | 'reject') => {
    setCurrentApproval(approval);
    setActionType(type);
    setCommentModalVisible(true);
  };

  const handleCancel = () => {
    setCommentModalVisible(false);
    setComment('');
  };

  const handleAction = async () => {
    if (!currentApproval) return;

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/course-approvals/${currentApproval.id}`,
        {
          status: actionType === 'approve' ? 'approved' : 'rejected',
          comments: comment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      message.success(`Course ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setCommentModalVisible(false);
      setComment('');
      fetchCourseApprovals();
    } catch (error) {
      console.error('Error updating course approval:', error);
      message.error(`Failed to ${actionType} course`);
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

  const courseColumns = [
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
      title: 'Description',
      dataIndex: ['course', 'description'],
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
      title: 'Requested At',
      dataIndex: 'requested_at',
      key: 'requested_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CourseApproval) => {
        if (record.status !== 'pending') {
          return null;
        }
        return (
          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => showCommentModal(record, 'approve')}
            >
              Approve
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => showCommentModal(record, 'reject')}
            >
              Reject
            </Button>
          </Space>
        );
      },
    },
  ];

  const items = [
    {
      key: '1',
      label: 'General Resources',
      children: (
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl font-bold">Resource Allocation & Management</h1>
            
            <button 
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              <Plus className="h-4 w-4" />
              Add Resource
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center border rounded-md py-1 px-3">
                <span className="mr-2">Type:</span>
                <select 
                  className="bg-transparent border-none outline-none" 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="server">Servers</option>
                  <option value="storage">Storage</option>
                  <option value="network">Network</option>
                  <option value="classroom">Classrooms</option>
                  <option value="lab">Labs</option>
                  <option value="software">Software</option>
                  <option value="hardware">Hardware</option>
                </select>
              </div>
              
              <div className="flex items-center border rounded-md py-1 px-3">
                <span className="mr-2">Status:</span>
                <select 
                  className="bg-transparent border-none outline-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="border rounded-md pl-9 pr-3 py-2 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Server className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Servers</p>
                  <p className="text-2xl font-bold">
                    {resources.filter(r => r.type === 'server').length}
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ 
                    width: `${Math.round(
                      (resources.filter(r => r.type === 'server' && r.status === 'in-use').length / 
                      Math.max(1, resources.filter(r => r.type === 'server').length)) * 100
                    )}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {resources.filter(r => r.type === 'server' && r.status === 'in-use').length} in use
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <HardDrive className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Storage Capacity</p>
                  <p className="text-2xl font-bold">
                    {Math.round(resources
                      .filter(r => r.type === 'storage')
                      .reduce((acc, curr) => acc + curr.capacity, 0) / 1000)} TB
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-purple-500 rounded-full" 
                  style={{ 
                    width: `${Math.round(
                      (resources
                        .filter(r => r.type === 'storage')
                        .reduce((acc, curr) => acc + (curr.capacity * curr.utilization / 100), 0) /
                      Math.max(1, resources
                        .filter(r => r.type === 'storage')
                        .reduce((acc, curr) => acc + curr.capacity, 0))) * 100
                  )}%` 
                }}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Wifi className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Network Status</p>
                  <p className="text-2xl font-bold">
                    {resources.filter(r => r.type === 'network' && r.status !== 'maintenance').length}/{resources.filter(r => r.type === 'network').length}
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ 
                    width: `${Math.round(
                      (resources.filter(r => r.type === 'network' && r.status !== 'maintenance').length / 
                      Math.max(1, resources.filter(r => r.type === 'network').length)) * 100
                    )}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {resources.filter(r => r.type === 'network' && r.status === 'maintenance').length} in maintenance
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-lg bg-yellow-500/10">
                  <Building className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Physical Resources</p>
                  <p className="text-2xl font-bold">
                    {resources.filter(r => ['classroom', 'lab'].includes(r.type)).length}
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="h-full bg-yellow-500 rounded-full" 
                  style={{ 
                    width: `${Math.round(
                      (resources.filter(r => ['classroom', 'lab'].includes(r.type) && r.status === 'in-use').length / 
                      Math.max(1, resources.filter(r => ['classroom', 'lab'].includes(r.type)).length)) * 100
                    )}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {resources.filter(r => ['classroom', 'lab'].includes(r.type) && r.status === 'in-use').length} in use
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="py-3 px-4 text-left">Resource</th>
                    <th className="py-3 px-4 text-left">Type</th>
                    <th className="py-3 px-4 text-left">Location</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Utilization</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map(resource => (
                    <tr key={resource.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{resource.name}</p>
                          {resource.assignedTo && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Assigned to: {resource.assignedTo}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getResourceTypeIcon(resource.type)}
                          <span className="capitalize">{resource.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {resource.location || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(resource.status)}`}>
                          <span className="capitalize">{resource.status.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div 
                              className={`h-full rounded-full ${
                                resource.utilization > 80 ? 'bg-red-500' : 
                                resource.utilization > 60 ? 'bg-yellow-500' : 
                                'bg-green-500'
                              }`} 
                              style={{ width: `${resource.utilization}%` }}
                            ></div>
                          </div>
                          <span className="text-xs whitespace-nowrap">{resource.utilization}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Edit className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Trash2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'Financial Resources',
      children: (
        <div>
          {/* Financial resources content */}
        </div>
      ),
    },
    {
      key: '3',
      label: 'Course Approvals',
      children: (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Course Approval Requests</h2>
            <Select 
              value={selectedStatus} 
              onChange={handleStatusChange}
              style={{ width: 120 }}
            >
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
            </Select>
          </div>
          
          <Table 
            dataSource={courseApprovals} 
            columns={courseColumns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
          
          <Modal
            title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Course`}
            open={commentModalVisible}
            onOk={handleAction}
            onCancel={handleCancel}
            okText={actionType === 'approve' ? 'Approve' : 'Reject'}
            okButtonProps={{ 
              type: actionType === 'approve' ? 'primary' : 'primary',
              danger: actionType === 'reject'
            }}
          >
            <p>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this course?' 
                : 'Are you sure you want to reject this course?'}
            </p>
            <div className="mt-4">
              <label className="block mb-2">Comments (optional):</label>
              <Input.TextArea 
                rows={4} 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any comments about this decision..."
              />
            </div>
          </Modal>
        </div>
      ),
    },
  ];

  const onChange = (key: string) => {
    setActiveTabKey(key);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Resource Allocation</h1>
      <Card>
        <Tabs activeKey={activeTabKey} items={items} onChange={onChange} />
      </Card>
    </div>
  );
};

export default ResourceAllocation; 