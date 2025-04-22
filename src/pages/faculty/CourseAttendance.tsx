import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Select, 
  DatePicker, 
  Tabs, 
  Tag, 
  Input, 
  Modal, 
  Form, 
  Radio, 
  Space, 
  Upload, 
  message, 
  Spin, 
  Divider, 
  Tooltip,
  Typography,
  Alert,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  UserOutlined, 
  FileExcelOutlined, 
  DownloadOutlined, 
  UploadOutlined, 
  SearchOutlined, 
  PlusOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import { DownloadTableExcel } from 'react-export-table-to-excel';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Define AttendanceStatus type
type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Define attendance record interface
interface AttendanceRecord {
  id: number;
  student_id: number;
  student: {
    id: number;
    student_id: string;
    program: string;
    year_level: number;
    user_id: number;
  };
  date: string;
  status: AttendanceStatus;
  remarks: string | null;
}

// Student interface
interface Student {
  id: number;
  user_id: number;
  student_id: string;
  name: string;
  email: string;
  program: string;
  year_level: number;
  group: string;
  profile_picture: string;
  attendance_rate?: number;
}

// Define Attendance Report interface
interface AttendanceReport {
  student: {
    id: number;
    student_id: string;
    program: string;
    year_level: number;
    user_id: number;
  };
  total_days: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number;
  detailed_records: AttendanceRecord[];
}

// Mock API calls
const fetchStudentsForCourse = async (courseId: number): Promise<Student[]> => {
  // In a real application, this would be an API call
  return [
    {
      id: 1,
      user_id: 101,
      student_id: "STU001",
      name: "John Doe",
      email: "john.doe@example.com",
      program: "Computer Science",
      year_level: 3,
      group: "A",
      profile_picture: "https://xsgames.co/randomusers/avatar.php?g=male&s=1",
      attendance_rate: 95
    },
    {
      id: 2,
      user_id: 102,
      student_id: "STU002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      program: "Computer Science",
      year_level: 3,
      group: "A",
      profile_picture: "https://xsgames.co/randomusers/avatar.php?g=female&s=2",
      attendance_rate: 100
    },
    {
      id: 3,
      user_id: 103,
      student_id: "STU003",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      program: "Information Technology",
      year_level: 3,
      group: "B",
      profile_picture: "https://xsgames.co/randomusers/avatar.php?g=male&s=3",
      attendance_rate: 88
    },
    {
      id: 4,
      user_id: 104,
      student_id: "STU004",
      name: "Emily Chen",
      email: "emily.chen@example.com",
      program: "Computer Science",
      year_level: 2,
      group: "A",
      profile_picture: "https://xsgames.co/randomusers/avatar.php?g=female&s=4",
      attendance_rate: 92
    },
    {
      id: 5,
      user_id: 105,
      student_id: "STU005",
      name: "Michael Rodriguez",
      email: "michael.rodriguez@example.com",
      program: "Information Technology",
      year_level: 2,
      group: "B",
      profile_picture: "https://xsgames.co/randomusers/avatar.php?g=male&s=5",
      attendance_rate: 85
    }
  ];
};

// Mock data for attendance records
const fetchAttendanceRecords = async (courseId: number): Promise<AttendanceRecord[]> => {
  // In a real application, this would be an API call
  return [
    {
      id: 1,
      student_id: 1,
      student: {
        id: 1,
        user_id: 101,
        student_id: "STU001",
        program: "Computer Science",
        year_level: 3
      },
      date: "2024-04-01",
      status: "present",
      remarks: null
    },
    {
      id: 2,
      student_id: 2,
      student: {
        id: 2,
        user_id: 102,
        student_id: "STU002",
        program: "Computer Science",
        year_level: 3
      },
      date: "2024-04-01",
      status: "present",
      remarks: null
    },
    {
      id: 3,
      student_id: 3,
      student: {
        id: 3,
        user_id: 103,
        student_id: "STU003",
        program: "Information Technology",
        year_level: 3
      },
      date: "2024-04-01",
      status: "absent",
      remarks: "Sick leave"
    },
    {
      id: 4,
      student_id: 1,
      student: {
        id: 1,
        user_id: 101,
        student_id: "STU001",
        program: "Computer Science",
        year_level: 3
      },
      date: "2024-04-02",
      status: "present",
      remarks: null
    },
    {
      id: 5,
      student_id: 2,
      student: {
        id: 2,
        user_id: 102,
        student_id: "STU002",
        program: "Computer Science",
        year_level: 3
      },
      date: "2024-04-02",
      status: "late",
      remarks: "15 minutes late"
    }
  ];
};

