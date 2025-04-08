import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  X
} from 'lucide-react';
import { Modal, Badge, Divider } from 'antd';

// Mock data for the schedule
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

// Class schedule data
const CLASS_SCHEDULE = [
  {
    id: 'class1',
    courseId: 'CS101',
    courseName: 'Introduction to Computer Science',
    instructor: 'Dr. Alan Turing',
    location: 'Engineering Hall 305',
    days: ['Monday', 'Wednesday', 'Friday'],
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    id: 'class2',
    courseId: 'MATH201',
    courseName: 'Linear Algebra',
    instructor: 'Dr. Katherine Johnson',
    location: 'Science Building 210',
    days: ['Tuesday', 'Thursday'],
    startTime: '1:00 PM',
    endTime: '3:00 PM',
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    id: 'class3',
    courseId: 'PHYS101',
    courseName: 'Physics I: Mechanics',
    instructor: 'Dr. Richard Feynman',
    location: 'Physics Lab 110',
    days: ['Monday', 'Wednesday'],
    startTime: '2:00 PM',
    endTime: '3:30 PM',
    color: 'bg-purple-100 border-purple-300 text-purple-800'
  },
  {
    id: 'class4',
    courseId: 'ENG102',
    courseName: 'Academic Writing',
    instructor: 'Prof. Maya Angelou',
    location: 'Humanities Building 405',
    days: ['Tuesday', 'Thursday'],
    startTime: '9:00 AM',
    endTime: '10:30 AM',
    color: 'bg-amber-100 border-amber-300 text-amber-800'
  }
];

// Helper function to get time index
const getTimeIndex = (time: string) => {
  return TIME_SLOTS.findIndex(slot => slot === time);
};

// Helper function to calculate duration in slots
const getDurationInSlots = (startTime: string, endTime: string) => {
  const startIndex = getTimeIndex(startTime);
  
  // Parse start time
  let startHour = parseInt(startTime.split(':')[0]);
  const startIsPM = startTime.includes('PM') && startHour !== 12;
  if (startIsPM) {
    startHour += 12;
  }
  
  // Parse end time
  let endHour = parseInt(endTime.split(':')[0]);
  const endIsPM = endTime.includes('PM') && endHour !== 12;
  if (endIsPM) {
    endHour += 12;
  }
  
  return Math.ceil((endHour - startHour) * 2); // Each slot is 30 minutes
};

