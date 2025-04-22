import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  User, 
  Edit, 
  Trash2, 
  Plus, 
  Shield, 
  Database, 
  FileText, 
  Download, 
  RefreshCw,
  HardDrive,
  Activity,
  Clock,
  Filter
} from 'lucide-react';
import { Button, Table, Input, Select, DatePicker, Tag, Space, Card, Badge, Timeline, Radio, Row, Col, Tooltip, message, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '../../lib/auth';

// Define audit log event types
type EventType = 
  | 'login' 
  | 'logout' 
  | 'user_create' 
  | 'user_update' 
  | 'user_delete' 
  | 'course_create' 
  | 'course_update' 
  | 'course_delete' 
  | 'approval_create' 
  | 'approval_update' 
  | 'system';

// Define severity levels
type Severity = 'info' | 'warning' | 'error';

// Define audit log interface
interface AuditLog {
  id: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  event: EventType;
  details: string;
  ip_address: string;
  severity: Severity;
  resource_type?: string;
  resource_id?: string;
}

// Mock data for audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2024-03-15T09:30:00',
    user: {
      id: 'usr-003',
      name: 'Michael Davis',
      email: 'michael.davis@example.edu'
    },
    event: 'login',
    details: 'Admin user logged in',
    ip_address: '192.168.1.1',
    severity: 'info'
  },
  {
    id: 'log-002',
    timestamp: '2024-03-15T10:15:00',
    user: {
      id: 'usr-003',
      name: 'Michael Davis',
      email: 'michael.davis@example.edu'
    },
    event: 'user_create',
    details: 'Created new student user: John Doe',
    ip_address: '192.168.1.1',
    severity: 'info',
    resource_type: 'user',
    resource_id: 'usr-008'
  },
  {
    id: 'log-003',
    timestamp: '2024-03-15T10:30:00',
    user: {
      id: 'usr-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.edu'
    },
    event: 'login',
    details: 'Faculty user logged in',
    ip_address: '192.168.1.2',
    severity: 'info'
  },
  {
    id: 'log-004',
    timestamp: '2024-03-15T11:00:00',
    user: {
      id: 'usr-003',
      name: 'Michael Davis',
      email: 'michael.davis@example.edu'
    },
    event: 'course_create',
    details: 'Created new course: CS101 - Introduction to Programming',
    ip_address: '192.168.1.1',
    severity: 'info',
    resource_type: 'course',
    resource_id: 'crs-001'
  },
  {
    id: 'log-005',
    timestamp: '2024-03-15T11:45:00',
    user: null,
    event: 'system',
    details: 'Scheduled database backup failed',
    ip_address: 'localhost',
    severity: 'error'
  },
  {
    id: 'log-006',
    timestamp: '2024-03-15T12:30:00',
    user: {
      id: 'usr-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.edu'
    },
    event: 'logout',
    details: 'Faculty user logged out',
    ip_address: '192.168.1.2',
    severity: 'info'
  },
  {
    id: 'log-007',
    timestamp: '2024-03-15T13:15:00',
    user: {
      id: 'usr-003',
      name: 'Michael Davis',
      email: 'michael.davis@example.edu'
    },
    event: 'user_update',
    details: 'Updated user profile for: Emily Chen',
    ip_address: '192.168.1.1',
    severity: 'info',
    resource_type: 'user',
    resource_id: 'usr-004'
  },
  {
    id: 'log-008',
    timestamp: '2024-03-15T14:00:00',
    user: {
      id: 'usr-001',
      name: 'John Smith',
      email: 'john.smith@example.edu'
    },
    event: 'login',
    details: 'Failed login attempt. Incorrect password.',
    ip_address: '192.168.1.3',
    severity: 'warning'
  },
  {
    id: 'log-009',
    timestamp: '2024-03-15T14:30:00',
    user: {
      id: 'usr-001',
      name: 'John Smith',
      email: 'john.smith@example.edu'
    },
    event: 'login',
    details: 'Student user logged in',
    ip_address: '192.168.1.3',
    severity: 'info'
  },
  {
    id: 'log-010',
    timestamp: '2024-03-15T15:00:00',
    user: {
      id: 'usr-003',
      name: 'Michael Davis',
      email: 'michael.davis@example.edu'
    },
    event: 'approval_update',
    details: 'Approved course request: CS202 - Advanced Programming',
    ip_address: '192.168.1.1',
    severity: 'info',
    resource_type: 'approval',
    resource_id: 'apr-002'
  },
  {
    id: 'log-011',
    timestamp: '2024-03-15T15:45:00',
    user: null,
    event: 'system',
    details: 'System memory usage above 90%',
    ip_address: 'localhost',
    severity: 'warning'
  },
  {
    id: 'log-012',
    timestamp: '2024-03-15T16:30:00',
    user: {
      id: 'usr-003',
      name: 'Michael Davis',
      email: 'michael.davis@example.edu'
    },
    event: 'logout',
    details: 'Admin user logged out',
    ip_address: '192.168.1.1',
    severity: 'info'
  },
  {
    id: 'log-013',
    timestamp: '2024-03-16T09:00:00',
    user: null,
    event: 'system',
    details: 'Daily database backup completed successfully',
    ip_address: 'localhost',
    severity: 'info'
  },
  {
    id: 'log-014',
    timestamp: '2024-03-16T09:30:00',
    user: {
      id: 'usr-003',
      name: 'Michael Davis',
      email: 'michael.davis@example.edu'
    },
    event: 'login',
    details: 'Admin user logged in',
    ip_address: '192.168.1.1',
    severity: 'info'
  },
  {
    id: 'log-015',
    timestamp: '2024-03-16T10:15:00',
    user: {
      id: 'usr-003',
      name: 'Michael Davis',
      email: 'michael.davis@example.edu'
    },
    event: 'course_update',
    details: 'Updated course details: CS101 - Introduction to Programming',
    ip_address: '192.168.1.1',
    severity: 'info',
    resource_type: 'course',
    resource_id: 'crs-001'
  }
];

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [searchText, setSearchText] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const { token } = useAuth();
  const { RangePicker } = DatePicker;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // In a real app, we would fetch logs from the backend
      // For now, we'll just use our mock data
      // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      // const response = await axios.get(`${apiUrl}/api/audit-logs`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // setLogs(response.data.data);
      // setFilteredLogs(response.data.data);
      
      // For demo, just setting mock data with a delay to simulate loading
      setTimeout(() => {
        setLogs(mockAuditLogs);
        setFilteredLogs(mockAuditLogs);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      message.error('Failed to fetch audit logs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    // Filter logs based on search text and selected filters
    let filtered = [...logs];
    
    if (searchText) {
      filtered = filtered.filter(log => 
        (log.user?.name && log.user.name.toLowerCase().includes(searchText.toLowerCase())) ||
        (log.user?.email && log.user.email.toLowerCase().includes(searchText.toLowerCase())) ||
        log.details.toLowerCase().includes(searchText.toLowerCase()) ||
        log.ip_address.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (selectedEvent) {
      filtered = filtered.filter(log => log.event === selectedEvent);
    }
    
    if (selectedSeverity) {
      filtered = filtered.filter(log => log.severity === selectedSeverity);
    }
    
    if (selectedDateRange[0] && selectedDateRange[1]) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= selectedDateRange[0]! && logDate <= selectedDateRange[1]!;
      });
    }
    
    setFilteredLogs(filtered);
  }, [searchText, selectedEvent, selectedSeverity, selectedDateRange, logs]);

  const getEventIcon = (event: EventType) => {
    switch (event) {
      case 'login':
        return <LogIn size={16} className="text-green-500" />;
      case 'logout':
        return <LogOut size={16} className="text-blue-500" />;
      case 'user_create':
        return <User size={16} className="text-purple-500" />;
      case 'user_update':
        return <Edit size={16} className="text-orange-500" />;
      case 'user_delete':
        return <Trash2 size={16} className="text-red-500" />;
      case 'course_create':
        return <Plus size={16} className="text-purple-500" />;
      case 'course_update':
        return <Edit size={16} className="text-orange-500" />;
      case 'course_delete':
        return <Trash2 size={16} className="text-red-500" />;
      case 'approval_create':
        return <Shield size={16} className="text-yellow-500" />;
      case 'approval_update':
        return <Shield size={16} className="text-green-500" />;
      case 'system':
        return <Database size={16} className="text-blue-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  const getEventLabel = (event: EventType) => {
    return event.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getSeverityTag = (severity: Severity) => {
    switch (severity) {
      case 'info':
        return <Tag color="blue">Info</Tag>;
      case 'warning':
        return <Tag color="orange">Warning</Tag>;
      case 'error':
        return <Tag color="red">Error</Tag>;
      default:
        return <Tag>{severity}</Tag>;
    }
  };

  const columns: ColumnsType<AuditLog> = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      render: (timestamp) => {
        const date = new Date(timestamp);
        return (
          <Tooltip title={date.toLocaleString()}>
            <span>{date.toLocaleTimeString()} {date.toLocaleDateString()}</span>
          </Tooltip>
        );
      },
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user ? (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
      ) : <span className="text-gray-500">System</span>,
    },
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
      filters: [
        { text: 'Login', value: 'login' },
        { text: 'Logout', value: 'logout' },
        { text: 'User Create', value: 'user_create' },
        { text: 'User Update', value: 'user_update' },
        { text: 'User Delete', value: 'user_delete' },
        { text: 'Course Create', value: 'course_create' },
        { text: 'Course Update', value: 'course_update' },
        { text: 'Course Delete', value: 'course_delete' },
        { text: 'Approval Create', value: 'approval_create' },
        { text: 'Approval Update', value: 'approval_update' },
        { text: 'System', value: 'system' },
      ],
      onFilter: (value, record) => record.event === value,
      render: (event: EventType) => (
        <div className="flex items-center space-x-1">
          {getEventIcon(event)}
          <span>{getEventLabel(event)}</span>
        </div>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      render: (details, record) => (
        <div>
          <div>{details}</div>
          {record.resource_type && record.resource_id && (
            <div className="text-xs text-gray-500">
              Resource: {record.resource_type} ({record.resource_id})
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      render: (ip) => <span className="font-mono text-xs">{ip}</span>,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      filters: [
        { text: 'Info', value: 'info' },
        { text: 'Warning', value: 'warning' },
        { text: 'Error', value: 'error' },
      ],
      onFilter: (value, record) => record.severity === value,
      render: (severity: Severity) => getSeverityTag(severity),
    },
  ];

  const exportLogs = () => {
    try {
      // Convert logs to CSV format
      const header = ['ID', 'Timestamp', 'User Name', 'User Email', 'Event', 'Details', 'IP Address', 'Severity', 'Resource Type', 'Resource ID'];
      const csvContent = filteredLogs.map(log => [
        log.id,
        new Date(log.timestamp).toLocaleString(),
        log.user ? log.user.name : 'System',
        log.user ? log.user.email : '',
        getEventLabel(log.event),
        log.details,
        log.ip_address,
        log.severity,
        log.resource_type || '',
        log.resource_id || ''
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
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up by revoking the blob URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      message.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      message.error('Failed to export audit logs. Please try again.');
    }
  };

  const getTimelineColor = (severity: Severity) => {
    switch (severity) {
      case 'info':
        return 'blue';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Activity className="mr-2 h-6 w-6 text-primary" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and monitor all system activities
          </p>
        </div>
        
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="mr-2">
            <Radio.Button value="table">Table</Radio.Button>
            <Radio.Button value="timeline">Timeline</Radio.Button>
          </Radio.Group>
          
          <Button
            icon={<Download size={16} className="mr-1" />}
            onClick={exportLogs}
          >
            Export
          </Button>
          <Button
            icon={<RefreshCw size={16} className="mr-1" />}
            onClick={fetchLogs}
          >
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title={<div className="flex items-center"><AlertCircle className="h-4 w-4 mr-1 text-red-500" /> Error Events</div>}
            value={logs.filter(log => log.severity === 'error').length}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title={<div className="flex items-center"><AlertCircle className="h-4 w-4 mr-1 text-orange-500" /> Warning Events</div>}
            value={logs.filter(log => log.severity === 'warning').length}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title={<div className="flex items-center"><LogIn className="h-4 w-4 mr-1 text-green-500" /> Login Events</div>}
            value={logs.filter(log => log.event === 'login').length}
          />
        </Card>
        <Card bordered={false} className="shadow-sm">
          <Statistic
            title={<div className="flex items-center"><HardDrive className="h-4 w-4 mr-1 text-blue-500" /> System Events</div>}
            value={logs.filter(log => log.event === 'system').length}
          />
        </Card>
      </div>
      
      <div className="bg-white border rounded-lg overflow-hidden mb-6">
        <div className="p-4 border-b">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Input
                placeholder="Search logs..."
                prefix={<Search className="h-4 w-4 text-gray-400" />}
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} md={16}>
              <Space>
                <Select
                  placeholder="Event Type"
                  style={{ width: 180 }}
                  allowClear
                  onChange={(value) => setSelectedEvent(value)}
                  options={[
                    { value: 'login', label: 'Login' },
                    { value: 'logout', label: 'Logout' },
                    { value: 'user_create', label: 'User Create' },
                    { value: 'user_update', label: 'User Update' },
                    { value: 'user_delete', label: 'User Delete' },
                    { value: 'course_create', label: 'Course Create' },
                    { value: 'course_update', label: 'Course Update' },
                    { value: 'course_delete', label: 'Course Delete' },
                    { value: 'approval_create', label: 'Approval Create' },
                    { value: 'approval_update', label: 'Approval Update' },
                    { value: 'system', label: 'System' },
                  ]}
                />
                <Select
                  placeholder="Severity"
                  style={{ width: 180 }}
                  allowClear
                  onChange={(value) => setSelectedSeverity(value)}
                  options={[
                    { value: 'info', label: 'Info' },
                    { value: 'warning', label: 'Warning' },
                    { value: 'error', label: 'Error' },
                  ]}
                />
                <RangePicker
                  onChange={(dates) => {
                    if (dates) {
                      setSelectedDateRange([dates[0]?.toDate() || null, dates[1]?.toDate() || null]);
                    } else {
                      setSelectedDateRange([null, null]);
                    }
                  }}
                />
              </Space>
            </Col>
          </Row>
        </div>
        
        {viewMode === 'table' ? (
          <Table
            columns={columns}
            dataSource={filteredLogs}
            rowKey="id"
            loading={loading}
            pagination={{
              defaultPageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        ) : (
          <div className="p-4">
            <Timeline mode="left" className="mt-4">
              {filteredLogs.map((log) => (
                <Timeline.Item 
                  key={log.id} 
                  color={getTimelineColor(log.severity)}
                  label={
                    <div className="text-right">
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    </div>
                  }
                  dot={getEventIcon(log.event)}
                >
                  <Card bordered={false} className="mb-3 shadow-sm hover:shadow-md transition-shadow">
                    <div>
                      <div className="mb-2 font-medium flex justify-between">
                        <div className="flex items-center">
                          {getEventLabel(log.event)}
                          <span className="ml-2">{getSeverityTag(log.severity)}</span>
                        </div>
                        <span className="text-gray-500 text-xs font-mono">{log.ip_address}</span>
                      </div>
                      <p>{log.details}</p>
                      {log.resource_type && log.resource_id && (
                        <div className="text-xs text-gray-500 mt-1">
                          Resource: {log.resource_type} ({log.resource_id})
                        </div>
                      )}
                      {log.user && (
                        <div className="text-sm text-gray-500 mt-2">
                          <User size={14} className="inline mr-1" /> {log.user.name} ({log.user.email})
                        </div>
                      )}
                      {!log.user && (
                        <div className="text-sm text-gray-500 mt-2">
                          <Database size={14} className="inline mr-1" /> System Event
                        </div>
                      )}
                    </div>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs; 