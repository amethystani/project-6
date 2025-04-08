import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Users, 
  MapPin,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Link as LinkIcon
} from 'lucide-react';
import { Button, Card, Select, Tag, Divider, Badge } from 'antd';
import { useAuth } from '../../lib/auth';
import axios from 'axios';

// Mock data for schedule
const mockScheduleData = [
  {
    id: 1,
    courseCode: 'CS101',
    title: 'Introduction to Programming',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Room 201',
    studentsCount: 32,
    type: 'Lecture',
    color: 'blue'
  },
  {
    id: 2,
    courseCode: 'CS101',
    title: 'Introduction to Programming',
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Room 201',
    studentsCount: 32,
    type: 'Lecture',
    color: 'blue'
  },
  {
    id: 3,
    courseCode: 'CS305',
    title: 'Data Structures and Algorithms',
    day: 'Tuesday',
    startTime: '13:00',
    endTime: '14:30',
    location: 'Room 105',
    studentsCount: 28,
    type: 'Lecture',
    color: 'green'
  },
  {
    id: 4,
    courseCode: 'CS305',
    title: 'Data Structures and Algorithms',
    day: 'Thursday',
    startTime: '13:00',
    endTime: '14:30',
    location: 'Room 105',
    studentsCount: 28,
    type: 'Lecture',
    color: 'green'
  },
  {
    id: 5,
    courseCode: 'CS305',
    title: 'Data Structures and Algorithms',
    day: 'Friday',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Lab 302',
    studentsCount: 28,
    type: 'Lab',
    color: 'green'
  },
  {
    id: 6,
    courseCode: 'CS401',
    title: 'Advanced Database Systems',
    day: 'Monday',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Room 405',
    studentsCount: 22,
    type: 'Lecture',
    color: 'purple'
  },
  {
    id: 7,
    courseCode: 'CS401',
    title: 'Advanced Database Systems',
    day: 'Wednesday',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Room 405',
    studentsCount: 22,
    type: 'Lecture',
    color: 'purple'
  },
  {
    id: 8,
    courseCode: 'CS401',
    title: 'Advanced Database Systems',
    day: 'Thursday',
    startTime: '16:00',
    endTime: '18:00',
    location: 'Lab 303',
    studentsCount: 22,
    type: 'Lab',
    color: 'purple'
  }
];

const dayOrder = {
  'Monday': 0,
  'Tuesday': 1,
  'Wednesday': 2,
  'Thursday': 3,
  'Friday': 4,
  'Saturday': 5,
  'Sunday': 6
};

// Handle custom sorting for weekdays
const sortByDay = (a, b) => {
  return dayOrder[a.day] - dayOrder[b.day];
};

// Handle time formatting
const formatTime = (time) => {
  return time;
};