// Mock function for getting attendance report
const fetchAttendanceReport = async (courseId: number): Promise<{
  attendance_dates: string[],
  student_reports: AttendanceReport[]
}> => {
  // In a real application, this would be an API call
  return {
    attendance_dates: ["2024-04-01", "2024-04-02", "2024-04-03", "2024-04-04"],
    student_reports: [
      {
        student: {
          id: 1,
          user_id: 101,
          student_id: "STU001",
          program: "Computer Science",
          year_level: 3
        },
        total_days: 4,
        present_count: 4,
        absent_count: 0,
        late_count: 0,
        excused_count: 0,
        attendance_rate: 100,
        detailed_records: []
      },
      {
        student: {
          id: 2,
          user_id: 102,
          student_id: "STU002",
          program: "Computer Science",
          year_level: 3
        },
        total_days: 4,
        present_count: 3,
        absent_count: 0,
        late_count: 1,
        excused_count: 0,
        attendance_rate: 95,
        detailed_records: []
      },
      {
        student: {
          id: 3,
          user_id: 103,
          student_id: "STU003",
          program: "Information Technology",
          year_level: 3
        },
        total_days: 4,
        present_count: 2,
        absent_count: 1,
        late_count: 0,
        excused_count: 1,
        attendance_rate: 75,
        detailed_records: []
      }
    ]
  };
};

