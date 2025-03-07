'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, BarChart, Calendar, Shield, MessageSquare, CheckCircle, ArrowRight, GraduationCap, LineChart, UserPlus, Star, Clock, Menu, X, Sun, Moon, Bell, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react'

// Types for custom button
type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  asChild?: boolean;
  children: React.ReactNode;
}

// Custom button component
const Button = ({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  children,
  asChild = false,
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline'
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10'
  };
  
  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;
  
  // For asChild case, we'll just wrap the children with the className
  if (asChild) {
    return (
      <span className={combinedClassName}>
        {children}
      </span>
    );
  }
  
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};

// Utility function to replace cn
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default function Landing() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [scrollY, setScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    // Set initial theme based on user preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(savedTheme || (prefersDark ? 'dark' : 'light'))
      document.documentElement.classList.toggle('dark', savedTheme === 'dark' || (!savedTheme && prefersDark))
    }
    
    // Handle scroll events
    const handleScroll = () => {
      setScrollY(window.scrollY)
      
      // Determine active section
      const sections = ['hero', 'roles', 'features', 'cta']
      const sectionElements = sections.map(id => document.getElementById(id))
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i]
        if (section && window.scrollY >= section.offsetTop - 200) {
          setActiveSection(sections[i])
          break
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    setIsLoaded(true)
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }
  
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId)
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80,
        behavior: 'smooth'
      })
    }
    setIsMenuOpen(false)
    document.body.style.overflow = 'auto'
  }
  
  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground overflow-x-hidden",
      isLoaded && "animate-fade-in"
    )}>
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrollY > 50 ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg">
                <div className="absolute inset-0 bg-primary/20 animate-pulse-slow"></div>
                <span className="relative z-10">U</span>
              </div>
              <span className="ml-3 text-xl font-bold tracking-tight">UDIS</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('hero')}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-2",
                  activeSection === 'hero' && "text-primary"
                )}
              >
                Home
                {activeSection === 'hero' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-expand-width"></span>
                )}
              </button>
              <button 
                onClick={() => scrollToSection('roles')}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-2",
                  activeSection === 'roles' && "text-primary"
                )}
              >
                Roles
                {activeSection === 'roles' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-expand-width"></span>
                )}
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-2",
                  activeSection === 'features' && "text-primary"
                )}
              >
                Features
                {activeSection === 'features' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-expand-width"></span>
                )}
              </button>
              <button 
                onClick={() => scrollToSection('cta')}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary relative py-2",
                  activeSection === 'cta' && "text-primary"
                )}
              >
                Get Started
                {activeSection === 'cta' && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-expand-width"></span>
                )}
              </button>
            </nav>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
              
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              
              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-md hover:bg-primary/10"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div className={cn(
        "fixed inset-0 z-40 bg-background/95 backdrop-blur-lg md:hidden transition-transform duration-300 ease-in-out",
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col items-center justify-center h-full space-y-8 p-4">
          <button 
            onClick={() => scrollToSection('hero')}
            className="text-xl font-medium hover:text-primary transition-colors"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('roles')}
            className="text-xl font-medium hover:text-primary transition-colors"
          >
            Roles
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="text-xl font-medium hover:text-primary transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('cta')}
            className="text-xl font-medium hover:text-primary transition-colors"
          >
            Get Started
          </button>
          <Button asChild size="lg" className="mt-4 w-full max-w-xs">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="relative pt-24 sm:pt-32 pb-16 sm:pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Next Generation Academic Platform
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                University Department <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">Information System</span>
              </h1>
              
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground animate-fade-in-up px-4 sm:px-0" style={{ animationDelay: '0.4s' }}>
                A comprehensive platform for managing academic information, 
                resources, and processes within university departments with 
                a modern, intuitive interface.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <Button size="lg" asChild>
                  <Link to="/login" className="flex items-center">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-lg lg:max-w-none animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/40 rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-background/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-1">
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-2 text-xs text-muted-foreground">UDIS Dashboard</div>
                    </div>
                    <div className="p-4">
                      <div className="rounded-lg shadow-sm border border-border bg-background overflow-hidden">
                        <div className="p-4 border-b border-border">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <Users className="h-4 w-4 text-primary" />
                              </div>
                              <div className="font-semibold">Dashboard Overview</div>
                            </div>
                            <div className="flex space-x-2">
                              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                                <Users className="h-3 w-3 text-muted-foreground" />
                              </div>
                              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                                <Bell className="h-3 w-3 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 p-4">
                          {/* Stat cards */}
                          <div className="bg-muted/50 p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">Students</div>
                            <div className="text-xl font-bold">2,845</div>
                            <div className="text-xs text-primary mt-1 flex items-center">
                              <ArrowUp className="h-3 w-3 mr-1" /> 12%
                            </div>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">Courses</div>
                            <div className="text-xl font-bold">142</div>
                            <div className="text-xs text-primary mt-1 flex items-center">
                              <ArrowUp className="h-3 w-3 mr-1" /> 8%
                            </div>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-md">
                            <div className="text-xs text-muted-foreground mb-1">Faculty</div>
                            <div className="text-xl font-bold">64</div>
                            <div className="text-xs text-emerald-500 mt-1 flex items-center">
                              <ArrowUp className="h-3 w-3 mr-1" /> 4%
                            </div>
                          </div>
                        </div>

                        {/* Chart area */}
                        <div className="p-4 border-t border-border">
                          <div className="mb-3 flex justify-between items-center">
                            <div className="text-sm font-medium">Enrollment Statistics</div>
                            <div className="text-xs text-muted-foreground">Last 6 months</div>
                          </div>
                          <div className="h-32 flex items-end justify-between space-x-2">
                            {[35, 45, 30, 60, 75, 50].map((height, i) => (
                              <div key={i} className="relative w-full">
                                <div 
                                  className="bg-primary/20 rounded-t-sm"
                                  style={{ height: `${height}%` }}
                                ></div>
                                <div className="absolute -bottom-5 w-full text-center text-xs text-muted-foreground">
                                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i]}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recent activity */}
                        <div className="p-4 border-t border-border">
                          <div className="mb-3">
                            <div className="text-sm font-medium">Recent Activity</div>
                          </div>
                          <div className="space-y-2">
                            {[
                              { user: 'John S.', action: 'submitted assignment', time: '2h ago' },
                              { user: 'Sarah L.', action: 'enrolled in 3 courses', time: '5h ago' },
                              { user: 'Mark T.', action: 'updated profile', time: '1d ago' }
                            ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center">
                                  <div className="w-5 h-5 rounded-full bg-primary/10 mr-2"></div>
                                  <span>
                                    <span className="font-medium">{item.user}</span> {item.action}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">{item.time}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded-full w-5/6 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute bottom-1/3 -right-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Decorative Grid */}
        <div className="absolute inset-0 -z-20 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03]"></div>
      </section>

      {/* Role-based Features Section */}
      <section id="roles" className="py-16 sm:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4">
              Tailored for Every Role
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight px-4 sm:px-0">
              Specialized Features for Different Roles
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground px-4 sm:px-0">
              UDIS provides customized experiences for everyone in the academic ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Student Features */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">For Students</h3>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Course registration and scheduling</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Assignment submission and tracking</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Grade visualization and analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Academic record management</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Faculty Features */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">For Faculty</h3>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Course management and content delivery</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Grading and assessment tools</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Student performance analytics</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Office hours and schedule management</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Admin Features */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">For Administrators</h3>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>User management and access control</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>System configuration and settings</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Audit logs and system security</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Resource allocation and management</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Department Head Features */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">For Department Heads</h3>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Department-wide analytics and reports</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Faculty performance monitoring</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Resource approval and allocation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span>Strategy planning and implementation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 relative">
        <div className="absolute inset-0 bg-primary/5 -z-10 skew-y-3 transform-gpu"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Designed for Modern Academia
            </h2>
            <p className="mt-4 text-muted-foreground">
              Streamline academic processes and enhance productivity with our innovative features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: <LineChart className="h-10 w-10 text-primary" />,
                title: "Interactive Analytics",
                description: "Visualize data with interactive charts and graphs for better decision-making and performance tracking."
              },
              {
                icon: <Calendar className="h-10 w-10 text-primary" />,
                title: "Integrated Calendar",
                description: "Keep track of important dates, deadlines, classes, and events in one centralized calendar system."
              },
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Role-Based Access",
                description: "Secure role-based access control ensures users can only access the information and features they need."
              },
              {
                icon: <UserPlus className="h-10 w-10 text-primary" />,
                title: "Onboarding Experience",
                description: "Interactive guided tours help new users understand the system quickly and efficiently."
              },
              {
                icon: <MessageSquare className="h-10 w-10 text-primary" />,
                title: "Notifications",
                description: "Stay updated with real-time notifications about important events, announcements, and deadlines."
              },
              {
                icon: <Star className="h-10 w-10 text-primary" />,
                title: "Modern UI/UX",
                description: "Intuitive, responsive interface designed for ease of use on desktop, tablet, and mobile devices."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group bg-card rounded-xl border border-border p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-4 relative">
                  <div className="absolute -inset-1 bg-primary/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 w-full">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/40 rounded-2xl blur opacity-30 animate-pulse"></div>
                <div className="relative bg-background/50 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-1">
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-2 text-xs text-muted-foreground">Interactive Dashboard</div>
                    </div>
                    <div className="p-4">
                      <div className="aspect-video bg-card rounded-lg overflow-hidden relative border border-border">
                        {/* Calendar/Scheduling UI */}
                        <div className="h-full flex flex-col">
                          {/* Calendar header */}
                          <div className="flex justify-between items-center p-3 border-b border-border">
                            <div className="flex items-center gap-2">
                              <button className="p-1 rounded hover:bg-muted">
                                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                              </button>
                              <div className="font-medium">September 2023</div>
                              <button className="p-1 rounded hover:bg-muted">
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">Today</button>
                              <select className="text-xs bg-muted px-2 py-1 rounded-md border border-border">
                                <option>Month</option>
                                <option>Week</option>
                                <option>Day</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Calendar days */}
                          <div className="grid grid-cols-7 border-b border-border">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                              <div key={i} className="text-center p-2 text-xs text-muted-foreground">
                                {day}
                              </div>
                            ))}
                          </div>
                          
                          {/* Calendar grid */}
                          <div className="grid grid-cols-7 flex-grow">
                            {/* First row with empty days and start of month */}
                            {[...Array(6)].map((_, i) => (
                              <div key={`empty-${i}`} className="border-r border-b border-border p-1 text-xs text-muted-foreground/50">
                                {/* Empty cell */}
                              </div>
                            ))}
                            <div className="border-r border-b border-border p-1 relative bg-muted/30">
                              <div className="text-xs mb-1">1</div>
                            </div>
                            
                            {/* Second row with dates and events */}
                            {[2, 3, 4, 5, 6, 7, 8].map((date, i) => (
                              <div key={`date-${date}`} className={`border-r border-b border-border p-1 relative ${date === 5 ? 'bg-primary/5' : ''}`}>
                                <div className="text-xs mb-1">{date}</div>
                                {date === 3 && (
                                  <div className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs p-1 rounded mb-1 truncate">
                                    Faculty Meeting
                                  </div>
                                )}
                                {date === 5 && (
                                  <>
                                    <div className="bg-primary/10 text-primary text-xs p-1 rounded mb-1 truncate">
                                      CS101 Lecture
                                    </div>
                                    <div className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs p-1 rounded truncate">
                                      Office Hours
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                            
                            {/* Third row with course scheduling */}
                            {[9, 10, 11, 12, 13, 14, 15].map((date, i) => (
                              <div key={`date-${date}`} className={`border-r border-b border-border p-1 relative ${date === 12 ? 'bg-primary/5' : ''}`}>
                                <div className="text-xs mb-1">{date}</div>
                                {date === 10 && (
                                  <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs p-1 rounded truncate">
                                    Enrollment Opens
                                  </div>
                                )}
                                {date === 12 && (
                                  <div className="bg-primary/10 text-primary text-xs p-1 rounded truncate">
                                    CS101 Lecture
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {/* Sidebar with legend/course list */}
                          <div className="absolute right-0 top-12 h-[calc(100%-48px)] w-32 bg-background/90 backdrop-blur-sm border-l border-border overflow-y-auto">
                            <div className="p-2 border-b border-border">
                              <div className="text-xs font-medium mb-2">My Courses</div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  <div className="text-xs truncate">CS101: Intro</div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                  <div className="text-xs truncate">MTH201: Calc</div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                  <div className="text-xs truncate">PHY150: Physics</div>
                                </div>
                              </div>
                            </div>
                            <div className="p-2">
                              <div className="text-xs font-medium mb-2">Resources</div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                  <div className="text-xs truncate">Lab 03A</div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                  <div className="text-xs truncate">Hall 201B</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 order-1 lg:order-2 text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Interactive Experience
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                See UDIS in Action
              </h2>
              <p className="text-muted-foreground mb-8">
                Experience the intuitive interface and powerful features that make UDIS the preferred choice for university departments worldwide.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Intuitive User Interface</h4>
                    <p className="text-sm text-muted-foreground">Designed for ease of use with minimal learning curve</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Real-time Collaboration</h4>
                    <p className="text-sm text-muted-foreground">Work together seamlessly across departments</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Data-driven Insights</h4>
                    <p className="text-sm text-muted-foreground">Make informed decisions with comprehensive analytics</p>
                  </div>
                </li>
              </ul>
              <Button size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-primary animate-gradient-x"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Ready to transform your department?</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
                Join thousands of universities worldwide that use UDIS to streamline their academic processes, 
                enhance collaboration, and improve student outcomes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link to="/login" className="flex items-center justify-center">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Schedule a Demo
                </Button>
              </div>
              
              <div className="mt-8 sm:mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                <div className="flex flex-col items-center p-4 sm:p-0">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">500+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Universities</div>
                </div>
                <div className="flex flex-col items-center p-4 sm:p-0">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">2M+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Users</div>
                </div>
                <div className="flex flex-col items-center p-4 sm:p-0">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">98%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Satisfaction</div>
                </div>
                <div className="flex flex-col items-center p-4 sm:p-0">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">24/7</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary/5 rounded-full filter blur-2xl opacity-70"></div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-base sm:text-lg">
                  U
                </div>
                <span className="ml-3 text-lg sm:text-xl font-bold">UDIS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                A comprehensive platform for managing academic information, resources, and processes.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Integrations</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Changelog</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Tutorials</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} University Department Information System. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.688.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
