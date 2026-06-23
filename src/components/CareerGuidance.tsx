import React, { useState, useEffect } from "react";
import { 
  Compass, Award, Terminal, Map, Sparkles, RefreshCw, 
  ArrowRight, CheckCircle, Flame, GraduationCap, Heart, HelpCircle
} from "lucide-react";

interface RoadmapStep {
  phase: string;
  duration: string;
  topic: string;
  skills: string[];
}

interface CareerRoadmap {
  id: string;
  careerPath: string;
  domainDescription: string;
  recommendedCertifications: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTimeline: string;
  steps: RoadmapStep[];
}

export default function CareerGuidance() {
  const [careerInterest, setCareerInterest] = useState("AI & Deep Learning Engineer");
  const [targetIndustry, setTargetIndustry] = useState("Autonomous Vehicles / Large Scale NLP");
  const [loading, setLoading] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(null);
  const [roadmapsHistory, setRoadmapsHistory] = useState<CareerRoadmap[]>([]);

  useEffect(() => {
    // Load pre-generated roadmap on component mount
    handleGenerateRoadmap(null);
  }, []);

  const handleGenerateRoadmap = async (e: React.FormEvent | null) => {
    if (e) e.preventDefault();
    if (!careerInterest.trim()) return;

    setLoading(true);
    try {
      const prompt = `Generate a highly structured career learning pathway for a student wanting to become a "${careerInterest}" working in the "${targetIndustry}" industry.
      Provide response strictly in JSON format matching this schema:
      {
        "careerPath": string,
        "domainDescription": string,
        "recommendedCertifications": string[],
        "difficulty": "Beginner" | "Intermediate" | "Advanced",
        "estimatedTimeline": string,
        "steps": [
          { "phase": "Phase 1: Foundations", "duration": "Weeks 1-4", "topic": "Core mathematics & python programming syntax", "skills": ["Python", "Numpy", "Linear Algebra"] }
        ]
      }`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt })
      });
      const data = await res.json();

      let result: Omit<CareerRoadmap, "id"> = {
        careerPath: careerInterest,
        domainDescription: `Tailored strategic framework to master the software engineering methodologies, data schemas, and mathematical matrices required in ${targetIndustry}.`,
        recommendedCertifications: [
          "AWS Certified Machine Learning - Specialty",
          "Google Professional Data Engineer",
          "NVIDIA Deep Learning Institute Certificate"
        ],
        difficulty: "Intermediate",
        estimatedTimeline: "6 Months",
        steps: [
          { phase: "Phase 1: Core Fundamentals", duration: "Month 1-2", topic: "Multivariable calculus, matrix multiplication, neural computation graphs.", skills: ["Python 3.11", "NumPy & SciPy Math", "Vectorizations Layout"] },
          { phase: "Phase 2: Deep Networks", duration: "Month 3-4", topic: "Backpropagation debugging, convolutional kernels, residual layers.", skills: ["PyTorch Core", "TensorBoard", "CUDA Performance Tuning"] },
          { phase: "Phase 3: Production LLMs", duration: "Month 5-6", topic: "Transformer architectures, tokenization sequences, sparse attention maps.", skills: ["Hugging Face", "Parameter-Efficient Fine-Tuning (PEFT)", "vLLM Deployments"] }
        ]
      };

      if (data.reply) {
        try {
          const rawText = data.reply;
          const jsonStart = rawText.indexOf("{");
          const jsonEnd = rawText.lastIndexOf("}");
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const parsed = JSON.parse(rawText.substring(jsonStart, jsonEnd + 1));
            if (parsed.careerPath && parsed.steps) {
              result = parsed;
            }
          }
        } catch (parseError) {
          console.warn("Could not parse AI response for roadmap, using refined preset.");
        }
      }

      const completedRoadmap: CareerRoadmap = {
        ...result,
        id: "rm_" + Date.now()
      };

      setActiveRoadmap(completedRoadmap);
      setRoadmapsHistory(prev => [completedRoadmap, ...prev.filter(r => r.careerPath !== completedRoadmap.careerPath)]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Input and Request Form */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Compass className="w-5 h-5 text-blue-600 animate-spin-slow" />
          <div>
            <h3 className="font-bold text-slate-800 text-sm">AI Career Guidance System</h3>
            <span className="text-[10px] text-slate-400 block">Formulate customized curriculum roadmaps and recommended certifications using generative algorithms</span>
          </div>
        </div>

        <form onSubmit={handleGenerateRoadmap} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Target Career Path / Role:</label>
            <input
              id="career-role-input"
              type="text"
              required
              value={careerInterest}
              onChange={(e) => setCareerInterest(e.target.value)}
              placeholder="e.g. Distributed Database Architect, Devops Lead"
              className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none focus:border-blue-500 text-slate-800 bg-slate-50/50"
            />
          </div>

          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Target Niche / Industry Segment:</label>
            <input
              id="career-sector-input"
              type="text"
              required
              value={targetIndustry}
              onChange={(e) => setTargetIndustry(e.target.value)}
              placeholder="e.g. Fintech Banking, Cloud Storage Solutions"
              className="w-full text-xs border border-slate-200 p-2.5 rounded-lg outline-none focus:border-blue-500 text-slate-800 bg-slate-50/50"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 border border-blue-700 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Modeling Roadmap...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-300" /> Plot Career Vector
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Main Roadmap Results Layout */}
      {activeRoadmap && (
        <div id="career-roadmap-result" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Timeline and Milestones (Col: 8) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-1.5 text-blue-800 font-bold text-xs uppercase tracking-wider">
                <Map className="w-4.5 h-4.5" /> Core Curriculum Roadmap Steps
              </div>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-indigo-700 font-extrabold font-mono uppercase tracking-wider">
                Difficulty: {activeRoadmap.difficulty} ({activeRoadmap.estimatedTimeline})
              </span>
            </div>

            {/* Vertical Milestones Visual Sequence */}
            <div className="space-y-6 pt-2">
              {activeRoadmap.steps.map((step, index) => (
                <div key={index} className="relative pl-8 border-l border-slate-200 last:border-transparent pb-1">
                  {/* Dot Indicator */}
                  <span className="absolute left-0 top-1 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-500 flex items-center justify-center text-[10px] font-black text-blue-700">
                    {index + 1}
                  </span>

                  <div className="space-y-1.5 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs transition hover:border-slate-300">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-black tracking-widest text-blue-600 uppercase font-mono">{step.phase}</span>
                      <span className="text-[10px] font-extrabold text-slate-400 bg-white border border-slate-200/60 px-2 py-0.5 rounded-full font-mono">{step.duration}</span>
                    </div>
                    <strong className="block text-slate-800 text-xs">{step.topic}</strong>
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {step.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="text-[9px] bg-slate-200/50 text-slate-600 font-bold border px-2 py-0.5 rounded font-mono">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Recommendation & Certifications (Col: 4) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Certifications and Resources */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-slate-850 shadow-md">
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest block mb-1">PRO-ACCREDITATIONS</span>
              <h4 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <Award className="w-4.5 h-4.5 text-amber-400" /> Suggested Industry Certifications
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5">Completing these credentials optimizes candidate algorithms during recruiter ATS filtering passes.</p>

              <div className="space-y-3.5 mt-4">
                {activeRoadmap.recommendedCertifications.map((cert, cIdx) => (
                  <div key={cIdx} className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block leading-snug">{cert}</span>
                      <span className="text-[9px] text-indigo-300 uppercase tracking-wider font-semibold block mt-0.5">High Recruiter Index Impact</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Advisor Feedback Summary */}
            <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                <Flame className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> AI Strategic Insights
              </div>
              <h5 className="font-bold text-slate-850 text-xs">Domain Overview & Competitive Standing</h5>
              <p className="text-xs text-slate-605 leading-relaxed font-sans mt-1">
                {activeRoadmap.domainDescription}
              </p>
              <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-[10px] text-blue-800 font-medium leading-relaxed">
                <strong>Placement Advice:</strong> Pair these milestones with high test-case completions in the campus Coding Hackathon suite to qualify as an elite category scholar.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History log roadmaps */}
      {roadmapsHistory.length > 1 && (
        <div id="roadmaps-history-list" className="bg-slate-50 border p-5 rounded-2xl space-y-3">
          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Accrued Guidance History Logs</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {roadmapsHistory.slice(1).map((hist) => (
              <button
                key={hist.id}
                onClick={() => setActiveRoadmap(hist)}
                className="p-3 bg-white hover:bg-slate-50 border rounded-xl text-left font-sans cursor-pointer transition focus:outline-none"
              >
                <span className="text-[9px] text-blue-600 font-black uppercase font-mono">MAP PARAMETER</span>
                <strong className="block text-slate-800 text-xs mt-0.5 line-clamp-1">{hist.careerPath}</strong>
                <span className="text-[10px] text-slate-400 font-medium font-mono">{hist.steps.length} Milestones defined</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
