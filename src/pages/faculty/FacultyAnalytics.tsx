import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Clock, 
  Book, 
  Award,
  FileText,
  CheckSquare,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Table, 
  Select, 
  DatePicker, 
  Button, 
  Tabs, 
  Tag,
  Rate,
  Tooltip 
} from 'antd';
import { useAuth } from '../../lib/auth';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

// Mock analytics data
const coursePerformanceData = [
  {
    id: 1,
    course: 'CS101',
    title: 'Introduction to Programming',
    students: 32,
    averageGrade: 82,
    passingRate: 94,
    attendanceRate: 88,
    participationRate: 76,
    improvementRate: 12,
    trend: 'up',
    semester: 'Fall 2023'
  },
  {
    id: 2,
    course: 'CS305',
    title: 'Data Structures and Algorithms',
    students: 28,
    averageGrade: 78,
    passingRate: 89,
    attendanceRate: 92,
    participationRate: 80,
    improvementRate: 8,
    trend: 'up',
    semester: 'Fall 2023'
  },
  {
    id: 3,
    course: 'CS401',
    title: 'Advanced Database Systems',
    students: 22,
    averageGrade: 80,
    passingRate: 91,
    attendanceRate: 85,
    participationRate: 72,
    improvementRate: 5,
    trend: 'down',
    semester: 'Fall 2023'
  },
  {
    id: 4,
    course: 'CS101',
    title: 'Introduction to Programming',
    students: 35,
    averageGrade: 79,
    passingRate: 91,
    attendanceRate: 86,
    participationRate: 74,
    improvementRate: 15,
    trend: 'up',
    semester: 'Spring 2023'
  },
  {
    id: 5,
    course: 'CS220',
    title: 'Web Development',
    students: 30,
    averageGrade: 85,
    passingRate: 97,
    attendanceRate: 90,
    participationRate: 82,
    improvementRate: 10,
    trend: 'up',
    semester: 'Spring 2023'
  }
];

const studentPerformanceTrendData = [
  { month: 'Sep', assignments: 85, exams: 78, participation: 90 },
  { month: 'Oct', assignments: 82, exams: 80, participation: 88 },
  { month: 'Nov', assignments: 88, exams: 83, participation: 92 },
  { month: 'Dec', assignments: 90, exams: 85, participation: 94 },
  { month: 'Jan', assignments: 92, exams: 88, participation: 93 },
];

const studentFeedbackData = [
  { 
    id: 1, 
    category: 'Teaching Quality', 
    score: 4.5, 
    previousScore: 4.3, 
    comments: 15, 
    sentiment: 'positive',
    trend: 'up' 
  },
  { 
    id: 2, 
    category: 'Course Materials', 
    score: 4.2, 
    previousScore: 4.1, 
    comments: 12, 
    sentiment: 'positive',
    trend: 'up' 
  },
  { 
    id: 3, 
    category: 'Accessibility', 
    score: 4.7, 
    previousScore: 4.5, 
    comments: 8, 
    sentiment: 'positive',
    trend: 'up' 
  },
  { 
    id: 4, 
    category: 'Grading Fairness', 
    score: 4.3, 
    previousScore: 4.4, 
    comments: 18, 
    sentiment: 'neutral',
    trend: 'down' 
  },
  { 
    id: 5, 
    category: 'Responsiveness', 
    score: 4.6, 
    previousScore: 4.2, 
    comments: 10, 
    sentiment: 'positive',
    trend: 'up' 
  }
];

const FacultyAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('Fall 2023');
  const [activeTab, setActiveTab] = useState('performance');
  const { token } = useAuth();

  // Filter data based on selection
  const filteredCourseData = coursePerformanceData.filter(course => {
    if (selectedCourse !== 'all' && course.course !== selectedCourse) return false;
    if (selectedSemester !== 'all' && course.semester !== selectedSemester) return false;
    return true;
  });

  // Calculate overall stats
  const overallStats = {
    totalStudents: filteredCourseData.reduce((sum, course) => sum + course.students, 0),
    averageGrade: filteredCourseData.reduce((sum, course) => sum + course.averageGrade, 0) / 
                 (filteredCourseData.length || 1),
    averagePassingRate: filteredCourseData.reduce((sum, course) => sum + course.passingRate, 0) / 
                       (filteredCourseData.length || 1),
    averageAttendance: filteredCourseData.reduce((sum, course) => sum + course.attendanceRate, 0) / 
                      (filteredCourseData.length || 1),
  };

  // Course performance table columns
  const columns = [
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      render: (text: string, record: any) => (
        <div>
          <div className="font-semibold">{text}</div>
          <div className="text-xs text-gray-500">{record.title}</div>
        </div>
      ),
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
      sorter: (a: any, b: any) => a.students - b.students,
    },
    {
      title: 'Average Grade',
      dataIndex: 'averageGrade',
      key: 'averageGrade',
      sorter: (a: any, b: any) => a.averageGrade - b.averageGrade,
      render: (grade: number) => (
        <div>
          <span className="mr-2">{grade}%</span>
          <Progress 
            percent={grade} 
            size="small" 
            status={grade >= 80 ? "success" : grade >= 70 ? "normal" : "exception"} 
            showInfo={false}
          />
        </div>
      ),
    },
    {
      title: 'Passing Rate',
      dataIndex: 'passingRate',
      key: 'passingRate',
      sorter: (a: any, b: any) => a.passingRate - b.passingRate,
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'Attendance',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      sorter: (a: any, b: any) => a.attendanceRate - b.attendanceRate,
      render: (rate: number) => `${rate}%`,
    },
    {
      title: 'Improvement',
      dataIndex: 'improvementRate',
      key: 'improvementRate',
      render: (rate: number, record: any) => (
        <span className={`flex items-center ${record.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          {record.trend === 'up' ? '+' : '-'}{rate}%
          {record.trend === 'up' ? 
            <TrendingUp className="ml-1 h-4 w-4" /> : 
            <TrendingUp className="ml-1 h-4 w-4 transform rotate-180" />}
        </span>
      ),
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      filters: [
        { text: 'Fall 2023', value: 'Fall 2023' },
        { text: 'Spring 2023', value: 'Spring 2023' },
      ],
      onFilter: (value: any, record: any) => record.semester === value,
    },
  ];

  // Student feedback table columns
  const feedbackColumns = [
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <div className="flex items-center">
          <span className="mr-2">{score}/5.0</span>
          <Rate disabled defaultValue={score} allowHalf />
        </div>
      ),
    },
    {
      title: 'vs. Previous',
      dataIndex: 'previousScore',
      key: 'previousScore',
      render: (prev: number, record: any) => {
        const diff = (record.score - prev).toFixed(1);
        return (
          <span className={`flex items-center ${record.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {record.trend === 'up' ? '+' : ''}{diff}
            {record.trend === 'up' ? 
              <TrendingUp className="ml-1 h-4 w-4" /> : 
              <TrendingUp className="ml-1 h-4 w-4 transform rotate-180" />}
          </span>
        );
      },
    },
    {
      title: 'Comments',
      dataIndex: 'comments',
      key: 'comments',
    },
    {
      title: 'Sentiment',
      dataIndex: 'sentiment',
      key: 'sentiment',
      render: (sentiment: string) => {
        let color = 'default';
        switch (sentiment) {
          case 'positive': color = 'green'; break;
          case 'neutral': color = 'blue'; break;
          case 'negative': color = 'red'; break;
          default: color = 'default';
        }
        return <Tag color={color}>{sentiment}</Tag>;
      },
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src="/assets/logo/logo.jpg" alt="Logo" className="h-10 w-auto mr-3 rounded" />
          <h1 className="text-2xl font-bold flex items-center">
            <BarChart2 className="mr-2 h-6 w-6 text-primary" />
            Faculty Analytics Dashboard
          </h1>
        </div>
        
        <div className="flex space-x-2">
          <Select
            defaultValue="Fall 2023"
            style={{ width: 140 }}
            onChange={value => setSelectedSemester(value)}
          >
            <Option value="all">All Semesters</Option>
            <Option value="Fall 2023">Fall 2023</Option>
            <Option value="Spring 2023">Spring 2023</Option>
          </Select>
          
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            onChange={value => setSelectedCourse(value)}
          >
            <Option value="all">All Courses</Option>
            <Option value="CS101">CS101 - Intro to Programming</Option>
            <Option value="CS305">CS305 - Data Structures</Option>
            <Option value="CS401">CS401 - Advanced Database</Option>
            <Option value="CS220">CS220 - Web Development</Option>
          </Select>
          
          <Button type="primary">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
        </div>
      </div>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Students"
              value={overallStats.totalStudents}
              prefix={<Users className="h-5 w-5 text-blue-500 mr-2" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Average Grade"
              value={overallStats.averageGrade.toFixed(1)}
              suffix="%"
              prefix={<Award className="h-5 w-5 text-green-500 mr-2" />}
              valueStyle={{ color: overallStats.averageGrade >= 80 ? '#52c41a' : overallStats.averageGrade >= 70 ? '#1890ff' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Passing Rate"
              value={overallStats.averagePassingRate.toFixed(1)}
              suffix="%"
              prefix={<CheckSquare className="h-5 w-5 text-purple-500 mr-2" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Attendance Rate"
              value={overallStats.averageAttendance.toFixed(1)}
              suffix="%"
              prefix={<Calendar className="h-5 w-5 text-orange-500 mr-2" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
      
      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="px-4 pt-4">
          <TabPane tab="Course Performance" key="performance">
            <div className="p-4">
              <Table 
                dataSource={filteredCourseData} 
                columns={columns} 
                rowKey="id"
                pagination={{ pageSize: 5 }}
                className="mb-8"
              />
              
              <div className="border rounded-lg p-4 mt-6">
                <h3 className="text-lg font-medium mb-4">Performance Trends</h3>
                <div className="h-60 flex items-end justify-around">
                  {studentPerformanceTrendData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center w-1/6">
                      <div className="flex items-end h-48 space-x-1">
                        <Tooltip title={`Assignments: ${item.assignments}%`}>
                          <div 
                            className="w-4 bg-blue-500 rounded-t"
                            style={{ height: `${item.assignments * 0.48}px` }}
                          ></div>
                        </Tooltip>
                        <Tooltip title={`Exams: ${item.exams}%`}>
                          <div 
                            className="w-4 bg-purple-500 rounded-t"
                            style={{ height: `${item.exams * 0.48}px` }}
                          ></div>
                        </Tooltip>
                        <Tooltip title={`Participation: ${item.participation}%`}>
                          <div 
                            className="w-4 bg-green-500 rounded-t"
                            style={{ height: `${item.participation * 0.48}px` }}
                          ></div>
                        </Tooltip>
                      </div>
                      <span className="mt-2 text-xs">{item.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-2 space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 mr-1"></div>
                    <span className="text-xs">Assignments</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 mr-1"></div>
                    <span className="text-xs">Exams</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 mr-1"></div>
                    <span className="text-xs">Participation</span>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
          
          <TabPane tab="Student Feedback" key="feedback">
            <div className="p-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-medium flex items-center mb-2">
                  <Award className="mr-2 h-5 w-5 text-blue-500" />
                  Overall Teaching Effectiveness
                </h3>
                <div className="flex items-center">
                  <div className="text-4xl font-bold text-blue-600 mr-4">4.5</div>
                  <div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <div className="text-sm text-gray-600">Based on 64 student reviews</div>
                  </div>
                  <div className="ml-auto">
                    <div className="text-green-500 font-semibold flex items-center">
                      <TrendingUp className="mr-1 h-4 w-4" />
                      +0.3 from last semester
                    </div>
                  </div>
                </div>
              </div>
              
              <Table 
                dataSource={studentFeedbackData} 
                columns={feedbackColumns} 
                rowKey="id"
                pagination={false}
                className="mb-6"
              />
              
              <div className="bg-gray-50 p-4 rounded-lg border mt-6">
                <h3 className="text-lg font-medium mb-2">Recent Comments from Students</h3>
                <div className="space-y-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between">
                      <div className="font-medium">CS101 Student</div>
                      <Tag color="green">Positive</Tag>
                    </div>
                    <p className="text-gray-600 mt-1">
                      "The professor was incredibly helpful during office hours. Always took the time to explain concepts thoroughly."
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between">
                      <div className="font-medium">CS305 Student</div>
                      <Tag color="blue">Neutral</Tag>
                    </div>
                    <p className="text-gray-600 mt-1">
                      "Course materials were well-organized, but some of the assignments could use clearer instructions."
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="flex justify-between">
                      <div className="font-medium">CS401 Student</div>
                      <Tag color="green">Positive</Tag>
                    </div>
                    <p className="text-gray-600 mt-1">
                      "The professor's real-world examples made complex database concepts much easier to understand."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default FacultyAnalytics; 