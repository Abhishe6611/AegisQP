"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, Search, AlertCircle, Printer } from "lucide-react";

const API = "http://localhost:8000/api/v1/exams";

// Map Bloom level names to RBT numbers
const bloomToRBT: Record<string, number> = {
  "Remember": 1, "Understand": 2, "Apply": 3,
  "Analyze": 4, "Evaluate": 5, "Create": 6
};

export default function ReviewQPsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [expandedSem, setExpandedSem] = useState<string | null>(null);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [expandedSubj, setExpandedSubj] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<any>(null);
  const [rejectionComment, setRejectionComment] = useState("");

  useEffect(() => {
    fetch(`${API}/submissions`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a: any, b: any) => (a.status === "PENDING_REVIEW" ? -1 : 1));
        setSubmissions(sorted);
      })
      .catch(err => console.error("Failed to load submissions:", err));
  }, []);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !rejectionComment.trim()) {
      alert("A comment is mandatory when rejecting a Question Paper.");
      return;
    }

    try {
      const res = await fetch(`${API}/submissions/${selectedPaper.id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: status, comment: rejectionComment || null }),
      });

      if (!res.ok) throw new Error("Review failed");

      const refreshRes = await fetch(`${API}/submissions`);
      const refreshed = await refreshRes.json();
      setSubmissions(refreshed.sort((a: any, b: any) => (a.status === "PENDING_REVIEW" ? -1 : 1)));
      
      setSelectedPaper({ ...selectedPaper, status, reviewComment: rejectionComment });
      setRejectionComment("");
      alert(`Question Paper has been ${status}!`);
    } catch (err) {
      console.error("Review error:", err);
      alert("Error reviewing. Check console.");
    }
  };

  // Build the hierarchical tree: Semester -> Department -> Subject -> Submissions
  const tree: any = {};
  submissions.forEach(sub => {
    if (!tree[sub.semester]) tree[sub.semester] = {};
    if (!tree[sub.semester][sub.department]) tree[sub.semester][sub.department] = {};
    if (!tree[sub.semester][sub.department][sub.subject]) tree[sub.semester][sub.department][sub.subject] = [];
    tree[sub.semester][sub.department][sub.subject].push(sub);
  });

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

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-20">
      <nav className="border-b-2 border-black bg-white sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="p-2 border-2 border-transparent hover:border-black transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">Review Submissions</h1>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Shelf Categories */}
        <div className="lg:col-span-3 space-y-6 print:hidden">
          <div className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black uppercase mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
              <Search className="w-5 h-5" /> Shelf Browser
            </h2>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
              {Object.keys(tree).length === 0 && <p className="text-sm font-bold text-gray-500 text-center py-4">No submissions found.</p>}
              
              {Object.keys(tree).sort().map(sem => (
                <div key={sem} className="border-2 border-black">
                  <button 
                    onClick={() => setExpandedSem(expandedSem === sem ? null : sem)}
                    className={`w-full text-left p-3 font-black uppercase text-sm flex justify-between items-center ${expandedSem === sem ? 'bg-[#0a192f] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {sem}
                    <span className="text-xs">{expandedSem === sem ? '▼' : '▶'}</span>
                  </button>
                  
                  {expandedSem === sem && (
                    <div className="p-2 space-y-2 bg-white">
                      {Object.keys(tree[sem]).sort().map(dept => (
                        <div key={dept} className="border border-gray-300">
                          <button 
                            onClick={() => setExpandedDept(expandedDept === dept ? null : dept)}
                            className={`w-full text-left p-2 font-bold uppercase text-xs flex justify-between items-center ${expandedDept === dept ? 'bg-[#dc2626] text-white' : 'bg-gray-50 hover:bg-gray-100'}`}
                          >
                            {dept}
                            <span className="text-[10px]">{expandedDept === dept ? '▼' : '▶'}</span>
                          </button>

                          {expandedDept === dept && (
                            <div className="p-2 space-y-1 bg-white border-t border-gray-200">
                              {Object.keys(tree[sem][dept]).sort().map(subj => (
                                <div key={subj}>
                                  <button 
                                    onClick={() => setExpandedSubj(expandedSubj === subj ? null : subj)}
                                    className={`w-full text-left p-2 font-bold uppercase text-xs flex justify-between items-center ${expandedSubj === subj ? 'bg-blue-100 text-blue-900' : 'bg-white hover:bg-gray-50'}`}
                                  >
                                    {subj}
                                    <span className="text-[10px]">{expandedSubj === subj ? '▼' : '▶'}</span>
                                  </button>
                                  
                                  {expandedSubj === subj && (
                                    <div className="pl-4 py-2 space-y-2 bg-gray-50 border-l-2 border-blue-200 ml-2">
                                      {tree[sem][dept][subj].map((sub: any) => (
                                        <div 
                                          key={sub.id} 
                                          onClick={() => setSelectedPaper(sub)}
                                          className={`p-2 border border-black cursor-pointer transition-all ${selectedPaper?.id === sub.id ? 'bg-[#0a192f] text-white shadow-[2px_2px_0px_0px_rgba(220,38,38,1)]' : 'bg-white hover:bg-gray-100'}`}
                                        >
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-black uppercase truncate">{sub.title}</span>
                                            <span className={`text-[8px] font-bold uppercase px-1 py-0.5 border ${sub.status === 'PENDING_REVIEW' ? 'bg-yellow-200 text-yellow-800 border-yellow-800' : sub.status === 'APPROVED' ? 'bg-green-200 text-green-800 border-green-800' : 'bg-red-200 text-red-800 border-red-800'}`}>
                                              {sub.status === 'PENDING_REVIEW' ? 'PENDING' : sub.status}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Professional QP Template View */}
        <div className="lg:col-span-9">
          {!selectedPaper ? (
            <div className="bg-white border-2 border-black h-[600px] flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              Select a paper to review
            </div>
          ) : (
            <div className="space-y-6 print:space-y-0">
              
              {/* Print Button Header */}
              <div className="flex justify-end print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 bg-[#0a192f] hover:bg-[#112240] text-white font-bold py-2 px-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] uppercase transition-all active:translate-y-1 active:shadow-none"
                >
                  <Printer className="w-5 h-5" />
                  Print / Save as PDF
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
                        Max. Marks: {selectedPaper.paper.reduce((sum: number, q: any) => sum + (q.marks || 0), 0)}
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
                        const sections = groupBySection(selectedPaper.paper);
                        const rows: React.ReactNode[] = [];
                        let qNum = 1;

                        Object.entries(sections).forEach(([sectionName, questions]) => {
                          // Calculate section totals
                          const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);
                          const perQ = questions[0]?.marks || 0;

                          // Section header row
                          rows.push(
                            <tr key={`header-${sectionName}`} className="bg-[#0a192f] break-inside-avoid">
                              <td colSpan={4} className="border-b-2 border-black break-inside-avoid p-0">
                                <div className="p-3 text-white font-black uppercase text-sm tracking-wide break-inside-avoid block">
                                  {sectionName}: Answer any {questions.length} questions. Each carry {perQ} marks. ({questions.length} × {perQ} = {totalMarks})
                                </div>
                              </td>
                            </tr>
                          );

                          // Question rows
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

              {/* Review Actions Panel */}
              {selectedPaper.status === "PENDING_REVIEW" && (
                <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] print:hidden">
                  <h3 className="font-black uppercase flex items-center gap-2 mb-4 border-b-2 border-black pb-3">
                    <AlertCircle className="w-5 h-5 text-[#dc2626]" />
                    COE Review Actions
                  </h3>
                  
                  <textarea
                    className="w-full border-2 border-black p-3 min-h-[100px] focus:outline-none focus:border-[#0a192f] font-medium mb-4"
                    placeholder="Enter rejection comments here (mandatory for rejection)..."
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                  />
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleAction("APPROVED")}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase transition-all active:translate-y-1 active:shadow-none"
                    >
                      <CheckCircle className="w-5 h-5" /> Approve Paper
                    </button>
                    <button 
                      onClick={() => handleAction("REJECTED")}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase transition-all active:translate-y-1 active:shadow-none"
                    >
                      <XCircle className="w-5 h-5" /> Reject Paper
                    </button>
                  </div>
                </div>
              )}

              {selectedPaper.status !== "PENDING_REVIEW" && (
                <div className={`p-6 border-2 font-bold uppercase print:hidden ${selectedPaper.status === 'APPROVED' ? 'bg-green-50 border-green-600 text-green-800' : 'bg-red-50 border-red-600 text-red-800'}`}>
                  This paper was {selectedPaper.status}.
                  {selectedPaper.reviewComment && <div className="mt-2 text-sm font-medium normal-case">Comment: {selectedPaper.reviewComment}</div>}
                </div>
              )}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
