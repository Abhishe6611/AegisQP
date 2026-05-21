"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Calendar, Edit3, ShieldAlert, FileText, CheckCircle, Bell, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/v1/auth/me", {
          headers: {
          "ngrok-skip-browser-warning": "69420",
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Session expired");

        const userData = await response.json();
        setUser(userData);
        
      } catch (err: any) {
        alert("DASHBOARD ERROR: " + err.message);
        localStorage.removeItem("access_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
      <span className="font-bold uppercase tracking-widest animate-pulse">Loading secure session...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      
      {/* Top Navbar */}
      <nav className="border-b-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0a192f] flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">ExamCell</h1>
            <span className="ml-4 px-2 py-1 bg-gray-200 border border-black text-xs font-bold uppercase tracking-wider">
              {user?.role || "USER"}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-gray-500 hidden md:block">{user?.email}</span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-bold hover:text-[#dc2626] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              SIGN OUT
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        
        {/* COE Dashboard */}
        {user?.role === "COE" && (
          <>
            <header className="mb-12">
              <h2 className="text-4xl font-black text-[#0a192f] mb-2 uppercase">Command Center</h2>
              <p className="text-gray-600 font-medium">Manage examination workflows and review submissions.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div 
                onClick={() => router.push("/exam-sessions")}
                className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(10,25,47,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(10,25,47,1)] transition-all cursor-pointer"
              >
                <Calendar className="w-8 h-8 text-[#0a192f] mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase">Exam Sessions</h3>
                <p className="text-sm text-gray-600">Create new examinations, view history, and assign blueprints to teachers.</p>
              </div>

              <div 
                onClick={() => router.push("/review-qps")}
                className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] transition-all cursor-pointer"
              >
                <CheckCircle className="w-8 h-8 text-[#dc2626] mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase">Review Submissions</h3>
                <p className="text-sm text-gray-600">Approve or reject submitted question papers from teachers.</p>
              </div>
            </div>
          </>
        )}

        {/* Super Admin Dashboard */}
        {user?.role === "SUPERADMIN" && (
          <>
            <header className="mb-12">
              <h2 className="text-4xl font-black text-[#0a192f] mb-2 uppercase">System Administration</h2>
              <p className="text-gray-600 font-medium">Global governance and immutable security monitoring.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div 
                onClick={() => router.push("/audit-logs")}
                className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col items-start"
              >
                <ShieldAlert className="w-8 h-8 text-black mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase">Audit Logs</h3>
                <p className="text-sm text-gray-600">Review immutable security logs of system activities.</p>
              </div>
              <div 
                onClick={() => router.push("/superadmin")}
                className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] transition-all cursor-pointer flex flex-col items-start"
              >
                <ShieldAlert className="w-8 h-8 text-[#dc2626] mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase">Global Settings</h3>
                <p className="text-sm text-gray-600">Manage college branding and provision system users.</p>
              </div>
              <div 
                onClick={() => router.push("/superadmin?tab=courses")}
                className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] transition-all cursor-pointer flex flex-col items-start"
              >
                <BookOpen className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase">Course Management</h3>
                <p className="text-sm text-gray-600">Configure academic hierarchy: Departments, Semesters, and Courses.</p>
              </div>
            </div>
          </>
        )}

        {/* Teacher Dashboard */}
        {user?.role === "Teacher" && (
          <>
            <header className="mb-12">
              <h2 className="text-4xl font-black text-[#0a192f] mb-2 uppercase">Teacher Dashboard</h2>
              <p className="text-gray-600 font-medium">Welcome back. You have pending assignments.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <div 
                onClick={() => router.push("/qp-builder")}
                className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] transition-all cursor-pointer"
              >
                <Edit3 className="w-8 h-8 text-[#dc2626] mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase">Draft Question Paper</h3>
                <p className="text-sm text-gray-600">Start drafting a new paper using the AI Bloom Transformer.</p>
              </div>

              <div 
                onClick={() => router.push("/past-submissions")}
                className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(10,25,47,1)] hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(10,25,47,1)] transition-all cursor-pointer"
              >
                <FileText className="w-8 h-8 text-[#0a192f] mb-4" />
                <h3 className="text-xl font-bold mb-2 uppercase">Past Submissions</h3>
                <p className="text-sm text-gray-600">View previously submitted and approved papers.</p>
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}
