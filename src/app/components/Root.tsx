import { Outlet, Link, useLocation } from "react-router";
import { 
  Home, 
  Package, 
  Wrench, 
  Users, 
  FileText, 
  Archive, 
  Shield, 
  Calendar, 
  AlertCircle,
  Search as SearchIcon,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { Button } from "./ui/button";
import { toast } from "sonner";

export function Root() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/products", icon: Package, label: "Products" },
    { path: "/services", icon: Wrench, label: "Services" },
    { path: "/customers", icon: Users, label: "Customers" },
    { path: "/billing", icon: FileText, label: "Billing" },
    { path: "/inventory", icon: Archive, label: "Inventory" },
    { path: "/warranty", icon: Shield, label: "Warranty" },
    { path: "/schedule", icon: Calendar, label: "Schedule" },
    { path: "/defects", icon: AlertCircle, label: "Defects" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900">ProductivityHub</h1>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            <User className="w-3 h-3" />
            {user?.user_metadata?.name || user?.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/search">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <SearchIcon className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <button 
            onClick={handleSignOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-2 py-2 shadow-lg">
        <div className="flex justify-around items-center">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                  isActive 
                    ? "text-blue-600 bg-blue-50" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}