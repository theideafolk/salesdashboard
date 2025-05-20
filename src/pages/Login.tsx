import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Phone, Mail, Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const Login: React.FC = () => {
  const { signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'asm' | 'admin'>('asm');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // ASM form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [asmPassword, setAsmPassword] = useState('');
  
  // Admin form state
  const [email, setEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleAsmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !asmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn({
        phone: phoneNumber,
        password: asmPassword,
        role: 'asm'
      });
    } catch (error) {
      // Error is handled in the signIn function
      console.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !adminPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn({
        email,
        password: adminPassword,
        role: 'admin'
      });
    } catch (error) {
      // Error is handled in the signIn function
      console.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Demo user credentials - In a real app, these would be removed
  const setDemoCredentials = () => {
    if (activeTab === 'asm') {
      setPhoneNumber('1234567890');
      setAsmPassword('password');
    } else {
      setEmail('admin@example.com');
      setAdminPassword('password');
    }
    toast.success('Demo credentials filled. Click Login to continue.');
  };
  
  return (
    <div className="min-h-screen bg-slate-50 grid place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/Benzorgo_revised_logo.png" 
            alt="Benzorgo Logo" 
            className="h-32 w-auto"
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2">
            <button
              className={cn(
                "py-4 text-center font-medium transition-colors",
                activeTab === 'asm'
                  ? "bg-primary-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
              onClick={() => setActiveTab('asm')}
            >
              Area Sales Manager
            </button>
            <button
              className={cn(
                "py-4 text-center font-medium transition-colors",
                activeTab === 'admin'
                  ? "bg-primary-600 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50"
              )}
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </button>
          </div>
          
          <div className="p-6">
            {/* ASM Form */}
            {activeTab === 'asm' && (
              <form onSubmit={handleAsmSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Area Sales Manager Login
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone size={18} className="text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="input pl-10"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={asmPassword}
                      onChange={(e) => setAsmPassword(e.target.value)}
                      className="input pl-10 pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-slate-500" />
                      ) : (
                        <Eye size={18} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "btn-primary w-full flex items-center justify-center",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            )}
            
            {/* Admin Form */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800 mb-6">
                  Admin Login
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-slate-500" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-10"
                      placeholder="Enter email"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-500" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="input pl-10 pr-10"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-slate-500" />
                      ) : (
                        <Eye size={18} className="text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "btn-primary w-full flex items-center justify-center",
                    isLoading && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            )}
            
            {/* Demo button - would be removed in a production app */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={setDemoCredentials}
                className="text-primary-600 text-sm hover:underline"
              >
                Use demo credentials
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>© 2025 DashPWA. All rights reserved.</p>
          <p className="mt-1">Progressive Web App for Sales Management</p>
        </div>
      </div>
    </div>
  );
};

export default Login;