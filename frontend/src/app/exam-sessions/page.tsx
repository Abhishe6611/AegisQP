"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, FilePlus, List } from "lucide-react";

const API = "/api/v1/exams";

export default function ExamSessionsPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("history");
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionFilter, setSessionFilter] = useState("all");
  const [currentEditId, setCurrentEditId] = useState<string | null>(null);

  const [examDetails, setExamDetails] = useState({
    title: "",
    department: "COMPUTER SCIENCE ENGINEERING",
    semester: "SEMESTER 1",
    subject: "",
    courseCode: "",
    duration: "3 Hours",
    teacherEmail: "teacher@university.edu"
  });

  const [blueprint, setBlueprint] = useState([
    { id: 1, section: "Section A (Short Answers)", count: 6, marks: 2 },
    { id: 2, section: "Section B (Long Answers)", count: 6, marks: 5 },
  ]);

  const [courses, setCourses] = useState<any[]>([]);

  const DEFAULT_DEPARTMENTS = ["COMPUTER SCIENCE ENGINEERING", "INFORMATION SCIENCE ENGINEERING", "ELECTRONICS & COMMUNICATION ENGINEERING", "MECHANICAL ENGINEERING", "CIVIL ENGINEERING"];
  const dynamicDepartments = Array.from(new Set(courses.map(c => c.department).filter(Boolean)));
  const allDepartments = Array.from(new Set([...DEFAULT_DEPARTMENTS, ...dynamicDepartments]));

  const filteredCourses = courses.filter(c => 
    (c.department || "").toUpperCase() === (examDetails.department || "").toUpperCase() && 
    (c.semester || "").toUpperCase() === (examDetails.semester || "").toUpperCase()
  );

  // Load sessions from API
  useEffect(() => {
    fetch(`${API}/sessions`)
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.error("Failed to load sessions:", err));
      
    fetch("/api/v1/core/courses")
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error("Failed to load courses:", err));
  }, []);

  const normalizeStatus = (status?: string) => (status || "").toLowerCase().trim();

  const sessionCounts = sessions.reduce(
    (acc, s) => {
      const status = normalizeStatus(s.status);
      acc.all += 1;
      if (status === "assigned to teacher") acc.assigned += 1;
      else if (status === "submitted by teacher") acc.review += 1;
      else if (status === "approved") acc.approved += 1;
      else if (status === "rejected") acc.rejected += 1;
      return acc;
    },
    { all: 0, assigned: 0, review: 0, approved: 0, rejected: 0 }
  );

  const filteredSessions = sessions.filter(s => {
    const status = normalizeStatus(s.status);
    if (sessionFilter === "all") return true;
    if (sessionFilter === "assigned") return status === "assigned to teacher";
    if (sessionFilter === "review") return status === "submitted by teacher";
    if (sessionFilter === "approved") return status === "approved";
    if (sessionFilter === "rejected") return status === "rejected";
    return true;
  });

  const handleAddSection = () => {
    setBlueprint([
      ...blueprint,
      { id: Date.now(), section: "New Section", count: 1, marks: 10 }
    ]);
  };

  const updateSection = (id: number, field: string, value: any) => {
    setBlueprint(blueprint.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const removeSection = (id: number) => {
    setBlueprint(blueprint.filter(b => b.id !== id));
  };

  const handleCreate = async () => {
    const payload = {
      title: examDetails.title,
      department: examDetails.department,
      semester: examDetails.semester,
      subject: examDetails.subject,
      course_code: examDetails.courseCode,
      duration: examDetails.duration,
      teacher_email: examDetails.teacherEmail,
      sections: blueprint.map(b => ({ section: b.section, count: b.count, marks: b.marks })),
    };

    try {
      let result;
      if (currentEditId) {
        const res = await fetch(`${API}/sessions/${currentEditId}`, {
          method: "PUT",
          headers: {
          "ngrok-skip-browser-warning": "69420", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        result = await res.json();
      } else {
        const res = await fetch(`${API}/sessions`, {
          method: "POST",
          headers: {
          "ngrok-skip-browser-warning": "69420", "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        result = await res.json();
      }

      // Reload sessions from API
      const refreshRes = await fetch(`${API}/sessions`);
      const refreshed = await refreshRes.json();
      setSessions(refreshed);

      alert(currentEditId ? "Exam Session Updated and Re-assigned!" : "Exam Session Created and Assigned!");
      setActiveTab("history");
      setCurrentEditId(null);
      
      // Reset form
      setExamDetails({ title: "", department: "Computer Science Engineering", semester: "Semester 5", subject: "Operating Systems", courseCode: "CS501", duration: "3 Hours", teacherEmail: "teacher@university.edu" });
      setBlueprint([
        { id: 1, section: "Section A (Short Answers)", count: 6, marks: 2 },
        { id: 2, section: "Section B (Long Answers)", count: 6, marks: 5 },
      ]);
    } catch (err) {
      console.error("Failed to save session:", err);
      alert("Error saving session. Check console.");
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this exam session?")) return;
    try {
      await fetch(`${API}/sessions/${sessionId}`, { method: "DELETE" });
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error("Failed to delete:", err);
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
            <h1 className="text-xl font-bold tracking-tight uppercase">Exam Sessions</h1>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 border-2 border-black font-bold text-sm uppercase transition-colors ${activeTab === 'history' ? 'bg-[#0a192f] text-white' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              Exam Sessions
            </button>
            <button 
              onClick={() => { setActiveTab("create"); setCurrentEditId(null); }}
              className={`px-4 py-2 border-2 border-black font-bold text-sm uppercase transition-colors ${activeTab === 'create' ? 'bg-[#dc2626] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-y-0' : 'bg-white text-black hover:bg-gray-100'}`}
            >
              Create New
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {activeTab === "history" ? (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase mb-6 border-b-2 border-black pb-4 flex items-center gap-2">
              <List className="w-8 h-8" /> Exam Sessions
            </h2>

            <div className="flex flex-wrap gap-2">
              {[
                { id: "assigned", label: "Assigned", count: sessionCounts.assigned },
                { id: "review", label: "Under Review", count: sessionCounts.review },
                { id: "approved", label: "Approved", count: sessionCounts.approved },
                { id: "rejected", label: "Rejected", count: sessionCounts.rejected },
                { id: "all", label: "All", count: sessionCounts.all },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSessionFilter(tab.id)}
                  className={`px-4 py-2 border-2 border-black font-bold text-xs uppercase transition-colors ${sessionFilter === tab.id ? "bg-[#0a192f] text-white" : "bg-white text-black hover:bg-gray-100"}`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {(() => {
              if (sessions.length === 0) {
                return (
                  <div className="bg-white border-2 border-dashed border-gray-400 p-12 text-center text-gray-500 font-bold uppercase tracking-widest">
                    No Exam Sessions Created Yet
                  </div>
                );
              }
              if (filteredSessions.length === 0) {
                return (
                  <div className="bg-white border-2 border-dashed border-gray-300 p-12 text-center text-gray-500 font-bold uppercase tracking-widest">
                    No Sessions In This Category
                  </div>
                );
              }

              // Build tree: Semester -> Department -> Sessions
              const tree: Record<string, Record<string, any[]>> = {};
              filteredSessions.forEach(s => {
                const sem = s.semester || "Unknown Semester";
                const dept = s.department || "Unknown Department";
                if (!tree[sem]) tree[sem] = {};
                if (!tree[sem][dept]) tree[sem][dept] = [];
                tree[sem][dept].push(s);
              });

              return (
                <div className="space-y-12">
                  {Object.keys(tree).sort().map(sem => (
                    <div key={sem} className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(10,25,47,1)]">
                      <h3 className="text-2xl font-black uppercase mb-6 border-b-4 border-black pb-2 text-[#0a192f]">
                        {sem}
                      </h3>
                      <div className="space-y-8">
                        {Object.keys(tree[sem]).sort().map(dept => (
                          <div key={dept} className="ml-0 md:ml-4 border-l-4 border-[#dc2626] pl-4">
                            <h4 className="text-xl font-bold uppercase mb-4 text-[#dc2626]">{dept}</h4>
                            <div className="space-y-4">
                              {tree[sem][dept].map(session => (
                                <div key={session.id} className="bg-gray-50 border-2 border-black p-4 relative hover:bg-white transition-colors">
                                  <div className="absolute top-4 right-4 flex gap-2">
                                    <button 
                                      onClick={() => {
                                        setExamDetails({
                                          title: session.title,
                                          department: session.department,
                                          semester: session.semester,
                                          subject: session.subject,
                                          courseCode: session.courseCode || "",
                                          duration: session.duration || "3 Hours",
                                          teacherEmail: session.teacherEmail
                                        });
                                        setBlueprint(session.sections.map((s: any, i: number) => ({ id: i + 1, ...s })));
                                        setCurrentEditId(session.id);
                                        setActiveTab("create");
                                      }}
                                      className="px-3 py-1 bg-white border-2 border-black font-bold uppercase text-[10px] hover:bg-gray-100 transition-colors"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(session.id)}
                                      className="px-3 py-1 bg-red-50 border-2 border-red-600 text-red-700 font-bold uppercase text-[10px] hover:bg-red-100 transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div className="flex justify-between items-start mb-3 border-b-2 border-gray-200 pb-3 pr-24">
                                    <div>
                                      <h5 className="text-lg font-black uppercase">{session.title}</h5>
                                      <p className="text-xs font-bold text-gray-600 uppercase">{session.subject} ({session.courseCode})</p>
                                    </div>
                                    <span className="bg-yellow-100 border-2 border-yellow-500 text-yellow-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                                      {session.status}
                                    </span>
                                  </div>
                                  <div className="text-xs font-bold text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                                    <p>Assigned to: <span className="text-black">{session.teacherEmail}</span></p>
                                    <p>Created on: <span className="text-black">{session.createdAt ? new Date(session.createdAt).toLocaleDateString() : "N/A"}</span></p>
                                    <p>Sections: <span className="text-black">{session.sections.length}</span></p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Step 1: Academic Context */}
            <section className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(10,25,47,1)]">
              <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2 border-b-2 border-black pb-4">
                <FilePlus className="w-6 h-6" />
                1. Academic Context
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Exam Title</label>
                  <input type="text" className="w-full border-2 border-black p-3 font-medium" placeholder="e.g. Mid-Term Fall 2026" value={examDetails.title} onChange={e => setExamDetails({...examDetails, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Department</label>
                  <select 
                    className="w-full border-2 border-black p-3 font-medium uppercase" 
                    value={examDetails.department} 
                    onChange={e => {
                      setExamDetails({...examDetails, department: e.target.value, subject: "", courseCode: ""});
                    }}
                  >
                    {allDepartments.map(dept => <option key={dept as string} value={dept as string}>{dept as string}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Semester</label>
                  <select 
                    className="w-full border-2 border-black p-3 font-medium uppercase" 
                    value={examDetails.semester} 
                    onChange={e => {
                      setExamDetails({...examDetails, semester: e.target.value, subject: "", courseCode: ""});
                    }}
                  >
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={`SEMESTER ${s}`}>SEMESTER {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Subject</label>
                  <select 
                    className="w-full border-2 border-black p-3 font-medium" 
                    value={examDetails.subject} 
                    onChange={e => {
                      const selectedCourse = filteredCourses.find(c => c.name === e.target.value);
                      if (selectedCourse) {
                        setExamDetails({...examDetails, subject: selectedCourse.name, courseCode: selectedCourse.code});
                      } else {
                        setExamDetails({...examDetails, subject: e.target.value});
                      }
                    }}
                  >
                    <option value="">Select a Course...</option>
                    {filteredCourses.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    {filteredCourses.length === 0 && <option value="" disabled>No courses available for this selection</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Course Code</label>
                  <input type="text" className="w-full border-2 border-black p-3 font-medium bg-gray-100 cursor-not-allowed" value={examDetails.courseCode} disabled />
                </div>
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Duration</label>
                  <select className="w-full border-2 border-black p-3 font-medium" value={examDetails.duration} onChange={e => setExamDetails({...examDetails, duration: e.target.value})}>
                    <option>2 Hours</option>
                    <option>2 Hours 30 Minutes</option>
                    <option>3 Hours</option>
                  </select>
                </div>
                <div className="md:col-span-2 mt-4">
                  <label className="block text-sm font-bold uppercase mb-2 text-[#dc2626]">Assign to Teacher (Email)</label>
                  <input type="email" className="w-full border-2 border-black p-3 font-bold text-[#dc2626]" value={examDetails.teacherEmail} onChange={e => setExamDetails({...examDetails, teacherEmail: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Step 2: Blueprint Structure */}
            <section className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]">
              <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-4">
                <h2 className="text-2xl font-black uppercase">2. Blueprint Definition</h2>
                <button onClick={handleAddSection} className="text-sm font-bold border-2 border-black px-3 py-1 bg-gray-100 flex items-center gap-1 hover:bg-gray-200">
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              </div>
              
              <div className="space-y-4">
                {blueprint.map((b, index) => (
                  <div key={b.id} className="flex flex-wrap md:flex-nowrap gap-4 items-center bg-gray-50 p-4 border-2 border-black">
                    <span className="font-black text-xl w-6 hidden md:block">{index + 1}.</span>
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-xs font-bold uppercase text-gray-500">Section Name</label>
                      <input type="text" className="w-full bg-transparent font-bold border-b-2 border-black focus:outline-none" value={b.section} onChange={e => updateSection(b.id, "section", e.target.value)} />
                    </div>
                    <div className="w-24">
                      <label className="text-xs font-bold uppercase text-gray-500">Questions</label>
                      <input type="number" className="w-full bg-white border-2 border-black p-2 font-bold text-center" value={b.count} onChange={e => updateSection(b.id, "count", parseInt(e.target.value))} />
                    </div>
                    <div className="w-24">
                      <label className="text-xs font-bold uppercase text-gray-500">Marks Each</label>
                      <input type="number" className="w-full bg-white border-2 border-black p-2 font-bold text-center" value={b.marks} onChange={e => updateSection(b.id, "marks", parseInt(e.target.value))} />
                    </div>
                    <button onClick={() => removeSection(b.id)} className="text-red-500 hover:text-red-700 p-2 mt-4">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <button onClick={handleCreate} className="w-full flex items-center justify-center gap-2 bg-[#0a192f] text-white px-4 py-4 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-wider">
              <Save className="w-5 h-5" />
              {currentEditId ? "UPDATE & RE-ASSIGN" : "PUBLISH & ASSIGN"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