const Schedule = () => {
  const [activeView, setActiveView] = useState('weekly');
  const [selectedTerm, setSelectedTerm] = useState('Spring 2024');
  const [selectedDay, setSelectedDay] = useState('All Days');
  const [loading, setLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState(mockScheduleData);
  const { token } = useAuth();

  // Filter schedule based on selected day
  const filteredSchedule = selectedDay === 'All Days' 
    ? scheduleData 
    : scheduleData.filter(item => item.day === selectedDay);

  // Group classes by day for weekly view
  const groupedByDay = filteredSchedule.reduce((acc, item) => {
    if (!acc[item.day]) {
      acc[item.day] = [];
    }
    acc[item.day].push(item);
    return acc;
  }, {});

  // Days of the week in proper order
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Time slots for grid view
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];
  
  // Fetch real schedule data (would be implemented in a real app)
  useEffect(() => {
    // This would fetch real data from the API
  }, [token, selectedTerm]);
  
  const getColorClass = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'green': return 'bg-green-100 border-green-400 text-green-800';
      case 'purple': return 'bg-purple-100 border-purple-400 text-purple-800';
      case 'yellow': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'red': return 'bg-red-100 border-red-400 text-red-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <img src="/assets/logo/logo.jpg" alt="Logo" className="h-10 w-auto mr-3 rounded" />
          <h1 className="text-2xl font-bold flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-primary" />
            Faculty Teaching Schedule
          </h1>
        </div>
        
        <div className="flex space-x-4">
          <Select 
            defaultValue="Spring 2024" 
            style={{ width: 150 }}
            onChange={(value) => setSelectedTerm(value)}
            options={[
              { value: 'Fall 2023', label: 'Fall 2023' },
              { value: 'Spring 2024', label: 'Spring 2024' },
              { value: 'Summer 2024', label: 'Summer 2024' },
            ]}
          />
          
          <Select 
            defaultValue="All Days" 
            style={{ width: 120 }}
            onChange={(value) => setSelectedDay(value)}
            options={[
              { value: 'All Days', label: 'All Days' },
              { value: 'Monday', label: 'Monday' },
              { value: 'Tuesday', label: 'Tuesday' },
              { value: 'Wednesday', label: 'Wednesday' },
              { value: 'Thursday', label: 'Thursday' },
              { value: 'Friday', label: 'Friday' },
            ]}
          />
        </div>
      </div>
      
      <div className="flex justify-center mb-4">
        <div className="bg-background border border-border rounded-lg p-2 inline-flex">
          <Button 
            type={activeView === 'weekly' ? 'primary' : 'default'}
            onClick={() => setActiveView('weekly')}
            className="mr-2"
          >
            Weekly View
          </Button>
          <Button 
            type={activeView === 'list' ? 'primary' : 'default'}
            onClick={() => setActiveView('list')}
          >
            List View
          </Button>
        </div>
      </div>
      
      {activeView === 'weekly' ? (
        <div className="bg-background border border-border rounded-lg p-4 md:p-6">
          <div className="grid grid-cols-5 gap-4">
            {days.map(day => (
              <div key={day} className="flex flex-col">
                <h3 className="text-lg font-medium mb-2 text-center py-2 bg-primary/10 rounded-t-lg">{day}</h3>
                <div className="flex-1 space-y-2">
                  {groupedByDay[day]?.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(session => (
                    <div 
                      key={session.id}
                      className={`p-3 border rounded-lg ${getColorClass(session.color)}`}
                    >
                      <div className="font-bold">{session.courseCode}</div>
                      <div className="text-sm mb-1">{session.title}</div>
                      <div className="flex items-center text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {session.startTime} - {session.endTime}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {session.location}
                      </div>
                      <div className="flex items-center text-xs mt-1">
                        <Users className="h-3 w-3 mr-1" />
                        {session.studentsCount} students
                      </div>
                      <Tag className="mt-1" color={session.type === 'Lecture' ? 'blue' : 'orange'}>
                        {session.type}
                      </Tag>
                    </div>
                  ))}
                  {(!groupedByDay[day] || groupedByDay[day].length === 0) && (
                    <div className="p-3 border border-dashed border-gray-300 rounded-lg text-center text-gray-400">
                      No classes
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-lg">
          <div className="p-4 md:p-6">
            <h2 className="text-xl font-semibold mb-4">All Classes</h2>
            <div className="space-y-4">
              {filteredSchedule.sort(sortByDay).map(session => (
                <Card key={session.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h3 className="text-lg font-bold">
                        {session.courseCode}: {session.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        {session.day}
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                        <span className="mx-2">•</span>
                        <MapPin className="h-4 w-4 mr-1" />
                        {session.location}
                      </div>
                      <div className="mt-2">
                        <Tag color={session.type === 'Lecture' ? 'blue' : 'orange'}>
                          {session.type}
                        </Tag>
                        <Tag color="default">
                          <Users className="h-3 w-3 mr-1 inline" />
                          {session.studentsCount} students
                        </Tag>
                      </div>
                    </div>
                    <div className="mt-3 md:mt-0 space-x-2">
                      <Button size="small" type="primary">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Course Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              
              {filteredSchedule.length === 0 && (
                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600">No Classes Found</h3>
                  <p className="text-gray-500 mt-1">There are no classes scheduled for the selected filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-background border border-border rounded-lg p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Teaching Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg bg-blue-50">
            <h3 className="text-sm text-gray-600">Total Courses</h3>
            <p className="text-2xl font-bold">3</p>
          </div>
          <div className="p-4 border rounded-lg bg-green-50">
            <h3 className="text-sm text-gray-600">Weekly Hours</h3>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="p-4 border rounded-lg bg-purple-50">
            <h3 className="text-sm text-gray-600">Total Students</h3>
            <p className="text-2xl font-bold">82</p>
          </div>
          <div className="p-4 border rounded-lg bg-yellow-50">
            <h3 className="text-sm text-gray-600">Office Hours</h3>
            <p className="text-2xl font-bold">6 hrs/week</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule; 