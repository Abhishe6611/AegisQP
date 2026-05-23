"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Save, FileText, Bot, AlertCircle } from "lucide-react";

const API = "/api/v1/exams";

const bloomToRBT: Record<string, number> = {
  "Remember": 1,
  "Understand": 2,
  "Apply": 3,
  "Analyze": 4,
  "Evaluate": 5,
  "Create": 6
};

export default function QPBuilderPage() {
  const router = useRouter();
  
  const [assignments, setAssignments] = useState<any[]>([]);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);
  const [finalPaper, setFinalPaper] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collegeLogo, setCollegeLogo] = useState("/clglogo.png");

  useEffect(() => {
    // Fetch College Settings for Logo
    fetch(`${API}/core/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.logo_path) setCollegeLogo(data.logo_path);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSelectBlueprint = (selectedBlueprint: any) => {
    setBlueprint(selectedBlueprint);
    const slots: any[] = [];
    if (selectedBlueprint && selectedBlueprint.sections) {
      for (let s = 0; s < selectedBlueprint.sections.length; s++) {
        const section = selectedBlueprint.sections[s];
        const count = Number(section.count) || 0;
        const marks = Number(section.marks) || 0;
        for (let i = 0; i < count; i++) {
          slots.push({
            id: `sec-${s}-q-${i}`,
            sectionIndex: s,
            sectionName: section.section,
            marks: marks,
            text: "",
            targetLevel: marks > 2 ? "Analyze" : "Understand",
            indexInSection: i + 1
          });
        }
      }
    }
    setQuestions(slots);
    setFinalPaper([]);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    const teacherEmail = sessionStorage.getItem("user_email") || "teacher@university.edu";
    
    fetch(`${API}/sessions/active?teacher_email=${encodeURIComponent(teacherEmail)}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAssignments(data);
          handleSelectBlueprint(data[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch blueprint:", err);
        setError("Failed to connect to server");
        setLoading(false);
      });
  }, []);

  const updateQuestion = (id: string, field: string, value: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };
  const handleBatchTransform = async () => {
    const hasEmpty = questions.some(q => q.text.trim() === "");
    if (hasEmpty) {
      alert("Please fill in all the required questions dictated by the Blueprint before transforming.");
      return;
    }

    setIsTransforming(true);

    try {
      const token = sessionStorage.getItem("access_token");
      const res = await fetch(`${API}/ai-transform`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420", "Content-Type": "application/json" },
        body: JSON.stringify({ questions })
      });

      if (!res.ok) {
        throw new Error("AI Transformation failed");
      }

      const data = await res.json();
      setFinalPaper(data.questions);
    } catch (err) {
      console.error("Transform error:", err);
      alert("Error during AI transformation. Please check the console and ensure backend is running with Gemini API key.");
    } finally {
      setIsTransforming(false);
    }
  };

  const handleSubmitToCOE = async () => {
    if (finalPaper.length === 0) {
      alert("You must transform the paper before submitting.");
      return;
    }

    try {
      const token = sessionStorage.getItem("access_token");
      const res = await fetch(`${API}/submissions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "ngrok-skip-browser-warning": "69420", "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_session_id: blueprint.id,
          title: blueprint.title,
          department: blueprint.department,
          semester: blueprint.semester,
          subject: blueprint.subject,
          teacher_email: sessionStorage.getItem("user_email") || "teacher@university.edu",
          paper: finalPaper,
        }),
      });

      if (!res.ok) throw new Error("Submission failed");

      alert("Question Paper Submitted Successfully for COE Review!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Error submitting. Check console.");
    }
  };

  // --- RENDER ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
        <span className="font-bold uppercase tracking-widest animate-pulse">Loading blueprint from server...</span>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-black p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-black uppercase mb-2">No Active Blueprint Assigned</h1>
        <p className="text-gray-500 mb-6">The COE has not assigned a Question Paper blueprint to you yet.</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button onClick={() => router.push("/dashboard")} className="px-6 py-2 bg-black text-white font-bold hover:bg-gray-800 transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-20">
      <nav className="border-b-2 border-black bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 border-2 border-transparent hover:border-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase">Assigned Paper Blueprint</h1>
          </div>

          <button
            onClick={handleSubmitToCOE}
            className="flex items-center gap-2 bg-[#0a192f] text-white px-4 py-2 border-2 border-black font-bold text-sm shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:translate-y-1 hover:shadow-[0px_0px_0px_0px_rgba(220,38,38,1)] transition-all"
          >
            <Save className="w-4 h-4" />
            SUBMIT TO COE
          </button>
        </div>
      </nav>

      <main className="max-w-[95%] xl:max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {assignments.length > 1 && (
          <div className="lg:col-span-12 mb-2">
            <h2 className="text-sm font-black uppercase text-gray-500 mb-3">Pending Assignments ({assignments.length})</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {assignments.map(a => (
                <button
                  key={a.id}
                  onClick={() => handleSelectBlueprint(a)}
                  className={`flex-shrink-0 px-6 py-4 border-2 border-black font-bold uppercase transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none text-left ${blueprint?.id === a.id ? "bg-[#0a192f] text-white" : "bg-white text-black"}`}
                >
                  <div className="text-lg">{a.subject}</div>
                  <div className="text-xs mt-1 opacity-80">{a.courseCode} | {a.semester}</div>
                  <div className={`text-[10px] mt-2 inline-block px-2 py-1 border ${a.status === 'REJECTED' ? 'bg-red-500 border-red-700 text-white' : 'bg-gray-200 border-black text-black'}`}>
                    {a.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Left Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#0a192f] text-white p-6 border-2 border-black shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]">
            <h2 className="text-2xl font-black uppercase mb-2">{blueprint.title || "Untitled Exam"}</h2>
            <p className="text-gray-300 font-bold uppercase text-sm mb-4">
              {blueprint.department} | {blueprint.semester} | {blueprint.subject}
            </p>
            <div className="flex items-center gap-2 bg-red-500/20 text-red-300 p-2 text-sm border border-red-500/50">
              <AlertCircle className="w-4 h-4" />
              <span>You must strictly follow the section counts and marks assigned below.</span>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(10,25,47,1)]">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-black pb-4">
              <Bot className="w-6 h-6 text-[#dc2626]" />
              <h2 className="text-xl font-black uppercase">Batch AI Transformer</h2>
            </div>

            <div className="space-y-8 max-h-[55vh] overflow-y-auto pr-2">
              {blueprint.sections.map((section: any, sIdx: number) => (
                <div key={`section-${sIdx}`} className="mb-8">
                  <h3 className="font-black text-lg uppercase bg-gray-100 p-2 border-2 border-black mb-4 flex justify-between">
                    <span>{section.section}</span>
                    <span>{section.count} Questions x {section.marks} Marks</span>
                  </h3>

                  <div className="space-y-4 pl-4 border-l-4 border-[#0a192f]">
                    {questions.filter(q => q.sectionIndex === sIdx).map(q => (
                      <div key={q.id} className="p-4 border-2 border-black bg-white relative">
                        <div className="flex gap-4">
                          <div className="font-black text-[#0a192f] mt-2">Q{q.indexInSection}.</div>
                          <div className="flex-1 space-y-3">
                            <textarea
                              className="w-full border-2 border-black p-3 min-h-[80px] focus:outline-none focus:ring-0 focus:border-[#dc2626] transition-colors bg-white text-black"
                              placeholder={`Enter question for ${section.marks} marks...`}
                              value={q.text}
                              onChange={(e) => updateQuestion(q.id, "text", e.target.value)}
                            />
                            <div className="flex items-center gap-3">
                              <label className="text-xs font-bold uppercase text-gray-500 whitespace-nowrap">Target Bloom:</label>
                              <select
                                className="flex-1 border-2 border-black p-2 focus:outline-none bg-gray-50 font-medium text-sm"
                                value={q.targetLevel}
                                onChange={(e) => updateQuestion(q.id, "targetLevel", e.target.value)}
                              >
                                <option value="Remember">1. Remember</option>
                                <option value="Understand">2. Understand</option>
                                <option value="Apply">3. Apply</option>
                                <option value="Analyze">4. Analyze</option>
                                <option value="Evaluate">5. Evaluate</option>
                                <option value="Create">6. Create</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t-2 border-black">
              <button
                onClick={handleBatchTransform}
                disabled={isTransforming}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold py-4 border-2 border-black flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
              >
                {isTransforming ? (
                  <span className="animate-pulse">Batch Transforming via Qwen2.5...</span>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Batch AI Transform Entire Paper
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-6">
          <div className="bg-white border-2 border-black p-8 min-h-[600px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sticky top-24">
            <div className="mb-6">
              {/* Header with Logo and USN */}
              <div className="flex justify-between items-center mb-4">
                <div className="w-[120px]">
                  <img src={collegeLogo} alt="College Logo" className="w-full h-auto object-contain" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase">USN</span>
                  <div className="flex">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="w-5 h-6 border-2 border-black border-r-0 last:border-r-2" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Header: University / Exam Info */}
              <div className="text-center pb-2">
                <h2 className="text-lg font-black uppercase tracking-wide mb-1">{blueprint.semester}: {blueprint.title || "Semester End Examination"}</h2>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">{blueprint.department}</p>
              </div>

              {/* Course Info Table */}
              <table className="w-full border-y-2 border-black border-collapse mb-0 mt-4">
                <tbody>
                  <tr>
                    <td className="border-b-2 border-r-2 border-black p-2 text-[11px] font-bold w-1/2">
                      Course Code (CC): {blueprint.courseCode || "N/A"}
                    </td>
                    <td className="border-b-2 border-r-2 border-black p-2 text-[11px] font-bold w-1/4">
                      Duration: {blueprint.duration || "3 Hours"}
                    </td>
                    <td className="border-b-2 border-black p-2 text-[11px] font-bold w-1/4">
                      Max. Marks: {finalPaper.reduce((sum: number, q: any) => sum + (q.marks || 0), 0)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="border-b-2 border-black p-2 text-[11px] font-bold">
                      Course Name: {blueprint.subject}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {finalPaper.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 border-2 border-dashed border-gray-300 bg-gray-50">
                <FileText className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium uppercase tracking-widest text-center">Preview is empty<br /><span className="text-xs">Fill out the blueprint and transform</span></p>
              </div>
            ) : (
              <div className="overflow-x-auto">
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
                      const rows: React.ReactNode[] = [];
                      let globalQNum = 1;

                      blueprint.sections.forEach((section: any, sIdx: number) => {
                        const sectionQuestions = finalPaper.filter(q => q.sectionIndex === sIdx);
                        if (sectionQuestions.length === 0) return;

                        rows.push(
                          <tr key={`header-${sIdx}`} className="bg-[#0a192f] break-inside-avoid">
                            <td colSpan={4} className="border-b-2 border-black break-inside-avoid p-0">
                              <div className="p-3 text-white font-black uppercase text-sm tracking-wide break-inside-avoid block">
                                {section.section}: Answer any {sectionQuestions.length} questions. Each carry {section.marks} marks. ({sectionQuestions.length} × {section.marks} = {sectionQuestions.length * section.marks})
                              </div>
                            </td>
                          </tr>
                        );

                        sectionQuestions.forEach((q: any) => {
                          const rbtNum = bloomToRBT[q.targetLevel] || 0;
                          const rbtLabel = `L${rbtNum} (${q.targetLevel})`;

                          rows.push(
                            <tr key={q.id} className="hover:bg-blue-50/30 transition-colors break-inside-avoid">
                              <td className="border-b-2 border-r-2 border-black p-0 align-top break-inside-avoid">
                                <div className="p-3 text-center font-bold break-inside-avoid block">{globalQNum}.</div>
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
                          globalQNum++;
                        });
                      });
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
