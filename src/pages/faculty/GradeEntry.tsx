import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Download, 
  Upload, 
  Save,
  CheckCircle,
  AlertCircle, 
  Users,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { 
  Table, 
  Input, 
  Button, 
  Select, 
  Tag, 
  Tabs, 
  Form, 
  InputNumber, 
  message, 
  Progress,
  Tooltip,
  Modal,
  Upload as AntUpload,
  Dropdown,
  Menu
} from 'antd';
import type { UploadProps } from 'antd';
import { useAuth } from '../../lib/auth';
import axios from 'axios';

const { Option } = Select;
const { TabPane } = Tabs;
const { Search: SearchInput } = Input;

// Mock student data
const mockStudents = [
  {
    id: 1,
    studentId: '20210001',
    name: 'John Smith',
    email: 'john.smith@university.edu',
    course: 'CS101',
    courseTitle: 'Introduction to Programming',
    assignment1: 85,
    assignment2: 90,
    midterm: 78,
    final: null,
    participation: 95,
    overallGrade: null,
    status: 'In Progress'
  },
  {
    id: 2,
    studentId: '20210022',
    name: 'Emily Johnson',
    email: 'emily.j@university.edu',
    course: 'CS101',
    courseTitle: 'Introduction to Programming',
    assignment1: 92,
    assignment2: 88,
    midterm: 95,
    final: null,
    participation: 100,
    overallGrade: null,
    status: 'In Progress'
  },
  {
    id: 3,
    studentId: '20210013',
    name: 'Michael Brown',
    email: 'michael.b@university.edu',
    course: 'CS101',
    courseTitle: 'Introduction to Programming',
    assignment1: 75,
    assignment2: 72,
    midterm: 68,
    final: null,
    participation: 85,
    overallGrade: null,
    status: 'At Risk'
  },
  {
    id: 4,
    studentId: '20210045',
    name: 'Sarah Davis',
    email: 'sarah.d@university.edu',
    course: 'CS305',
    courseTitle: 'Data Structures and Algorithms',
    assignment1: 95,
    assignment2: 98,
    midterm: 92,
    final: null,
    participation: 90,
    overallGrade: null,
    status: 'Excellent'
  },
  {
    id: 5,
    studentId: '20210036',
    name: 'David Wilson',
    email: 'david.w@university.edu',
    course: 'CS305',
    courseTitle: 'Data Structures and Algorithms',
    assignment1: 82,
    assignment2: 85,
    midterm: 80,
    final: null,
    participation: 88,
    overallGrade: null,
    status: 'Good'
  },
  {
    id: 6,
    studentId: '20210079',
    name: 'Jennifer Lee',
    email: 'jennifer.l@university.edu',
    course: 'CS305',
    courseTitle: 'Data Structures and Algorithms',
    assignment1: 80,
    assignment2: 76,
    midterm: 72,
    final: null,
    participation: 78,
    overallGrade: null,
    status: 'Needs Improvement'
  },
  {
    id: 7,
    studentId: '20210058',
    name: 'Robert Taylor',
    email: 'robert.t@university.edu',
    course: 'CS401',
    courseTitle: 'Advanced Database Systems',
    assignment1: 88,
    assignment2: 92,
    midterm: 90,
    final: null,
    participation: 85,
    overallGrade: null,
    status: 'Excellent'
  },
  {
    id: 8,
    studentId: '20210064',
    name: 'Jessica Miller',
    email: 'jessica.m@university.edu',
    course: 'CS401',
    courseTitle: 'Advanced Database Systems',
    assignment1: 79,
    assignment2: 81,
    midterm: 85,
    final: null,
    participation: 90,
    overallGrade: null,
    status: 'Good'
  }
];

// Mock course data
const mockCourses = [
  { id: 1, code: 'CS101', title: 'Introduction to Programming', students: 32, gradingScheme: 'Standard' },
  { id: 2, code: 'CS305', title: 'Data Structures and Algorithms', students: 28, gradingScheme: 'Weighted' },
  { id: 3, code: 'CS401', title: 'Advanced Database Systems', students: 22, gradingScheme: 'Custom' }
];