const CourseAttendance = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [recordsForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('records');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [isManualEntryModalVisible, setIsManualEntryModalVisible] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
  const tableRef = React.useRef(null);

  // Initialize data
  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    if (!courseId) return;
    
    setLoading(true);
    
    try {
      // In a real application, these would be API calls with proper error handling
      const studentsData = await fetchStudentsForCourse(Number(courseId));
      const recordsData = await fetchAttendanceRecords(Number(courseId));
      
      setStudents(studentsData);
      setAttendanceRecords(recordsData);
    } catch (error) {
      message.error('Failed to load attendance data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load attendance report
  const loadAttendanceReport = async () => {
    if (!courseId) return;
    
    setLoading(true);
    
    try {
      const reportData = await fetchAttendanceReport(Number(courseId));
      setAttendanceReport(reportData);
    } catch (error) {
      message.error('Failed to load attendance report');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    if (key === 'reports' && !attendanceReport) {
      loadAttendanceReport();
    }
  };

  // Upload props for CSV import
  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.csv',
    customRequest: ({ file, onSuccess }) => {
      // In a real application, this would be an API call to upload the file
      setTimeout(() => {
        message.success(`${(file as File).name} file uploaded successfully`);
        onSuccess?.(file);
      }, 1000);
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        // After successful upload, reload the attendance records
        loadData();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  // Function to handle attendance status tag color
  const getStatusTag = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Tag icon={<CheckCircleOutlined />} color="success">Present</Tag>;
      case 'absent':
        return <Tag icon={<CloseCircleOutlined />} color="error">Absent</Tag>;
      case 'late':
        return <Tag icon={<ClockCircleOutlined />} color="warning">Late</Tag>;
      case 'excused':
        return <Tag icon={<MedicineBoxOutlined />} color="processing">Excused</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  // Function to show manual attendance entry modal
  const showManualEntryModal = () => {
    setSelectedDate(dayjs());
    setIsManualEntryModalVisible(true);
    recordsForm.resetFields();
    
    // Pre-populate form with students
    const initialValues = {
      date: dayjs(),
      records: students.map(student => ({
        student_id: student.student_id,
        name: student.name,
        status: 'present'
      }))
    };
    
    recordsForm.setFieldsValue(initialValues);
  };

  // Function to handle manual attendance submission
  const handleManualSubmit = async (values: any) => {
    setSubmitLoading(true);
    
    try {
      // In a real application, this would be an API call
      console.log('Submitting attendance:', values);
      
      message.success('Attendance recorded successfully');
      setIsManualEntryModalVisible(false);
      loadData(); // Reload data after submission
    } catch (error) {
      message.error('Failed to record attendance');
      console.error(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter records based on search text and date filter
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = 
      record.student.student_id.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesDate = 
      !dateFilter ||
      (dayjs(record.date).isAfter(dateFilter[0].startOf('day')) && 
       dayjs(record.date).isBefore(dateFilter[1].endOf('day')));
    
    return matchesSearch && matchesDate;
  });

  // Get attendance summary statistics
  const getAttendanceSummary = () => {
    if (!attendanceRecords.length) return { total: 0, present: 0, absent: 0, late: 0, excused: 0 };
    
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter(r => r.status === 'present').length;
    const absent = attendanceRecords.filter(r => r.status === 'absent').length;
    const late = attendanceRecords.filter(r => r.status === 'late').length;
    const excused = attendanceRecords.filter(r => r.status === 'excused').length;
    
    return { total, present, absent, late, excused };
  };

  // Example CSV template for download
  const downloadCsvTemplate = () => {
    const csvContent = "student_id,date,status,remarks\nSTU001,2024-04-01,present,\nSTU002,2024-04-01,absent,Sick leave\nSTU003,2024-04-01,late,15 minutes late";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'attendance_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      sorter: (a: AttendanceRecord, b: AttendanceRecord) => dayjs(a.date).unix() - dayjs(b.date).unix()
    },
    {
      title: 'Student ID',
      dataIndex: ['student', 'student_id'],
      key: 'student_id',
    },
    {
      title: 'Program',
      dataIndex: ['student', 'program'],
      key: 'program',
    },
    {
      title: 'Year Level',
      dataIndex: ['student', 'year_level'],
      key: 'year_level',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AttendanceStatus) => getStatusTag(status),
      filters: [
        { text: 'Present', value: 'present' },
        { text: 'Absent', value: 'absent' },
        { text: 'Late', value: 'late' },
        { text: 'Excused', value: 'excused' },
      ],
      onFilter: (value: any, record: AttendanceRecord) => record.status === value,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      render: (remarks: string | null) => remarks || '-',
    },
  ];

  const reportColumns = [
    {
      title: 'Student ID',
      dataIndex: ['student', 'student_id'],
      key: 'student_id',
    },
    {
      title: 'Program',
      dataIndex: ['student', 'program'],
      key: 'program',
    },
    {
      title: 'Year',
      dataIndex: ['student', 'year_level'],
      key: 'year_level',
    },
    {
      title: 'Present',
      dataIndex: 'present_count',
      key: 'present_count',
    },
    {
      title: 'Absent',
      dataIndex: 'absent_count',
      key: 'absent_count',
    },
    {
      title: 'Late',
      dataIndex: 'late_count',
      key: 'late_count',
    },
    {
      title: 'Excused',
      dataIndex: 'excused_count',
      key: 'excused_count',
    },
    {
      title: 'Attendance Rate',
      dataIndex: 'attendance_rate',
      key: 'attendance_rate',
      render: (rate: number) => `${rate}%`,
      sorter: (a: AttendanceReport, b: AttendanceReport) => a.attendance_rate - b.attendance_rate,
    }
  ];

  const summary = getAttendanceSummary();

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <Title level={2}>Course Attendance</Title>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showManualEntryModal}
          >
            Take Attendance
          </Button>
          
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Import CSV</Button>
          </Upload>
          
          <Button 
            icon={<DownloadOutlined />}
            onClick={downloadCsvTemplate}
          >
            Template
          </Button>
          
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => setExportModalVisible(true)}
          >
            Export
          </Button>
        </div>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Attendance Records" key="records">
            <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4">
              <Input
                placeholder="Search by student ID"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                style={{ width: 200 }}
              />
              
              <RangePicker
                value={dateFilter}
                onChange={(dates) => setDateFilter(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                format="YYYY-MM-DD"
              />
            </div>
            
            <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <Statistic
                  title="Total Records"
                  value={summary.total}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Present"
                  value={summary.present}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Absent"
                  value={summary.absent}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Late"
                  value={summary.late}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
              <Card>
                <Statistic
                  title="Excused"
                  value={summary.excused}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </div>
            
            <Table
              columns={columns}
              dataSource={filteredRecords}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </TabPane>
          
          <TabPane tab="Attendance Reports" key="reports">
            {loading ? (
              <div className="text-center py-4">
                <Spin size="large" />
              </div>
            ) : attendanceReport ? (
              <div>
                <div className="mb-4">
                  <Alert
                    message="Attendance Report"
                    description={`This report covers ${attendanceReport.attendance_dates.length} class days.`}
                    type="info"
                    showIcon
                  />
                </div>
                
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <Statistic
                      title="Total Class Days"
                      value={attendanceReport.attendance_dates.length}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                  <Card>
                    <Statistic
                      title="Students"
                      value={attendanceReport.student_reports.length}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                  <Card>
                    <Statistic
                      title="Average Attendance Rate"
                      value={attendanceReport.student_reports.reduce((sum: number, student: AttendanceReport) => sum + student.attendance_rate, 0) / 
                             (attendanceReport.student_reports.length || 1)}
                      valueStyle={{ color: '#722ed1' }}
                      suffix="%"
                      precision={1}
                    />
                  </Card>
                </div>
                
                <div ref={tableRef}>
                  <Table
                    columns={reportColumns}
                    dataSource={attendanceReport.student_reports}
                    rowKey={(record) => record.student.id}
                    pagination={false}
                  />
                </div>
                
                <div className="mt-4 text-right">
                  <DownloadTableExcel
                    filename="attendance_report"
                    sheet="attendance"
                    currentTableRef={tableRef.current}
                  >
                    <Button icon={<FileExcelOutlined />} type="primary">
                      Download Excel Report
                    </Button>
                  </DownloadTableExcel>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <p className="mt-2 text-gray-400">No report data available</p>
                <Button 
                  type="primary" 
                  onClick={loadAttendanceReport}
                  className="mt-4"
                >
                  Generate Report
                </Button>
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* Manual Attendance Entry Modal */}
      <Modal
        title="Record Attendance"
        open={isManualEntryModalVisible}
        onCancel={() => setIsManualEntryModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={recordsForm}
          layout="vertical"
          onFinish={handleManualSubmit}
        >
          <Form.Item
            name="date"
            label="Attendance Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
              onChange={(date) => setSelectedDate(date as dayjs.Dayjs)}
            />
          </Form.Item>
          
          <div className="mb-4">
            <Text strong>Class Roster</Text>
            <div className="text-gray-500 text-sm">
              Mark attendance status for each student
            </div>
          </div>
          
          <Form.List name="records">
            {(fields) => (
              <div className="overflow-y-auto max-h-[400px] border rounded-md p-2">
                {fields.map((field, index) => (
                  <div key={field.key} className="border-b last:border-b-0 py-3">
                    <div className="flex items-center mb-2">
                      <UserOutlined className="mr-2" />
                      <Form.Item
                        {...field}
                        name={[field.name, 'name']}
                        noStyle
                      >
                        <Input disabled style={{ width: 150 }} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'student_id']}
                        noStyle
                      >
                        <Input disabled className="ml-2" style={{ width: 100 }} />
                      </Form.Item>
                    </div>
                    
                    <div className="ml-6 flex flex-wrap gap-2 items-center">
                      <Form.Item
                        {...field}
                        name={[field.name, 'status']}
                        noStyle
                      >
                        <Radio.Group>
                          <Radio value="present">Present</Radio>
                          <Radio value="absent">Absent</Radio>
                          <Radio value="late">Late</Radio>
                          <Radio value="excused">Excused</Radio>
                        </Radio.Group>
                      </Form.Item>
                      
                      <Form.Item
                        {...field}
                        name={[field.name, 'remarks']}
                        noStyle
                      >
                        <Input placeholder="Remarks (optional)" style={{ width: 200 }} />
                      </Form.Item>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form.List>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button onClick={() => setIsManualEntryModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={submitLoading}>
              Submit Attendance
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Export Modal */}
      <Modal
        title="Export Attendance Data"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Date Range" name="date_range">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item label="Export Format" name="format" initialValue="excel">
            <Radio.Group>
              <Radio value="excel">Excel (.xlsx)</Radio>
              <Radio value="csv">CSV (.csv)</Radio>
              <Radio value="pdf">PDF (.pdf)</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item label="Include Details" name="include_details" initialValue={true}>
            <Radio.Group>
              <Radio value={true}>Detailed Report</Radio>
              <Radio value={false}>Summary Only</Radio>
            </Radio.Group>
          </Form.Item>
          
          <div className="flex justify-end gap-2">
            <Button onClick={() => setExportModalVisible(false)}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={() => {
                message.success('Export started. File will be downloaded shortly.');
                setExportModalVisible(false);
              }}
            >
              Export
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseAttendance; 