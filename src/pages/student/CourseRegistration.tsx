import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  BookOpen, 
  Clock, 
  User, 
  Users, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';

// Mock data - would be fetched from API in a real app
const AVAILABLE_COURSES = [
  {
    id: 'CS101',
    name: 'Introduction to Computer Science',
    instructor: 'Dr. Alan Turing',
    schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
    capacity: 30,
    enrolled: 18,
    description: 'Foundational concepts in computer science and programming.'
  },
  {
    id: 'MATH201',
    name: 'Linear Algebra',
    instructor: 'Dr. Katherine Johnson',
    schedule: 'Tue, Thu 1:00 PM - 3:00 PM',
    capacity: 25,
    enrolled: 20,
    description: 'Study of vectors, matrices, and linear transformations.'
  },
  {
    id: 'PHYS101',
    name: 'Physics I: Mechanics',
    instructor: 'Dr. Richard Feynman',
    schedule: 'Mon, Wed 2:00 PM - 3:30 PM',
    capacity: 40,
    enrolled: 35,
    description: 'Introduction to classical mechanics and physics principles.'
  },
  {
    id: 'ENG102',
    name: 'Academic Writing',
    instructor: 'Prof. Maya Angelou',
    schedule: 'Tue, Thu 9:00 AM - 10:30 AM',
    capacity: 20,
    enrolled: 15,
    description: 'Develop academic writing skills for research papers and essays.'
  },
  {
    id: 'BIO101',
    name: 'Introduction to Biology',
    instructor: 'Dr. Rosalind Franklin',
    schedule: 'Wed, Fri 11:00 AM - 12:30 PM',
    capacity: 35,
    enrolled: 28,
    description: 'Basic principles of biology, cell structure, and genetics.'
  }
];

const CourseRegistration = () => {
  const [courses, setCourses] = useState(AVAILABLE_COURSES);
  const [registeredCourses, setRegisteredCourses] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    actionType: 'register' | 'drop';
    courseId: string;
    courseName: string;
  } | null>(null);

  const handleRegisterCourse = (courseId: string) => {
    if (registeredCourses.includes(courseId)) {
      toast.error('You are already registered for this course');
      return;
    }

    // Update available seats
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, enrolled: course.enrolled + 1 } 
        : course
    ));

    // Add to registered courses
    setRegisteredCourses([...registeredCourses, courseId]);
    
    // Show confirmation
    const course = courses.find(c => c.id === courseId);
    setConfirmationData({
      actionType: 'register',
      courseId,
      courseName: course?.name || ''
    });
    setShowConfirmation(true);
  };

  const handleDropCourse = (courseId: string) => {
    if (!registeredCourses.includes(courseId)) {
      toast.error('You are not registered for this course');
      return;
    }

    // Update available seats
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, enrolled: course.enrolled - 1 } 
        : course
    ));

    // Remove from registered courses
    setRegisteredCourses(registeredCourses.filter(id => id !== courseId));
    
    // Show confirmation
    const course = courses.find(c => c.id === courseId);
    setConfirmationData({
      actionType: 'drop',
      courseId,
      courseName: course?.name || ''
    });
    setShowConfirmation(true);
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationData(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Course Registration</h1>
      
      {/* Registered Courses Summary */}
      <div className="mb-8 p-4 border rounded-lg bg-primary/5">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <BookOpen className="mr-2" size={20} />
          My Registered Courses
        </h2>
        {registeredCourses.length === 0 ? (
          <p className="text-gray-500 italic">No courses registered yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredCourses.map(courseId => {
              const course = courses.find(c => c.id === courseId);
              return (
                <div key={courseId} className="p-3 border rounded-md bg-white flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{course?.id}: {course?.name}</p>
                    <p className="text-sm text-gray-600">{course?.schedule}</p>
                  </div>
                  <button
                    onClick={() => handleDropCourse(courseId)}
                    className="p-1 rounded-md hover:bg-red-100 text-red-500"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Available Courses */}
      <h2 className="text-2xl font-semibold mb-4">Available Courses</h2>
      <div className="grid grid-cols-1 gap-4">
        {courses.map(course => (
          <div 
            key={course.id}
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">
                  {course.id}: {course.name}
                </h3>
                <div>
                  {course.enrolled >= course.capacity ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Full
                    </span>
                  ) : registeredCourses.includes(course.id) ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Registered
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Open
                    </span>
                  )}
                </div>
              </div>
              
              <p className="mt-2 text-gray-600">{course.description}</p>
              
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center text-sm text-gray-600">
                  <User className="mr-1" size={16} />
                  {course.instructor}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="mr-1" size={16} />
                  {course.schedule}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-1" size={16} />
                  {course.enrolled}/{course.capacity} seats filled
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                {registeredCourses.includes(course.id) ? (
                  <button
                    onClick={() => handleDropCourse(course.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
                  >
                    <XCircle className="mr-1" size={18} />
                    Drop Course
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegisterCourse(course.id)}
                    disabled={course.enrolled >= course.capacity}
                    className={`px-4 py-2 rounded-md flex items-center ${
                      course.enrolled >= course.capacity 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-primary/90 text-white hover:bg-primary'
                    }`}
                  >
                    <CheckCircle className="mr-1" size={18} />
                    Register
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && confirmationData && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              {confirmationData.actionType === 'register' ? (
                <CheckCircle className="text-green-500 mr-2" size={24} />
              ) : (
                <AlertCircle className="text-amber-500 mr-2" size={24} />
              )}
              <h3 className="text-xl font-semibold">
                {confirmationData.actionType === 'register' 
                  ? 'Registration Successful' 
                  : 'Course Dropped'}
              </h3>
            </div>
            
            <p className="mb-4">
              {confirmationData.actionType === 'register'
                ? `You have successfully registered for ${confirmationData.courseName} (${confirmationData.courseId}).`
                : `You have dropped ${confirmationData.courseName} (${confirmationData.courseId}).`
              }
            </p>
            
            <div className="flex justify-end">
              <button
                onClick={closeConfirmation}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseRegistration; 