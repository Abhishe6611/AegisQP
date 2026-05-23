"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Printer, CheckCircle, XCircle, Clock } from "lucide-react";

const API = "/api/v1/exams";

// Map Bloom level names to RBT numbers
const bloomToRBT: Record<string, number> = {
  "Remember": 1, "Understand": 2, "Apply": 3,
  "Analyze": 4, "Evaluate": 5, "Create": 6
};

export default function PastSubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
        router.push("/login");
        return;
    }
    const teacherEmail = sessionStorage.getItem("user_email") || "teacher@university.edu";
    fetch(`${API}/submissions?teacher_email=${encodeURIComponent(teacherEmail)}`, {
        headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSubmissions(data);
        if (data.length > 0) {
          setSelectedPaper(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load submissions:", err);
        setLoading(false);
      });
  }, []);

  // Group questions by section for the template view
  const groupBySection = (paper: any[]) => {
    const groups: Record<string, any[]> = {};
    for (const q of paper) {
      const key = q.sectionName || "Uncategorized";
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    }
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
        <span className="font-bold uppercase tracking-widest animate-pulse">Loading submissions...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-20">
      <nav className="border-b-2 border-black bg-white sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="p-2 border-2 border-transparent hover:border-black transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">Past Submissions</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Submissions List */}
        <div className="lg:col-span-3 space-y-6 print:hidden">
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black uppercase mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
              <Search className="w-5 h-5" /> My Papers
            </h2>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {submissions.length === 0 && <p className="text-sm font-bold text-gray-500 text-center py-4">No submissions found.</p>}
              
              {submissions.map((sub: any) => (
                <div 
                  key={sub.id} 
                  onClick={() => setSelectedPaper(sub)}
                  className={`p-3 border-2 border-black cursor-pointer transition-all ${selectedPaper?.id === sub.id ? 'bg-[#0a192f] text-white shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] translate-x-1' : 'bg-white hover:bg-gray-50'}`}
                >
                  <div className="font-black uppercase text-sm mb-1">{sub.subject}</div>
                  <div className={`text-xs mb-2 ${selectedPaper?.id === sub.id ? 'text-gray-300' : 'text-gray-600'}`}>
                    {sub.semester} | {sub.courseCode}
                  </div>
                  <div className="flex justify-between items-center mt-2 border-t border-gray-400/30 pt-2">
                    <span className="text-[10px] uppercase font-bold opacity-80">
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 flex items-center gap-1 border ${
                      sub.status === 'PENDING_REVIEW' ? 'bg-yellow-100 text-yellow-800 border-yellow-800' : 
                      sub.status === 'APPROVED' ? 'bg-green-100 text-green-800 border-green-800' : 
                      'bg-red-100 text-red-800 border-red-800'
                    }`}>
                      {sub.status === 'PENDING_REVIEW' && <Clock className="w-3 h-3" />}
                      {sub.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                      {sub.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {sub.status === 'PENDING_REVIEW' ? 'PENDING' : sub.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: QP Template View */}
        <div className="lg:col-span-9">
          {!selectedPaper ? (
            <div className="bg-white border-2 border-black h-[600px] flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              Select a paper to view
            </div>
          ) : (
            <div className="space-y-6 print:space-y-0">
              
              {/* Status Header & Action */}
              <div className="flex justify-between items-center print:hidden bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <h3 className="font-black uppercase text-lg mb-1">Status: {selectedPaper.status}</h3>
                  {selectedPaper.reviewComment && (
                    <p className="text-sm font-medium text-gray-600">COE Comment: {selectedPaper.reviewComment}</p>
                  )}
                </div>
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-[#0a192f] hover:bg-[#112240] text-white font-bold py-2 px-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] uppercase transition-all active:translate-y-1 active:shadow-none"
                >
                  <Printer className="w-5 h-5" />
                  Print / PDF
                </button>
              </div>

              {/* The Formal Question Paper Template */}
              <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] print:shadow-none print:m-0 print:p-0 overflow-hidden mb-12">
                
                {/* Header with Logo and USN */}
                <div className="flex justify-between items-center p-4">
                  <div className="w-[180px]">
                    <img src="/clglogo.png" alt="College Logo" className="w-full h-auto object-contain" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm uppercase">USN</span>
                    <div className="flex">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="w-7 h-8 border-2 border-black border-r-0 last:border-r-2" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Header: University / Exam Info */}
                <div className="text-center pb-2">
                  <h2 className="text-xl font-black uppercase tracking-wide mb-1">{selectedPaper.semester}: {selectedPaper.title || "Semester End Examination"}</h2>
                  <p className="text-sm font-bold uppercase tracking-wider text-gray-500">{selectedPaper.department}</p>
                </div>

                {/* Course Info Table */}
                <table className="w-full border-y-2 border-black border-collapse mb-0">
                  <tbody>
                    <tr>
                      <td className="border-b-2 border-r-2 border-black p-2 text-sm font-bold w-1/2">
                        Course Code (CC): {selectedPaper.courseCode || "N/A"}
                      </td>
                      <td className="border-b-2 border-r-2 border-black p-2 text-sm font-bold w-1/4">
                        Duration: {selectedPaper.duration || "3 Hours"}
                      </td>
                      <td className="border-b-2 border-black p-2 text-sm font-bold w-1/4">
                        Max. Marks: {selectedPaper.paper?.reduce((sum: number, q: any) => sum + (q.marks || 0), 0) || 0}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="border-b-2 border-black p-2 text-sm font-bold">
                        Course Name: {selectedPaper.subject}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Questions Table */}
                <div>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border-b-2 border-r-2 border-black p-2 text-center text-xs font-black uppercase w-12">Q.No</th>
                        <th className="border-b-2 border-r-2 border-black p-2 text-left text-xs font-black uppercase">Question</th>
                        <th className="border-b-2 border-r-2 border-black p-2 text-center text-xs font-black uppercase w-16">Marks</th>
                        <th className="border-b-2 border-black p-2 text-center text-xs font-black uppercase w-24">RBT Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        if (!selectedPaper.paper || !Array.isArray(selectedPaper.paper)) return null;

                        const sections = groupBySection(selectedPaper.paper);
                        const rows: React.ReactNode[] = [];
                        let qNum = 1;

                        Object.entries(sections).forEach(([sectionName, questions]) => {
                          const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);
                          const perQ = questions[0]?.marks || 0;

                          rows.push(
                            <tr key={`header-${sectionName}`} className="bg-[#0a192f] break-inside-avoid">
                              <td colSpan={4} className="border-b-2 border-black break-inside-avoid p-0">
                                <div className="p-3 text-white font-black uppercase text-sm tracking-wide break-inside-avoid block">
                                  {sectionName}: Answer any {questions.length} questions. Each carry {perQ} marks. ({questions.length} × {perQ} = {totalMarks})
                                </div>
                              </td>
                            </tr>
                          );

                          questions.forEach((q: any) => {
                            const rbtNum = bloomToRBT[q.targetLevel] || 0;
                            const rbtLabel = `L${rbtNum} (${q.targetLevel})`;

                            rows.push(
                              <tr key={`q-${qNum}`} className="hover:bg-blue-50/30 transition-colors break-inside-avoid">
                                <td className="border-b-2 border-r-2 border-black p-0 align-top break-inside-avoid">
                                  <div className="p-3 text-center font-bold break-inside-avoid block">{qNum}.</div>
                                </td>
                                <td className="border-b-2 border-r-2 border-black p-0 align-top break-inside-avoid">
                                  <div className="p-3 text-justify break-inside-avoid block">
                                    <p className="leading-relaxed">{((q.transformedText || q.text) || "").replace(/^\[.*?\]\s*/, "")}</p>
                                  </div>
                                </td>
                                <td className="border-b-2 border-r-2 border-black p-0 align-top break-inside-avoid">
                                  <div className="p-3 text-center font-bold break-inside-avoid block">{q.marks}</div>
                                </td>
                                <td className="border-b-2 border-black p-0 align-top break-inside-avoid">
                                  <div className="p-3 text-center break-inside-avoid block">
                                    <span className={`inline-block px-2 py-1 text-[11px] font-bold uppercase border border-black ${
                                      rbtNum <= 2 ? 'bg-gray-200' :
                                      rbtNum <= 4 ? 'bg-gray-300' :
                                      'bg-gray-400'
                                    }`}>
                                      {rbtLabel}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                            qNum++;
                          });
                        });

                        return rows;
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-black p-4 text-center bg-gray-50">
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">***********</p>
                </div>

                {/* Submission Info */}
                <div className="border-t-2 border-black p-4 bg-gray-100 flex justify-between items-center text-xs font-bold text-gray-500 uppercase">
                  <span>Submitted by: {selectedPaper.teacherEmail}</span>
                  <span>{selectedPaper.submittedAt ? new Date(selectedPaper.submittedAt).toLocaleString() : "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
