import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoutBtn from "./LogoutBtn";
import {
  Home, BarChart3, Target, BookOpen, LogIn, UserPlus,
  Zap, Brain, Activity, ChevronDown, Bell, Search, Menu, X, User
} from 'lucide-react';

const Logo = () => (
  <div className="flex items-center space-x-2 cursor-pointer">
    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
      <Brain className="w-6 h-6 text-white" />
    </div>
    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      LearnOS
    </span>
  </div>
);
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [showHeader, setShowHeader] = useState(true);

  // Track scroll position
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScroll = () => {
      setScrolled(window.scrollY > 20);

      if (window.scrollY > lastScrollY) {
        // scrolling down -> hide header
        setShowHeader(false);
      } else {
        // scrolling up -> show header
        setShowHeader(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", updateScroll);
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  const navItems = [
    { name: 'Home', link: '/', show: auth, icon: Home },
    { name: 'Learning-path', link: '/learning-path', show: auth, icon: Target },
    { name: 'Quiz', link: '/quizzes', show: auth, icon: BookOpen },
    { name: 'Login', link: '/login', show: !auth, icon: LogIn },
    { name: 'Register', link: '/register', show: !auth, icon: UserPlus },
    {
      name: 'Simulation',
      link: '/simulation',
      show: auth,
      icon: Zap,
      submenu: [
        { name: 'Introduction-to-os', link: '/simulation/Introduction-to-os', icon: Brain },
        { name: 'Process-Scheduling', link: '/simulation/Process-Scheduling', icon: Activity },
        { name: 'Memory-Management', link: '/simulation/Memory-Management', icon: Target },
        { name: 'Cpu-scheduling', link: '/simulation/Cpu-scheduling', icon: Zap },
        { name: 'more-topic', link: '/simulation/more-topic', icon: BookOpen },
      ],
    },
  ];

  const isActive = (link) => location.pathname === link;

  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const navigateTo = (link) => {
    navigate(link);
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };


  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform 
          ${scrolled ? 'bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-800/50' : 'bg-gray-900/80 backdrop-blur-sm'}
          ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div onClick={() => navigateTo('/')}><Logo /></div>

          {auth && (
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules, quizzes..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
          )}

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.filter(item => item.show).map(item => (
              <div key={item.name} className="relative group">
                <button
                  onClick={() => item.submenu ? toggleDropdown(item.name) : navigateTo(item.link)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition ${isActive(item.link)
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.submenu && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''
                        }`}
                    />
                  )}
                </button>
                {item.submenu && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-2 z-20">
                    {item.submenu.map(sub => (
                      <button
                        key={sub.name}
                        onClick={() => navigateTo(sub.link)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded"
                      >
                        <sub.icon className="w-4 h-4 text-purple-400" />
                        <span>{sub.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {auth && (
              <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-700/50">
                <button className="relative p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 hover:border-gray-600/50">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
                </button>
                <div className="flex items-center space-x-3 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700/50">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden lg:block text-white">
                    <div className="text-sm font-medium">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-400">{user?.role || 'Student'}</div>
                  </div>
                </div>
                <LogoutBtn />
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800/95 backdrop-blur-lg border-t border-gray-700/50 p-4 space-y-4">
            {auth && (
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            )}
            <nav className="space-y-2">
              {navItems.filter(item => item.show).map(item => (
                <div key={item.name}>
                  <button
                    onClick={() => item.submenu ? toggleDropdown(item.name) : navigateTo(item.link)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-gray-300 hover:text-white hover:bg-gray-700/50`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {item.submenu && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''
                          }`}
                      />
                    )}
                  </button>
                  {item.submenu && activeDropdown === item.name && (
                    <div className="pl-8 space-y-1">
                      {item.submenu.map(sub => (
                        <button
                          key={sub.name}
                          onClick={() => navigateTo(sub.link)}
                          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        >
                          <sub.icon className="w-4 h-4 text-purple-400" />
                          <span>{sub.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            {auth && (
              <div className="pt-6 border-t border-gray-700/50 flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
                  <div className="text-xs text-gray-400">{user?.role || 'Student'}</div>
                </div>
                <LogoutBtn />
              </div>
            )}
          </div>
        )}
      </header>

      {/* Spacer to avoid content hiding behind fixed header */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;
