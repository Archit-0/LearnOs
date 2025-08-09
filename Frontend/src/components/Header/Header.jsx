import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LogoutBtn from "./LogoutBtn"
import {
  Home,
  BarChart3,
  Target,
  BookOpen,
  LogIn,
  UserPlus,
  Zap,
  Brain,
  Activity,
  ChevronDown,
  Bell,
  Search,
  Menu,
  X,
  User,
  Settings,
} from 'lucide-react';

// Your original Logo component replaced with gradient style from second snippet
const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
      <Brain className="w-6 h-6 text-white" />
    </div>
    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
      LearnOS
    </span>
  </div>
);

// Logout button styled as per second snippet

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const authStatus = useSelector(state => state.auth.isAuthenticated);
  const user = useSelector(state => state.auth.user);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItem = [
    { name: 'Home', link: '/', active: authStatus, icon: Home },
    { name: 'Dashboard', link: '/dashboard', active: authStatus, icon: BarChart3 },
    { name: 'Learning-path', link: '/learning-path', active: authStatus, icon: Target },
    { name: 'Quiz', link: '/quizzes', active: authStatus, icon: BookOpen },
    { name: 'Login', link: '/login', active: !authStatus, icon: LogIn },
    { name: 'Register', link: '/register', active: !authStatus, icon: UserPlus },
    {
      name: 'Simulation',
      link: '/simulation',
      active: authStatus,
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

  const isActiveLink = (link) => location.pathname === link;

  const handleDropdownToggle = (itemName) => {
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  };

  const handleNavigation = (link) => {
    navigate(link);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-gray-900/95 backdrop-blur-lg shadow-2xl border-b border-gray-800/50'
          : 'bg-gray-900/80 backdrop-blur-sm'
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => handleNavigation('/')}
              className="flex items-center space-x-3 group flex-shrink-0"
            >
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <Logo />
              </div>
            </button>

            {/* Search bar on desktop */}
            {authStatus && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search modules, quizzes..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItem.map(
                (item) =>
                  item.active && (
                    <div key={item.name} className="relative group">
                      <button
                        onClick={() =>
                          item.submenu
                            ? handleDropdownToggle(item.name)
                            : handleNavigation(item.link)
                        }
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 relative overflow-hidden group ${isActiveLink(item.link)
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent hover:border-gray-700/50'
                          }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

                        <item.icon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10 font-medium">{item.name}</span>

                        {item.submenu && (
                          <ChevronDown
                            className={`w-4 h-4 relative z-10 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''
                              }`}
                          />
                        )}
                      </button>

                      {item.submenu && (
                        <div
                          className={`absolute top-full left-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-lg border border-gray-700/50 rounded-xl shadow-2xl transition-all duration-300 ${activeDropdown === item.name
                            ? 'opacity-100 visible transform translate-y-0'
                            : 'opacity-0 invisible transform -translate-y-2'
                            }`}
                        >
                          <div className="p-2">
                            {item.submenu.map((sub, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleNavigation(sub.link)}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 group"
                              >
                                <sub.icon className="w-4 h-4 text-purple-400" />
                                <span className="font-medium">{sub.name}</span>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
              )}

              {/* User actions */}
              {authStatus && (
                <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-700/50">
                  <button className="relative p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200 border border-gray-700/50 hover:border-gray-600/50">
                    <Bell className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                  </button>

                  <div className="flex items-center space-x-3 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-sm font-medium text-white">
                        {user?.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {user?.role || 'Student'}
                      </div>
                    </div>
                  </div>

                  <LogoutBtn />
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="px-4 py-6 bg-gray-800/95 backdrop-blur-lg border-t border-gray-700/50">
            {/* Search Bar (Mobile) */}
            {authStatus && (
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Navigation Items (Mobile) */}
            <nav className="space-y-2">
              {navItem.map(
                (item) =>
                  item.active && (
                    <div key={item.name}>
                      <button
                        onClick={() =>
                          item.submenu
                            ? handleDropdownToggle(item.name)
                            : handleNavigation(item.link)
                        }
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isActiveLink(item.link)
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                          }`}
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

                      {item.submenu && (
                        <div
                          className={`mt-2 space-y-1 overflow-hidden transition-all duration-300 ${activeDropdown === item.name
                            ? 'max-h-64 opacity-100'
                            : 'max-h-0 opacity-0'
                            }`}
                        >
                          {item.submenu.map((sub, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleNavigation(sub.link)}
                              className="w-full flex items-center space-x-3 px-8 py-3 text-gray-400 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all duration-200"
                            >
                              <sub.icon className="w-4 h-4 text-purple-400" />
                              <span>{sub.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
              )}
            </nav>

            {/* User Section (Mobile) */}
            {authStatus && (
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-400">{user?.role || 'Student'}</div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-all duration-200">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </button>
                  <LogoutBtn />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;
