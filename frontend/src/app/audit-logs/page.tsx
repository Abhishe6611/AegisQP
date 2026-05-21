"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, Activity, User, FileText } from "lucide-react";

export default function AuditLogsPage() {
  const router = useRouter();
  
  const [logs, setLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch("/api/v1/core/audit-logs")
      .then(res => res.json())
      .then(data => setLogs(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans pb-20">
      <nav className="border-b-2 border-black bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="p-2 border-2 border-transparent hover:border-black transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold tracking-tight uppercase flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-600" />
              Immutable Audit Logs
            </h1>
          </div>
          <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 uppercase border-2 border-black tracking-widest">
            SUPERADMIN CLEARANCE
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-6 border-b-2 border-black bg-gray-100 flex justify-between items-center">
            <h2 className="font-black uppercase text-xl flex items-center gap-2">
              <Activity className="w-5 h-5" /> System Activity Stream
            </h2>
            <div className="text-sm font-bold text-gray-500">
              Total Records: {logs.length}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-black text-xs uppercase tracking-wider">
                  <th className="p-4 font-black">Timestamp</th>
                  <th className="p-4 font-black">Action Type</th>
                  <th className="p-4 font-black">User / Actor</th>
                  <th className="p-4 font-black">Details</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs.map((log, i) => (
                  <tr key={log.id} className={`border-b border-gray-200 hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className="p-4 font-medium text-gray-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase border border-black ${
                        (log.action_type || "").includes('REJECT') ? 'bg-red-200 text-red-800' :
                        (log.action_type || "").includes('SUBMIT') ? 'bg-blue-200 text-blue-800' :
                        (log.action_type || "").includes('CREATE') ? 'bg-green-200 text-green-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="p-4 font-bold flex items-center gap-2">
                      {log.actor === "SYSTEM" ? <BotIcon /> : <User className="w-4 h-4 text-gray-400" />}
                      {log.actor}
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

function BotIcon() {
  return <FileText className="w-4 h-4 text-gray-400" />;
}
