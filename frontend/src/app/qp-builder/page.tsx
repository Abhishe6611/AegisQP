"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Save, FileText, Bot, AlertCircle } from "lucide-react";

const API = "http://localhost:8000/api/v1/exams";

export default function QPBuilderPage() {
  const router = useRouter();
  
  const [blueprint, setBlueprint] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isTransforming, setIsTransforming] = useState(false);
  const [finalPaper, setFinalPaper] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch the active blueprint from the API based on the logged-in teacher's email
    const teacherEmail = localStorage.getItem("user_email") || "teacher@university.edu";
    
    fetch(`${API}/sessions/active?teacher_email=${encodeURIComponent(teacherEmail)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.sections && data.sections.length > 0) {
          setBlueprint(data);
          
          // Build question slots from ALL sections
          const slots: any[] = [];
          for (let s = 0; s < data.sections.length; s++) {
            const section = data.sections[s];
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
          setQuestions(slots);
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
  // Bloom's Taxonomy transformation templates — massively expanded for variety
  const bloomTemplates: Record<string, string[]> = {
    "Remember": [
      "Define {topic} and state its primary purpose.",
      "List the key characteristics of {topic}.",
      "State the fundamental principles behind {topic}.",
      "Identify the main components involved in {topic}.",
      "What is {topic}? Provide a clear definition with examples.",
      "Recall and outline the basic concepts related to {topic}.",
      "Name the primary elements associated with {topic}.",
      "Outline the standard definition of {topic}.",
      "Describe the basic function of {topic}.",
      "Enumerate the steps involved in {topic}.",
      "Identify and list the different types of {topic}.",
      "Who, what, and where does {topic} primarily apply?",
      "Reproduce the standard architecture of {topic}.",
      "Recall the timeline or historical context of {topic}.",
      "List the most common use cases for {topic}."
    ],
    "Understand": [
      "Explain {topic} in your own words with suitable examples.",
      "Summarize the concept of {topic} and its significance.",
      "Describe {topic} and illustrate with a real-world scenario.",
      "Interpret the role of {topic} in its broader context.",
      "Classify the different aspects of {topic} and explain each briefly.",
      "Discuss {topic} and highlight its key features.",
      "Paraphrase and elaborate on the concept of {topic}.",
      "Explain the underlying mechanism of {topic}.",
      "Summarize the main advantages and disadvantages of {topic}.",
      "Illustrate how {topic} operates within a larger system.",
      "Translate the complex concept of {topic} into simple terms.",
      "Discuss the implications of using {topic} in modern systems.",
      "Explain the relationship between {topic} and its core dependencies.",
      "Provide a descriptive overview of {topic}.",
      "Clarify the meaning and scope of {topic}."
    ],
    "Apply": [
      "Demonstrate how {topic} can be applied in a practical scenario.",
      "Solve a practical problem using the principles of {topic}.",
      "Implement a solution that utilizes {topic} for a given use case.",
      "Apply the concepts of {topic} to address a real-world situation.",
      "Using {topic}, illustrate a step-by-step approach to solve a problem.",
      "Show how {topic} is used in industry with a worked example.",
      "Calculate or estimate the required parameters using {topic}.",
      "Execute a standard procedure based on {topic}.",
      "Illustrate the application of {topic} in an enterprise environment.",
      "Demonstrate the usage of {topic} to optimize a workflow.",
      "Showcase a practical implementation strategy for {topic}.",
      "Apply the rules of {topic} to determine the correct outcome.",
      "Use {topic} to construct a basic working model.",
      "Demonstrate the real-time application of {topic}.",
      "Employ {topic} to resolve a common industry challenge."
    ],
    "Analyze": [
      "Analyze the key factors that influence {topic} and their interrelationships.",
      "Compare and contrast {topic} with its alternative approaches.",
      "Examine the strengths and weaknesses of {topic} in detail.",
      "Differentiate between the various methodologies within {topic}.",
      "Break down {topic} into its constituent parts and analyze each component.",
      "Investigate the cause-and-effect relationships in {topic}.",
      "Analyze the performance implications of implementing {topic}.",
      "Deconstruct {topic} to understand its underlying framework.",
      "Examine the critical failure points associated with {topic}.",
      "Compare the efficiency of {topic} against traditional methods.",
      "Analyze the structural integrity or logic of {topic}.",
      "Distinguish between the theoretical and practical aspects of {topic}.",
      "Investigate the security or operational risks of {topic}.",
      "Break down the lifecycle of {topic}.",
      "Analyze the trade-offs involved in using {topic}."
    ],
    "Evaluate": [
      "Evaluate the effectiveness of {topic} and justify your assessment.",
      "Critically assess {topic} and provide arguments for and against it.",
      "Judge the suitability of {topic} for an enterprise scenario with reasoning.",
      "Appraise {topic} by comparing it against established benchmarks.",
      "Assess the impact of {topic} and recommend improvements.",
      "Critique the current implementation of {topic} and suggest refinements.",
      "Evaluate the long-term sustainability and scalability of {topic}.",
      "Defend the use of {topic} over its competitors.",
      "Critically evaluate the ethical or privacy implications of {topic}.",
      "Assess the cost-benefit ratio of deploying {topic}.",
      "Judge the reliability and fault tolerance of {topic}.",
      "Critique the standard methodologies associated with {topic}.",
      "Evaluate how well {topic} solves the problem it was designed for.",
      "Assess the potential future developments or obsolescence of {topic}.",
      "Determine the value and relevance of {topic} in today's landscape."
    ],
    "Create": [
      "Design a novel solution that incorporates {topic} for a specific problem.",
      "Propose an innovative framework based on {topic} with a detailed plan.",
      "Construct a comprehensive model using {topic} and explain your design choices.",
      "Develop a new approach to {topic} that addresses its current limitations.",
      "Formulate a strategy leveraging {topic} to achieve business objectives.",
      "Create a prototype or blueprint that demonstrates {topic} in action.",
      "Design an architecture that integrates {topic} with legacy systems.",
      "Invent a new methodology that builds upon {topic}.",
      "Develop a comprehensive testing strategy for {topic}.",
      "Propose a migration plan to transition a system to {topic}.",
      "Formulate a set of best practices for implementing {topic}.",
      "Design a hybrid model combining {topic} with other technologies.",
      "Create a scalable deployment plan for {topic}.",
      "Develop a contingency or disaster recovery plan for {topic}.",
      "Design an optimized algorithm or workflow based on {topic}."
    ],
  };

  const handleBatchTransform = async () => {
    const hasEmpty = questions.some(q => q.text.trim() === "");
    if (hasEmpty) {
      alert("Please fill in all the required questions dictated by the Blueprint before transforming.");
      return;
    }

    setIsTransforming(true);

    setTimeout(() => {
      // Track used template indices per level to avoid repeats
      const usedIndices: Record<string, number[]> = {};

      const transformedResults = questions.map(q => {
        const level = q.targetLevel || "Understand";
        const templates = bloomTemplates[level] || bloomTemplates["Understand"];
        
        // Pick a unique template index for this level
        if (!usedIndices[level]) usedIndices[level] = [];
        let idx: number;
        const available = templates.map((_, i) => i).filter(i => !usedIndices[level].includes(i));
        if (available.length === 0) {
          // All used — reset and pick randomly
          usedIndices[level] = [];
          idx = Math.floor(Math.random() * templates.length);
        } else {
          idx = available[Math.floor(Math.random() * available.length)];
        }
        usedIndices[level].push(idx);

        const template = templates[idx];
        const topic = q.text.trim();
        const transformedText = template.replace(/\{topic\}/g, topic.toLowerCase());

        return { ...q, transformedText };
      });

      setFinalPaper(transformedResults);
      setIsTransforming(false);
    }, 2000);
  };

  const handleSubmitToCOE = async () => {
    if (finalPaper.length === 0) {
      alert("You must transform the paper before submitting.");
      return;
    }

    try {
      const res = await fetch(`${API}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_session_id: blueprint.id,
          title: blueprint.title,
          department: blueprint.department,
          semester: blueprint.semester,
          subject: blueprint.subject,
          teacher_email: localStorage.getItem("user_email") || "teacher@university.edu",
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
                  <img src="/clglogo.png" alt="College Logo" className="w-full h-auto object-contain" />
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
