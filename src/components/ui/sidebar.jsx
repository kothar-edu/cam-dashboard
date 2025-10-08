import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  BarChart2,
  Users,
  Trophy,
  User,
  Calendar,
  FileText,
  DollarSign,
  VoteIcon as VoteYea,
  UserCheck,
  RefreshCw,
  FileSpreadsheet,
  BarChart,
  Settings,
  Menu,
  X,
  BirdIcon as Cricket,
  User2Icon,
} from "lucide-react";
import logo from "../../../public/assets/cam-youth (1).png";

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById("sidebar");
      const toggleButton = document.getElementById("sidebar-toggle");

      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        toggleButton &&
        !toggleButton.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart2 },
    { name: "Teams", href: "/dashboard/teams", icon: Users },
    { name: "Tournaments", href: "/dashboard/tournaments", icon: Trophy },
    { name: "Players", href: "/dashboard/players", icon: User2Icon },
    { name: "Users", href: "/dashboard/users", icon: User },
    { name: "Fixtures", href: "/dashboard/fixtures", icon: Calendar },
    { name: "Posts", href: "/dashboard/posts", icon: FileText },
    { name: "Sponsors", href: "/dashboard/sponsors", icon: DollarSign },
    { name: "Voting Polls", href: "/dashboard/voting", icon: VoteYea },
    {
      name: "Player Verification",
      href: "/dashboard/verification",
      icon: UserCheck,
    },
    { name: "Player Transfers", href: "/dashboard/transfers", icon: RefreshCw },
    {
      name: "Scorecards",
      href: "/dashboard/scorecards",
      icon: FileSpreadsheet,
    },
    { name: "Points Table", href: "/dashboard/points", icon: BarChart },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <>
      {/* Mobile menu button */}
      <button
        id="sidebar-toggle"
        type="button"
        className="fixed top-4 left-4 z-50 md:hidden bg-white dark:bg-gray-800 p-2 rounded-md shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-md transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-4 py-5 border-b border-gray-200 dark:border-gray-700">
            <img src={logo} alt="CAM Logo" className="h- w-full text-primary" />
          </div>

          {/* Navigation */}
          <div className="px-4 py-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Navigation
            </h2>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-2 py-2 overflow-y-auto">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? "bg-gray-100 dark:bg-gray-700 text-primary"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={logout}
              className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-3 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export {};
