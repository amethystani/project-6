import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  role: string;
  onComplete: () => void;
}

interface Step {
  title: string;
  description: string;
  image: string;
}

const roleSpecificSteps: Record<string, Step[]> = {
  student: [
    {
      title: 'Welcome to UDIS',
      description: 'Your academic journey starts here. This platform helps you manage your courses, assignments, and academic progress all in one place.',
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Course Registration',
      description: 'Easily browse and register for available courses each semester. Keep track of your course schedule and requirements.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Assignment Management',
      description: 'View upcoming assignments, submit your work, and check grades all in one place.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Academic Records',
      description: 'Monitor your grades, GPA, and overall academic progress throughout your program.',
      image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
  ],
  faculty: [
    {
      title: 'Welcome to UDIS',
      description: 'This platform makes teaching and academic management simple and efficient for faculty members.',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Course Management',
      description: 'Create and organize course content, syllabus, and materials for your students.',
      image: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Grade Entry',
      description: 'Easily manage student assessments, enter grades, and provide feedback.',
      image: 'https://images.unsplash.com/photo-1606326608690-4e0281b1e588?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Faculty Analytics',
      description: 'View insights about student performance, course effectiveness, and teaching outcomes.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
  ],
  admin: [
    {
      title: 'Welcome to UDIS',
      description: 'This platform provides powerful administrative tools to manage the university department efficiently.',
      image: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'User Management',
      description: 'Add, edit, and manage user accounts for faculty, staff, and students.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'System Settings',
      description: 'Configure and customize the system according to department requirements.',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Access comprehensive statistics and insights about departmental performance.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
  ],
  head: [
    {
      title: 'Welcome to UDIS',
      description: 'This platform provides powerful tools for department leadership to oversee operations effectively.',
      image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Department Analytics',
      description: 'Access comprehensive data and insights about faculty, student, and course performance.',
      image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Approvals Management',
      description: 'Review and approve requests from faculty members for resources, course changes, and more.',
      image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
    {
      title: 'Reporting & Strategy',
      description: 'Generate reports and analyze data to guide departmental strategy and improvements.',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    },
  ],
};

// Default steps if role is not found
const defaultSteps: Step[] = [
  {
    title: 'Welcome to UDIS',
    description: 'This platform helps manage university department information and processes efficiently.',
    image: 'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Personalized Dashboard',
    description: 'Your dashboard provides quick access to all the features you need based on your role.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
  {
    title: 'Need Help?',
    description: 'You can always access help documentation or contact support from the sidebar.',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
  },
];

export const Onboarding: React.FC<OnboardingProps> = ({ role, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  // Get appropriate steps based on role
  const steps = roleSpecificSteps[role] || defaultSteps;
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsVisible(false);
    
    // Give time for exit animation before calling onComplete
    setTimeout(() => {
      onComplete();
    }, 300);
  };
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-background rounded-lg max-w-3xl w-full overflow-hidden shadow-xl"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="relative">
            <img 
              src={steps[currentStep].image} 
              alt={steps[currentStep].title} 
              className="w-full h-48 md:h-64 object-cover"
            />
            <button 
              onClick={completeOnboarding}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">{steps[currentStep].title}</h2>
              <div className="text-sm text-muted-foreground">
                {currentStep + 1} of {steps.length}
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">
              {steps[currentStep].description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'w-6 bg-primary' 
                        : 'w-2 bg-primary/30'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 rounded-md border border-border hover:bg-primary/5 flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}
                
                <button
                  onClick={nextStep}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <span>Get Started</span>
                      <Check className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Onboarding; 