const GradeEntry = () => {
  const [students, setStudents] = useState(mockStudents);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('grades');
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [dataChanged, setDataChanged] = useState(false);
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [courses, setCourses] = useState(mockCourses);
  
  // Filter students based on search and selected course
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchText === '' || 
      student.name.toLowerCase().includes(searchText.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchText.toLowerCase());
    const matchesCourse = selectedCourse === null || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  // Handle cell editing
  const isEditing = (record: any) => record.id === editingKey;
  
  const edit = (record: any) => {
    form.setFieldsValue({
      ...record
    });
    setEditingKey(record.id);
  };
  
  const cancel = () => {
    setEditingKey(null);
  };
  
  const save = async (key: number) => {
    try {
      const row = await form.validateFields();
      
      // In a real application, this would make an API call to update the grade
      const newData = [...students];
      const index = newData.findIndex(item => key === item.id);
      
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setStudents(newData);
        setEditingKey(null);
        setDataChanged(true);
        message.success('Grade updated successfully');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  // Handle bulk save
  const handleBulkSave = () => {
    // In a real app, this would send all changes to the server
    setDataChanged(false);
    message.success('All grades have been saved to the system');
  };

  // Handle import
  const handleImport = () => {
    setImportModalVisible(true);
  };

  // Handle export
  const handleExport = () => {
    // In a real app, this would generate and download a CSV file
    message.success('Grades exported successfully');
  };

  // Calculate grade status
  const getGradeStatus = (record: any) => {
    // Simple calculation for demonstration
    const average = (record.assignment1 + record.assignment2 + record.midterm + (record.participation || 0)) / 4;
    
    if (average >= 90) return 'Excellent';
    if (average >= 80) return 'Good';
    if (average >= 70) return 'Satisfactory';
    return 'Needs Improvement';
  };

  // Upload props for import modal
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        setImportModalVisible(false);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };
  
  // Grade entry table columns
  const columns = [
    {
      title: 'Student ID',
      dataIndex: 'studentId',
      key: 'studentId',
      sorter: (a: any, b: any) => a.studentId.localeCompare(b.studentId),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      render: (text: string, record: any) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      filters: courses.map(course => ({ text: `${course.code}: ${course.title}`, value: course.code })),
      onFilter: (value: any, record: any) => record.course === value,
      render: (text: string, record: any) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500">{record.courseTitle}</div>
        </div>
      ),
    },
    {
      title: 'Assignment 1',
      dataIndex: 'assignment1',
      key: 'assignment1',
      sorter: (a: any, b: any) => (a.assignment1 || 0) - (b.assignment1 || 0),
      editable: true,
      render: (value: number | null) => value === null ? '-' : value,
    },
    {
      title: 'Assignment 2',
      dataIndex: 'assignment2',
      key: 'assignment2',
      sorter: (a: any, b: any) => (a.assignment2 || 0) - (b.assignment2 || 0),
      editable: true,
      render: (value: number | null) => value === null ? '-' : value,
    },
    {
      title: 'Midterm',
      dataIndex: 'midterm',
      key: 'midterm',
      sorter: (a: any, b: any) => (a.midterm || 0) - (b.midterm || 0),
      editable: true,
      render: (value: number | null) => value === null ? '-' : value,
    },
    {
      title: 'Final',
      dataIndex: 'final',
      key: 'final',
      sorter: (a: any, b: any) => {
        // Handle null values
        if (a.final === null && b.final === null) return 0;
        if (a.final === null) return -1;
        if (b.final === null) return 1;
        return a.final - b.final;
      },
      editable: true,
      render: (value: number | null) => value === null ? '-' : value,
    },
    {
      title: 'Participation',
      dataIndex: 'participation',
      key: 'participation',
      sorter: (a: any, b: any) => (a.participation || 0) - (b.participation || 0),
      editable: true,
      render: (value: number | null) => value === null ? '-' : value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Excellent', value: 'Excellent' },
        { text: 'Good', value: 'Good' },
        { text: 'Satisfactory', value: 'Satisfactory' },
        { text: 'Needs Improvement', value: 'Needs Improvement' },
        { text: 'At Risk', value: 'At Risk' },
        { text: 'In Progress', value: 'In Progress' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => {
        let color = 'default';
        switch (status) {
          case 'Excellent': color = 'green'; break;
          case 'Good': color = 'blue'; break;
          case 'Satisfactory': color = 'cyan'; break;
          case 'Needs Improvement': color = 'orange'; break;
          case 'At Risk': color = 'red'; break;
          case 'In Progress': color = 'purple'; break;
          default: color = 'default';
        }
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <div className="flex space-x-2">
            <Button onClick={() => save(record.id)} type="primary" size="small">
              Save
            </Button>
            <Button onClick={cancel} size="small">
              Cancel
            </Button>
          </div>
        ) : (
          <Button 
            disabled={editingKey !== null} 
            onClick={() => edit(record)}
            size="small"
          >
            Edit
          </Button>
        );
      },
    },
  ];

  // Convert columns for EditableCell
  const mergedColumns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: any) => ({
        record,
        inputType: col.dataIndex === 'studentId' ? 'text' : 'number',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  // EditableCell component
  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }: any) => {
    const inputNode = inputType === 'number' ? (
      <InputNumber min={0} max={100} />
    ) : (
      <Input />
    );
    
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src="/assets/logo/logo.jpg" alt="Logo" className="h-10 w-auto mr-3 rounded" />
          <h1 className="text-2xl font-bold flex items-center">
            <FileSpreadsheet className="mr-2 h-6 w-6 text-primary" />
            Grade Entry & Management
          </h1>
        </div>
        
        {dataChanged && (
          <Button type="primary" onClick={handleBulkSave}>
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        )}
      </div>
      
      <div className="bg-background border border-border rounded-lg p-4 md:p-6">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Grade Entry" key="grades">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div className="flex items-center space-x-4">
                <SearchInput 
                  placeholder="Search students by name or ID" 
                  onSearch={value => setSearchText(value)}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 250 }}
                  allowClear
                />
                
                <Select
                  placeholder="Filter by Course"
                  style={{ width: 200 }}
                  allowClear
                  onChange={(value) => setSelectedCourse(value)}
                >
                  {courses.map(course => (
                    <Option key={course.code} value={course.code}>
                      {course.code}: {course.title}
                    </Option>
                  ))}
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleImport}>
                  <Upload className="h-4 w-4 mr-1" />
                  Import Grades
                </Button>
                <Button onClick={handleExport}>
                  <Download className="h-4 w-4 mr-1" />
                  Export Grades
                </Button>
              </div>
            </div>
            
            <Form form={form} component={false}>
              <Table
                components={{
                  body: {
                    cell: EditableCell,
                  },
                }}
                bordered
                dataSource={filteredStudents}
                columns={mergedColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={loading}
                scroll={{ x: 'max-content' }}
              />
            </Form>
          </TabPane>
          
          <TabPane tab="Grade Statistics" key="statistics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {courses.map(course => (
                <div key={course.id} className="p-4 border rounded-lg">
                  <h3 className="text-lg font-medium flex items-center">
                    <Users className="h-5 w-5 mr-2 text-primary" />
                    {course.code}: {course.title}
                  </h3>
                  <div className="mt-2 space-y-3">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Class Average</span>
                        <span className="text-sm font-medium">82%</span>
                      </div>
                      <Progress percent={82} status="active" showInfo={false} />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Pass Rate</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress percent={92} status="success" showInfo={false} />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">At-Risk Students</span>
                        <span className="text-sm font-medium">8%</span>
                      </div>
                      <Progress percent={8} status="exception" showInfo={false} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Tag color="blue">{course.students} Students</Tag>
                    <Tag color="cyan">{course.gradingScheme} Grading</Tag>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-background border-b">
                <h3 className="text-lg font-medium">Grade Distribution</h3>
              </div>
              <div className="p-4">
                <div className="h-64 flex items-end justify-around">
                  {/* Placeholder for bar chart */}
                  <div className="w-1/6 bg-red-500 h-1/6 relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">F</span>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs">2%</span>
                  </div>
                  <div className="w-1/6 bg-orange-500 h-1/6 relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">D</span>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs">6%</span>
                  </div>
                  <div className="w-1/6 bg-yellow-500 h-2/6 relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">C</span>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs">20%</span>
                  </div>
                  <div className="w-1/6 bg-blue-500 h-4/6 relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">B</span>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs">42%</span>
                  </div>
                  <div className="w-1/6 bg-green-500 h-3/6 relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold">A</span>
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs">30%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
      
      {/* File Import Modal */}
      <Modal
        title="Import Grades"
        open={importModalVisible}
        onCancel={() => setImportModalVisible(false)}
        footer={null}
      >
        <div className="p-4">
          <p className="mb-4">Upload a CSV file with student grades. The file should have the following columns:</p>
          <p className="bg-gray-100 p-2 text-sm font-mono mb-4">
            Student ID, Name, Course, Assignment 1, Assignment 2, Midterm, Final, Participation
          </p>
          
          <AntUpload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <Upload className="h-8 w-8 mx-auto text-primary" />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single CSV or Excel file upload.
            </p>
          </AntUpload.Dragger>
          
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setImportModalVisible(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GradeEntry; 