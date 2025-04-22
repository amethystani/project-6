import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  X, 
  Check,
  Lock,
  UserPlus,
  UserX,
  UserCheck,
  Shield,
  Users,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../lib/auth';
import { Button, Table, Input, Select, Modal, Form, Dropdown, Menu, Tag, message, Tooltip, Space, Popconfirm, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

// Define types for users
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'department_head' | 'guest';
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
}

// Mock data for users
const mockUsersData: User[] = [
  {
    id: 'usr-001',
    name: 'John Smith',
    email: 'john.smith@example.edu',
    role: 'student',
    status: 'active',
    lastLogin: '2024-03-05T10:30:00',
    createdAt: '2023-09-01T08:00:00'
  },
  {
    id: 'usr-002',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.edu',
    role: 'faculty',
    status: 'active',
    lastLogin: '2024-03-04T14:45:00',
    createdAt: '2022-08-15T09:30:00'
  },
  {
    id: 'usr-003',
    name: 'Michael Davis',
    email: 'michael.davis@example.edu',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-03-06T09:15:00',
    createdAt: '2021-11-10T11:20:00'
  },
  {
    id: 'usr-004',
    name: 'Emily Chen',
    email: 'emily.chen@example.edu',
    role: 'department_head',
    status: 'active',
    lastLogin: '2024-03-03T16:20:00',
    createdAt: '2022-01-05T10:15:00'
  },
  {
    id: 'usr-005',
    name: 'Robert Wilson',
    email: 'robert.wilson@example.edu',
    role: 'student',
    status: 'inactive',
    lastLogin: '2024-02-20T11:10:00',
    createdAt: '2023-08-20T13:45:00'
  },
  {
    id: 'usr-006',
    name: 'Jennifer Lopez',
    email: 'jennifer.lopez@example.edu',
    role: 'faculty',
    status: 'active',
    lastLogin: '2024-03-05T08:40:00',
    createdAt: '2022-07-12T09:00:00'
  },
  {
    id: 'usr-007',
    name: 'David Brown',
    email: 'david.brown@example.edu',
    role: 'student',
    status: 'pending',
    lastLogin: '',
    createdAt: '2024-03-01T15:30:00'
  },
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsersData);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsersData);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // In a real app, we would fetch users from the backend
      // For now, we'll just use our mock data
      // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      // const response = await axios.get(`${apiUrl}/api/users`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setUsers(response.data.data);
      // setFilteredUsers(response.data.data);
      
      // For demo, just setting mock data with a delay to simulate loading
      setTimeout(() => {
        setUsers(mockUsersData);
        setFilteredUsers(mockUsersData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to fetch users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search text and selected filters
    let filtered = [...users];
    
    if (searchText) {
      filtered = filtered.filter(
        user => 
          user.name.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email.toLowerCase().includes(searchText.toLowerCase()) ||
          user.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }
    
    if (selectedStatus) {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }
    
    setFilteredUsers(filtered);
  }, [searchText, selectedRole, selectedStatus, users]);

  const showModal = (user: User | null = null) => {
    setEditingUser(user);
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      if (editingUser) {
        // Update existing user
        // In a real app, you would call the API to update the user
        const updatedUsers = users.map(user => 
          user.id === editingUser.id ? { ...user, ...values } : user
        );
        setUsers(updatedUsers);
        message.success('User updated successfully');
      } else {
        // Create new user
        // In a real app, you would call the API to create the user
        const newUser: User = {
          id: `usr-${String(users.length + 1).padStart(3, '0')}`,
          ...values,
          createdAt: new Date().toISOString(),
        };
        setUsers([...users, newUser]);
        message.success('User created successfully');
      }
      
      setIsModalVisible(false);
      setLoading(false);
    } catch (error) {
      console.error('Error saving user:', error);
      message.error('Failed to save user');
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      setLoading(true);
      // In a real app, you would call the API to delete the user
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      message.success('User deleted successfully');
      setLoading(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error('Failed to delete user');
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      setLoading(true);
      // In a real app, you would call the API to update the user status
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);
      message.success(`User status changed to ${newStatus}`);
      setLoading(false);
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error('Failed to update user status');
      setLoading(false);
    }
  };

  const handleResetPassword = (userId: string) => {
    message.success('Password reset link sent to the user');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge status="success" text="Active" />;
      case 'inactive':
        return <Badge status="error" text="Inactive" />;
      case 'pending':
        return <Badge status="warning" text="Pending" />;
      default:
        return <Badge status="default" text={status} />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Tag color="red">Admin</Tag>;
      case 'department_head':
        return <Tag color="purple">Department Head</Tag>;
      case 'faculty':
        return <Tag color="blue">Faculty</Tag>;
      case 'student':
        return <Tag color="green">Student</Tag>;
      case 'guest':
        return <Tag color="default">Guest</Tag>;
      default:
        return <Tag>{role}</Tag>;
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: (text) => <span className="font-mono text-xs">{text}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
            {text.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Department Head', value: 'department_head' },
        { text: 'Faculty', value: 'faculty' },
        { text: 'Student', value: 'student' },
        { text: 'Guest', value: 'guest' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => getRoleBadge(role),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      sorter: (a, b) => {
        if (!a.lastLogin) return 1;
        if (!b.lastLogin) return -1;
        return new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
      },
      render: (lastLogin) => 
        lastLogin 
          ? new Date(lastLogin).toLocaleString()
          : <span className="text-gray-400">Never</span>,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (createdAt) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<Edit size={16} />} 
              onClick={() => showModal(record)} 
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
          
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item 
                  key="edit" 
                  icon={<Edit size={16} />}
                  onClick={() => showModal(record)}
                >
                  Edit Details
                </Menu.Item>
                <Menu.Divider />
                {record.status === 'active' ? (
                  <Menu.Item 
                    key="deactivate" 
                    icon={<UserX size={16} />}
                    onClick={() => handleStatusChange(record.id, 'inactive')}
                  >
                    Deactivate User
                  </Menu.Item>
                ) : (
                  <Menu.Item 
                    key="activate" 
                    icon={<UserCheck size={16} />}
                    onClick={() => handleStatusChange(record.id, 'active')}
                  >
                    Activate User
                  </Menu.Item>
                )}
                <Menu.Item 
                  key="reset" 
                  icon={<Lock size={16} />}
                  onClick={() => handleResetPassword(record.id)}
                >
                  Reset Password
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                  key="delete" 
                  icon={<Trash2 size={16} />}
                  danger
                  onClick={() => handleDelete(record.id)}
                >
                  Delete User
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button 
              type="text" 
              icon={<MoreHorizontal size={16} />} 
              className="text-gray-500 hover:text-gray-700"
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Function to export users data as CSV
  const exportUsers = () => {
    try {
      // Convert users to CSV format
      const header = ['ID', 'Name', 'Email', 'Role', 'Status', 'Last Login', 'Created At'];
      const csvContent = filteredUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
        user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
        new Date(user.createdAt).toLocaleString()
      ]);
      
      // Add header row to CSV content
      const csvData = [header, ...csvContent];
      
      // Convert to CSV string with proper escaping
      const csvString = csvData.map(row => 
        row.map(cell => {
          // Convert cell to string and check if it contains special characters
          const cellStr = String(cell || '');
          // If cell contains commas, quotes, or newlines, wrap in quotes and escape existing quotes
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',')
      ).join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up by revoking the blob URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      message.success('Users exported successfully');
    } catch (error) {
      console.error('Error exporting users:', error);
      message.error('Failed to export users. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="mr-2 h-6 w-6 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>
        
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button
            type="primary"
            icon={<UserPlus size={16} className="mr-1" />}
            onClick={() => showModal()}
          >
            Add User
          </Button>
          <Button
            icon={<Download size={16} className="mr-1" />}
            onClick={exportUsers}
          >
            Export
          </Button>
          <Button
            icon={<RefreshCw size={16} className="mr-1" />}
            onClick={fetchUsers}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center w-full md:w-auto">
            <Input
              placeholder="Search users..."
              prefix={<Search className="h-4 w-4 text-gray-400" />}
              className="w-full md:w-64"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <Select
              placeholder="Filter by role"
              style={{ width: '100%', minWidth: '150px' }}
              allowClear
              onChange={(value) => setSelectedRole(value)}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'department_head', label: 'Department Head' },
                { value: 'faculty', label: 'Faculty' },
                { value: 'student', label: 'Student' },
                { value: 'guest', label: 'Guest' },
              ]}
            />
            
            <Select
              placeholder="Filter by status"
              style={{ width: '100%', minWidth: '150px' }}
              allowClear
              onChange={(value) => setSelectedStatus(value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
          </div>
        </div>
        
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </div>
      
      <Modal
        title={editingUser ? "Edit User" : "Add New User"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            {editingUser ? "Update" : "Create"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            status: 'active',
            role: 'student',
          }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter the user\'s name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter the user\'s email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="department_head">Department Head</Select.Option>
              <Select.Option value="faculty">Faculty</Select.Option>
              <Select.Option value="student">Student</Select.Option>
              <Select.Option value="guest">Guest</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
            </Select>
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              label="Password"
              extra="Password will be randomly generated and sent to the user's email"
            >
              <Input.Password disabled value="••••••••" />
            </Form.Item>
          )}
        </Form>
      </Modal>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-blue-500 font-medium text-sm mb-1">Total Users</div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-green-500 font-medium text-sm mb-1">Active Users</div>
          <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-yellow-500 font-medium text-sm mb-1">Pending Users</div>
          <div className="text-2xl font-bold">{users.filter(u => u.status === 'pending').length}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-red-500 font-medium text-sm mb-1">Inactive Users</div>
          <div className="text-2xl font-bold">{users.filter(u => u.status === 'inactive').length}</div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 