const Schedule = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState<string>('Current Week');
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  // Get today's date
  const today = new Date();
  const currentDay = DAYS_OF_WEEK[today.getDay() - 1] || DAYS_OF_WEEK[0]; // Default to Monday if weekend
  
  // Format date for display
  const formatDate = (dayOffset: number) => {
    const date = new Date();
    date.setDate(today.getDate() - today.getDay() + 1 + dayOffset); // Start from Monday
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };

  const handleClassClick = (classId: string) => {
    setSelectedClass(classId);
    setIsModalVisible(true);
  };

  const getSelectedClassDetails = () => {
    return CLASS_SCHEDULE.find(c => c.id === selectedClass);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Class Schedule</h1>
      
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button 
          className="flex items-center text-primary hover:underline"
          onClick={() => setCurrentWeek('Previous Week')}
        >
          <ChevronLeft size={20} className="mr-1" />
          Previous Week
        </button>
        
        <h2 className="text-xl font-semibold">{currentWeek}</h2>
        
        <button 
          className="flex items-center text-primary hover:underline"
          onClick={() => setCurrentWeek('Next Week')}
        >
          Next Week
          <ChevronRight size={20} className="ml-1" />
        </button>
      </div>
      
      {/* Schedule Grid */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 border-b">
          {/* Time column header */}
          <div className="p-3 font-medium text-gray-500 text-center border-r">
            Time
          </div>
          
          {/* Day column headers */}
          {DAYS_OF_WEEK.map((day, index) => (
            <div 
              key={day} 
              className={`p-3 font-medium text-center ${day === currentDay ? 'bg-primary/10' : ''}`}
            >
              <div>{day}</div>
              <div className="text-xs text-gray-500">{formatDate(index)}</div>
            </div>
          ))}
        </div>
        
        {/* Time slots and classes */}
        <div className="relative">
          {/* Time slots */}
          {TIME_SLOTS.map((time, timeIndex) => (
            <div key={time} className="grid grid-cols-6 border-b last:border-b-0">
              {/* Time label */}
              <div className="p-2 text-sm text-gray-500 text-center border-r">
                {time}
              </div>
              
              {/* Empty cells for each day */}
              {DAYS_OF_WEEK.map(day => (
                <div key={`${day}-${time}`} className="p-1 min-h-[60px] border-r last:border-r-0 relative"></div>
              ))}
            </div>
          ))}
          
          {/* Classes overlaid on the grid */}
          {CLASS_SCHEDULE.map(classItem => (
            classItem.days.map(day => {
              const dayIndex = DAYS_OF_WEEK.indexOf(day) + 1; // +1 because first column is time
              const startTimeIndex = getTimeIndex(classItem.startTime);
              const duration = getDurationInSlots(classItem.startTime, classItem.endTime);
              
              return (
                <div
                  key={`${classItem.id}-${day}`}
                  className={`absolute border rounded-md p-2 cursor-pointer transition-all hover:shadow-md ${classItem.color}`}
                  style={{
                    top: `${startTimeIndex * 60}px`,
                    left: `${(dayIndex / 6) * 100}%`,
                    width: `${(1 / 6) * 100 - 2}%`,
                    height: `${duration * 30}px`,
                    transform: 'translateX(0)'
                  }}
                  onClick={() => handleClassClick(classItem.id)}
                >
                  <div className="text-sm font-medium truncate">{classItem.courseId}</div>
                  <div className="text-xs truncate">{classItem.courseName}</div>
                </div>
              );
            })
          ))}
        </div>
      </div>
      
      {/* Course Details Modal */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        closeIcon={<X className="text-gray-500 hover:text-gray-700" />}
        width={500}
        className="course-details-modal"
      >
        {getSelectedClassDetails() && (
          <div className="py-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold mb-1">{getSelectedClassDetails()?.courseId}</h3>
                <h4 className="text-xl text-gray-700">{getSelectedClassDetails()?.courseName}</h4>
              </div>
              <Badge 
                count={getSelectedClassDetails()?.days.length} 
                style={{ 
                  backgroundColor: '#1890ff',
                  fontSize: '14px',
                  padding: '0 8px',
                  height: '24px',
                  lineHeight: '24px'
                }}
                text="sessions/week"
              />
            </div>
            
            <Divider className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <div className="font-medium">Schedule</div>
                  <div className="text-gray-600">
                    {getSelectedClassDetails()?.days.join(', ')} • {getSelectedClassDetails()?.startTime} - {getSelectedClassDetails()?.endTime}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <div className="font-medium">Location</div>
                  <div className="text-gray-600">{getSelectedClassDetails()?.location}</div>
                </div>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-3" />
                <div>
                  <div className="font-medium">Instructor</div>
                  <div className="text-gray-600">{getSelectedClassDetails()?.instructor}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Course List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">My Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CLASS_SCHEDULE.map(course => (
            <div 
              key={course.id}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedClass === course.id 
                  ? 'ring-2 ring-primary' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedClass(
                selectedClass === course.id ? null : course.id
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{course.courseId}</h3>
                  <p className="text-sm text-gray-600">{course.courseName}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${course.color.replace('bg-', 'bg-').replace('border-', '').replace('text-', '')}`}></div>
              </div>
              
              <div className="mt-3 text-sm space-y-1">
                <div className="flex items-center text-gray-600">
                  <Clock size={14} className="mr-1" />
                  {course.days.join(', ')}, {course.startTime} - {course.endTime}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={14} className="mr-1" />
                  {course.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <User size={14} className="mr-1" />
                  {course.instructor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Calendar Integration Note */}
      <div className="mt-8 p-4 bg-primary/5 rounded-lg border flex items-center">
        <Calendar size={24} className="text-primary mr-3" />
        <div>
          <h3 className="font-semibold">Sync with Your Calendar</h3>
          <p className="text-sm text-gray-600">
            You can export your class schedule to Google Calendar, Apple Calendar, or Outlook.
            <button className="ml-2 text-primary hover:underline">Export Schedule</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Schedule; 