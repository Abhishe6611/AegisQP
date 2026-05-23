"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, Trash2, Building, PlusCircle, CheckCircle, Search } from "lucide-react";

const API = "/api/v1/core";

export default function SuperadminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("settings");
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [settings, setSettings] = useState({ college_name: "", logo_path: "" });

  const [newUser, setNewUser] = useState({ email: "", password: "", role: "Internal Teacher" });
  
  const [selectedDept, setSelectedDept] = useState("COMPUTER SCIENCE ENGINEERING");
  const [selectedSem, setSelectedSem] = useState("SEMESTER 1");
  const [newCourse, setNewCourse] = useState({ name: "", code: "" });

  const DEPARTMENTS = ["COMPUTER SCIENCE ENGINEERING", "INFORMATION SCIENCE ENGINEERING", "ELECTRONICS & COMMUNICATION ENGINEERING", "MECHANICAL ENGINEERING", "CIVIL ENGINEERING"];
  const SEMESTERS = ["SEMESTER 1", "SEMESTER 2", "SEMESTER 3", "SEMESTER 4", "SEMESTER 5", "SEMESTER 6", "SEMESTER 7", "SEMESTER 8"];

  const [showNewDept, setShowNewDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const dynamicDepartments = Array.from(new Set(courses.map(c => c.department).filter(Boolean)));
  const allDepartments = Array.from(new Set([...DEPARTMENTS, ...dynamicDepartments]));

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "courses") {
        setActiveTab("courses");
      }
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("access_token");
      const headers = { "Authorization": `Bearer ${token}` };
      const [uRes, cRes, sRes] = await Promise.all([
        fetch(`${API}/users`, { headers }),
        fetch(`${API}/courses`, { headers }),
        fetch(`${API}/settings`)
      ]);
      setUsers(await uRes.json());
      setCourses(await cRes.json());
      setSettings(await sRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("access_token");
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420", "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.detail || "Error adding user");
        return;
      }
      setNewUser({ email: "", password: "", role: "Internal Teacher" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = sessionStorage.getItem("access_token");
      await fetch(`${API}/users/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("access_token");
      const payload = {
        ...newCourse,
        department: selectedDept,
        semester: selectedSem
      };
      const res = await fetch(`${API}/courses`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420", "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let errorDetail = "Error adding course";
        try {
          const d = await res.json();
          errorDetail = d.detail || errorDetail;
        } catch(e) {
          errorDetail = `Server error: ${res.status}`;
        }
        alert(errorDetail);
        return;
      }
      setNewCourse({ name: "", code: "" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const token = sessionStorage.getItem("access_token");
      await fetch(`${API}/courses/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("access_token");
      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420", "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("Settings updated successfully!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-20">
      <nav className="border-b-2 border-black bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="p-2 border-2 border-transparent hover:border-black transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">Superadmin Dashboard</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex">
          <button 
            className={`px-6 py-3 font-black uppercase text-sm border-2 border-b-0 border-black transition-colors ${activeTab === 'settings' ? 'bg-white text-black' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings & Users
          </button>
          <button 
            className={`px-6 py-3 font-black uppercase text-sm border-2 border-l-0 border-b-0 border-black transition-colors ${activeTab === 'courses' ? 'bg-white text-black' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
            onClick={() => setActiveTab('courses')}
          >
            Course Management
          </button>
        </div>
        <div className="border-t-2 border-black -mt-[2px]"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: System Settings */}
            <div className="lg:col-span-6 space-y-8">
          
          {/* Settings Section */}
          <section className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2">
              <Building className="w-5 h-5" /> College Settings
            </h2>
            <form onSubmit={handleUpdateSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-gray-600">College Name</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-black p-2 font-bold" 
                  value={settings.college_name} 
                  onChange={e => setSettings({...settings, college_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-gray-600">College Logo Path</label>
                <input 
                  type="text" 
                  className="w-full border-2 border-black p-2 font-bold" 
                  value={settings.logo_path} 
                  onChange={e => setSettings({...settings, logo_path: e.target.value})}
                  placeholder="e.g. /clglogo.png"
                />
              </div>
              <button type="submit" className="w-full bg-[#0a192f] text-white font-bold py-2 border-2 border-black hover:bg-[#112240] transition-colors uppercase text-sm">
                Save Settings
              </button>
            </form>
          </section>

          </div>

          {/* Right Column: User Management */}
          <div className="lg:col-span-6">
            <section className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] h-full">
            <h2 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-2 border-black pb-2 text-[#dc2626]">
              <UserPlus className="w-5 h-5" /> User Access Management
            </h2>

            <form onSubmit={handleAddUser} className="mb-6 bg-red-50 p-4 border-2 border-dashed border-red-300">
              <h3 className="text-sm font-bold uppercase mb-3 text-red-800">Provision New User</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full border-2 border-black p-2 text-sm font-bold"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Password</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full border-2 border-black p-2 text-sm font-bold"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase mb-1">Role</label>
                  <select 
                    className="w-full border-2 border-black p-2 text-sm font-bold bg-white"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option>Internal Teacher</option>
                    <option>COE</option>
                    <option>SUPERADMIN</option>
                  </select>
                </div>
                <button type="submit" className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold px-6 py-2 border-2 border-black uppercase text-sm">
                  Add User
                </button>
              </div>
            </form>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              <h3 className="text-sm font-bold uppercase mb-2 text-gray-600">Active Users in System</h3>
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-4 border-2 border-black bg-white">
                  <div>
                    <p className="font-bold text-sm">{u.email}</p>
                    <span className={`inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 border ${
                      u.role === 'SUPERADMIN' ? 'bg-red-100 text-red-800 border-red-300' :
                      u.role === 'COE' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      'bg-gray-100 text-gray-800 border-gray-300'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  {u.role !== 'SUPERADMIN' && (
                    <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 border-2 border-transparent hover:border-red-200 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      )}

      {activeTab === 'courses' && (
        <section className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-2">
            <Search className="w-6 h-6" /> Course Management
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Select Department</label>
              {showNewDept ? (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ENTER DEPARTMENT NAME" 
                    className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-black uppercase"
                    value={newDeptName}
                    onChange={(e) => {
                      setNewDeptName(e.target.value.toUpperCase());
                      setSelectedDept(e.target.value.toUpperCase());
                    }}
                    autoFocus
                  />
                  <button onClick={() => { setShowNewDept(false); setSelectedDept(allDepartments[0] || ""); }} className="bg-gray-200 border-2 border-black px-4 font-bold uppercase text-xs hover:bg-gray-300">Cancel</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select 
                    className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-black uppercase"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    {allDepartments.map(dept => <option key={dept as string} value={dept as string}>{dept as string}</option>)}
                  </select>
                  <button onClick={() => { setShowNewDept(true); setNewDeptName(""); setSelectedDept(""); }} className="bg-white border-2 border-black px-4 font-bold uppercase text-xs whitespace-nowrap hover:bg-gray-100 flex items-center gap-1">
                    <PlusCircle className="w-4 h-4" /> Add New
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold uppercase mb-2">Select Semester</label>
              <select 
                className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-2 focus:ring-black"
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
              >
                {SEMESTERS.map(sem => <option key={sem} value={sem}>{sem}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-gray-300 pt-6">
            <form onSubmit={handleAddCourse} className="mb-6 bg-blue-50 p-6 border-2 border-black">
              <h3 className="text-sm font-black uppercase mb-4 text-blue-900">Add Course to {selectedDept} - {selectedSem}</h3>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase mb-1">Course Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Operating Systems" 
                    required
                    className="w-full border-2 border-black p-2 text-sm font-bold"
                    value={newCourse.name}
                    onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                  />
                </div>
                <div className="w-48">
                  <label className="block text-xs font-bold uppercase mb-1">Course Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CS101" 
                    required
                    className="w-full border-2 border-black p-2 text-sm font-bold uppercase"
                    value={newCourse.code}
                    onChange={e => setNewCourse({...newCourse, code: e.target.value})}
                  />
                </div>
                <div className="mt-5">
                  <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 border-2 border-black font-black uppercase transition-colors h-[40px] flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase mb-3 border-b-2 border-gray-200 pb-2">
                Courses in {selectedDept} - {selectedSem}
              </h3>
              {courses.filter(c => c.department === selectedDept && c.semester === selectedSem).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.filter(c => c.department === selectedDept && c.semester === selectedSem).map(c => (
                    <div key={c.id} className="flex justify-between items-center p-4 border-2 border-black hover:bg-gray-50 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px]">
                      <div>
                        <span className="font-bold block text-sm">{c.name}</span>
                        <span className="mt-1 inline-block text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 uppercase">{c.code}</span>
                      </div>
                      <button onClick={() => handleDeleteCourse(c.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 border-2 border-transparent hover:border-red-200 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-gray-300 bg-gray-50">
                  <p className="text-sm font-bold text-gray-400 uppercase">No courses found for this combination.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      </main>
    </div>
  );
}
