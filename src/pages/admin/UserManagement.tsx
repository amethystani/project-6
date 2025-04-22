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
  first_name: string;
  last_name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'department_head' | 'guest';
  status: 'active' | 'inactive' | 'pending'; // Status is now stored client-side only
  lastLogin?: string;
  createdAt: string;
}

// Mock data for initial loading state or fallback
const mockUsersData: User[] = [
  {
    id: 'usr-001',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.edu',
    role: 'student',
    status: 'active',
    lastLogin: '2024-03-05T10:30:00',
    createdAt: '2023-09-01T08:00:00'
  },
  {
    id: 'usr-002',
    first_name: 'Sarah',
    last_name: 'Johnson',
    email: 'sarah.johnson@example.edu',
    role: 'faculty',
    status: 'active',
    lastLogin: '2024-03-04T14:45:00',
    createdAt: '2022-08-15T09:30:00'
  },
  {
    id: 'usr-003',
    first_name: 'Michael',
    last_name: 'Davis',
    email: 'michael.davis@example.edu',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-03-06T09:15:00',
    createdAt: '2021-11-10T11:20:00'
  },
  {
    id: 'usr-004',
    first_name: 'Emily',
    last_name: 'Chen',
    email: 'emily.chen@example.edu',
    role: 'department_head',
    status: 'active',
    lastLogin: '2024-03-03T16:20:00',
    createdAt: '2022-01-05T10:15:00'
  },
  {
    id: 'usr-005',
    first_name: 'Robert',
    last_name: 'Wilson',
    email: 'robert.wilson@example.edu',
    role: 'student',
    status: 'inactive',
    lastLogin: '2024-02-20T11:10:00',
    createdAt: '2023-08-20T13:45:00'
  },
  {
    id: 'usr-006',
    first_name: 'Jennifer',
    last_name: 'Lopez',
    email: 'jennifer.lopez@example.edu',
    role: 'faculty',
    status: 'active',
    lastLogin: '2024-03-05T08:40:00',
    createdAt: '2022-07-12T09:00:00'
  },
  {
    id: 'usr-007',
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.brown@example.edu',
    role: 'student',
    status: 'pending',
    lastLogin: '',
    createdAt: '2024-03-01T15:30:00'
  }
];

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);
  const [forceMockData, setForceMockData] = useState(false);
  const { token } = useAuth();
  const apiUrl = 'http://localhost:5001';

  const verifyValidToken = () => {
    if (!token) return false;
    try {
      // Basic check if token is a valid JWT format
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Check if token is expired (decode middle part which contains exp claim)
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) return false;
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Make API call to fetch users
      console.log('Fetching users from:', `${apiUrl}/api/users/`);
      
      if (!token) {
        message.error('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${apiUrl}/api/users/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        withCredentials: false  // Keep withCredentials false for CORS
      });
      
      if (response.data && response.data.success && response.data.users) {
        // Transform users from backend format to frontend format
        const transformedUsers = response.data.users.map((user: any) => ({
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          status: 'active', // Default all users to active since database doesn't store this
          lastLogin: user.last_login,
          createdAt: user.created_at
        }));
        
        // Restore status values from localStorage if available
        const savedStatuses = localStorage.getItem('userStatuses');
        if (savedStatuses) {
          const statusMap = JSON.parse(savedStatuses);
          transformedUsers.forEach((user: User) => {
            if (statusMap[user.id]) {
              user.status = statusMap[user.id];
            }
          });
        }
        
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        message.success(`Successfully loaded ${transformedUsers.length} users`);
      } else {
        message.error('Failed to load users: Unexpected API response format');
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      
      let errorMessage = 'Unknown error';
      if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to backend server. Make sure it is running at http://localhost:5001';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view users.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(`Failed to fetch users: ${errorMessage}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    // Filter users based on search text and selected filters
    let filtered = [...users];
    
    if (searchText) {
      filtered = filtered.filter(
        user => 
          `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchText.toLowerCase()) ||
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
        first_name: user.first_name,
        last_name: user.last_name,
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

  // Create a function to create mock users (for development/testing)
  const createMockUser = (id: string, firstName: string, lastName: string, email: string, role: string, status: string) => {
    return {
      id,
      first_name: firstName,
      last_name: lastName,
      email,
      role: role as User['role'],
      status: status as User['status'],
      createdAt: new Date().toISOString(),
      lastLogin: undefined
    } as User;
  };

  // Modify handleFormSubmit to handle creating a user when the backend is not available
  const handleFormSubmit = async (values: any) => {
    try {
      setLoading(true);
      
      if (editingUser) {
        // Update existing user
        const response = await axios.put(
          `${apiUrl}/api/users/${editingUser.id}`,
          values,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (response.data && response.data.success) {
          // Update local state with the updated user
          const updatedUser = response.data.user;
          const updatedUsers = users.map(user => 
            user.id === editingUser.id ? { 
              ...user, 
              first_name: updatedUser.first_name,
              last_name: updatedUser.last_name,
              email: updatedUser.email,
              role: updatedUser.role,
              status: updatedUser.status
            } : user
          );
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers);
          message.success('User updated successfully');
        } else {
          message.error('Failed to update user: ' + (response.data?.message || 'Unknown error'));
        }
      } else {
        // Create new user
        const response = await axios.post(
          `${apiUrl}/api/users/`,
          values,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (response.data && response.data.success) {
          // Format new user for local state
          const newUser = response.data.user;
          const formattedUser: User = {
            id: newUser.id.toString(),
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status || 'active',
            createdAt: newUser.created_at || new Date().toISOString(),
            lastLogin: newUser.last_login
          };
          
          setUsers(prevUsers => [...prevUsers, formattedUser]);
          setFilteredUsers(prevUsers => {
            // Only add to filtered users if it passes current filters
            if (selectedRole && formattedUser.role !== selectedRole) return prevUsers;
            if (selectedStatus && formattedUser.status !== selectedStatus) return prevUsers;
            if (searchText && 
                !`${formattedUser.first_name} ${formattedUser.last_name}`.toLowerCase().includes(searchText.toLowerCase()) && 
                !formattedUser.email.toLowerCase().includes(searchText.toLowerCase()))
              return prevUsers;
            
            return [...prevUsers, formattedUser];
          });
          
          message.success('User created successfully');
          // Display temporary password if provided
          if (response.data.temporary_password) {
            Modal.info({
              title: 'User Created',
              content: (
                <div>
                  <p>User has been created successfully. Please share the following with the user:</p>
                  <p><strong>Temporary Password:</strong> {response.data.temporary_password}</p>
                  <p><strong>Access Code:</strong> {response.data.access_code}</p>
                </div>
              ),
            });
          }
        } else {
          message.error('Failed to create user: ' + (response.data?.message || 'Unknown error'));
        }
      }
      
      setIsModalVisible(false);
      setLoading(false);
    } catch (error: any) {
      console.error('Error saving user:', error);
      
      let errorMessage = 'Unknown error';
      if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to backend server';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(`Failed to save user: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `${apiUrl}/api/users/${userId}`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.data && response.data.success) {
        // Remove deleted user from local state
        const updatedUsers = users.filter(user => user.id !== userId);
        setUsers(updatedUsers);
        setFilteredUsers(filteredUsers.filter(user => user.id !== userId));
        message.success('User deleted successfully');
      } else {
        message.error('Failed to delete user: ' + (response.data?.message || 'Unknown error'));
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      let errorMessage = 'Unknown error';
      if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to backend server';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(`Failed to delete user: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      setLoading(true);
      
      // Instead of calling the API, we'll just update local state
      // Update user status in local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      );
      setUsers(updatedUsers);
      setFilteredUsers(filteredUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      // Save status to localStorage for persistence
      const savedStatuses = localStorage.getItem('userStatuses') || '{}';
      const statusMap = JSON.parse(savedStatuses);
      statusMap[userId] = newStatus;
      localStorage.setItem('userStatuses', JSON.stringify(statusMap));
      
      message.success(`User status changed to ${newStatus}`);
      setLoading(false);
    } catch (error: any) {
      console.error('Error updating user status:', error);
      
      let errorMessage = 'Unknown error';
      if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to backend server';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(`Failed to update user status: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${apiUrl}/api/users/${userId}/reset-password`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.data && response.data.success) {
        message.success('Password reset successfully');
        
        // Display the temporary password in a modal
        if (response.data.temporary_password) {
          Modal.info({
            title: 'Password Reset',
            content: (
              <div>
                <p>Password has been reset successfully. Please share the following with the user:</p>
                <p><strong>Temporary Password:</strong> {response.data.temporary_password}</p>
                <p><strong>Access Code:</strong> {response.data.access_code}</p>
              </div>
            ),
          });
        }
      } else {
        message.error('Failed to reset password: ' + (response.data?.message || 'Unknown error'));
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      
      let errorMessage = 'Unknown error';
      if (error.message === 'Network Error') {
        errorMessage = 'Cannot connect to backend server';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(`Failed to reset password: ${errorMessage}`);
      setLoading(false);
    }
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
      key: 'name',
      sorter: (a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`),
      render: (_, record) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2">
            {record.first_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{record.first_name} {record.last_name}</div>
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
      const header = ['ID', 'First Name', 'Last Name', 'Email', 'Role', 'Status', 'Last Login', 'Created At'];
      const csvContent = filteredUsers.map(user => [
        user.id,
        user.first_name,
        user.last_name,
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
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="flex flex-wrap gap-2">
            <Button 
              type="primary"
              icon={<RefreshCw size={16} className="mr-1" />}
              onClick={fetchUsers}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={() => showModal()}
            >
              Add User
            </Button>
            <Tooltip title="Export users to CSV">
              <Button
                icon={<Download size={16} />}
                onClick={exportUsers}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Import users from CSV">
              <Button
                icon={<Upload size={16} />}
                onClick={() => {/* TODO: Implement import */}}
                disabled
              >
                Import
              </Button>
            </Tooltip>
          </div>
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
            name="first_name"
            label="First Name"
            rules={[{ required: true, message: 'Please enter the user\'s first name' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="last_name"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter the user\'s last name' }]}
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