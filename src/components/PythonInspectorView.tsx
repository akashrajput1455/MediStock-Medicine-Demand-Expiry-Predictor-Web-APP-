import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  DownloadCloud, 
  BookOpen, 
  FileCode, 
  Terminal, 
  Database,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { PYTHON_PROJECT_FILES, PythonFileEntry } from '../services/pythonSourceRegistry';

interface PythonInspectorViewProps {
  onDownloadZip: () => void;
}

export const PythonInspectorView: React.FC<PythonInspectorViewProps> = ({
  onDownloadZip
}) => {
  const [selectedFile, setSelectedFile] = useState<PythonFileEntry>(PYTHON_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'viva' | 'concepts'>('code');

  const copyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vivaQuestions = [
    {
      q: "1. What is the objective of the MediStock project?",
      a: "To help small retail pharmacies and healthcare dispensaries manage medicine stock, automate shelf-life countdowns to prevent expired drug dispensation, and predict next-month demand using transparent mathematical models (Linear Regression and Simple Moving Average)."
    },
    {
      q: "2. How does the application connect Flask to MySQL 8.x?",
      a: "We use the official 'mysql-connector-python' library inside database/db_connection.py. We configure connection parameters in config.py and use parameterized queries cursor.execute(query, params) to strictly prevent SQL injection."
    },
    {
      q: "3. How does the Demand Prediction algorithm work?",
      a: "In services/demand_prediction.py, raw sales records are grouped by month using Pandas. We compute the Ordinary Least Squares regression equation y = mx + c using NumPy arrays. The slope m indicates whether consumption is increasing or decreasing, while x = n+1 gives the estimated demand for the upcoming month."
    },
    {
      q: "4. Why is Linear Regression chosen over deep learning neural networks?",
      a: "Retail pharmacies need transparent, explainable recommendations rather than black-box models. Linear regression provides direct clinical and financial justification (slope m, base intercept c) and works accurately even on small datasets (5-12 months) without overfitting."
    },
    {
      q: "5. How are expired medicines prevented from being dispensed?",
      a: "In routes/inventory.py, before executing any Stock OUT operation, the backend calls ExpiryChecker.classify_expiry(). If the expiry date has elapsed (days_remaining < 0), is_dispensable evaluates to False, and the transaction is aborted with an error flash message."
    },
    {
      q: "6. How is shelf life classified?",
      a: "Using Python's datetime.date module, we subtract the reference date from expiry_date: (1) Expired (< 0 days), (2) Expiring ≤ 30 days, (3) Expiring ≤ 60 days, (4) Expiring ≤ 90 days, and (5) Safe Stock (> 90 days)."
    },
    {
      q: "7. How is user authentication secured in Flask?",
      a: "We use password hashing via Werkzeug / SHA-256 and Flask Sessions. Protected endpoints are decorated with a custom @login_required higher-order function that verifies the user's active session before granting access."
    },
    {
      q: "8. How does the CSV export work without writing temporary files to disk?",
      a: "In routes/reports.py, we use Python's built-in io.StringIO buffer and the csv.writer module. The CSV text is constructed in RAM and streamed directly in the HTTP response with 'Content-Disposition: attachment; filename=...' headers."
    }
  ];

  const pythonConcepts = [
    { name: "Object-Oriented Programming (OOP)", detail: "Implemented in models/medicine.py and models/inventory.py with classes, __init__ constructors, validation methods, and property getters (@property is_low_stock)." },
    { name: "NumPy Vectorized Calculations", detail: "Used in services/demand_prediction.py: np.arange, np.sum, np.mean, and vector products for least-squares regression." },
    { name: "Pandas DataFrames", detail: "pd.DataFrame(sales), pd.to_datetime, dt.to_period('M'), and .groupby('year_month')['quantity_sold'].sum() to aggregate monthly sales." },
    { name: "Date & Time Arithmetic", detail: "datetime.date subtraction (expiry_date - today).days to determine shelf-life in days." },
    { name: "Python Decorators", detail: "@login_required decorator with functools.wraps(f) protecting authenticated Flask blueprint routes." },
    { name: "Exception Handling", detail: "try-except-finally blocks wrapping MySQL cursors and database connections ensuring proper commit/rollback and connection closure." },
    { name: "In-Memory File Handling", detail: "io.StringIO and the csv module to generate and stream CSV file downloads." }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with 1-Click Download ZIP */}
      <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Standalone MCA Python Mini Project</span>
          </div>
          <h2 className="text-xl font-bold">MediStock Python + MySQL Standalone Codebase</h2>
          <p className="text-xs text-sky-100 max-w-xl mt-1">
            Download the complete, ready-to-run Python Flask, MySQL, Pandas, and Bootstrap 5 codebase. Includes Windows batch and PowerShell runner scripts!
          </p>
        </div>

        <button
          onClick={onDownloadZip}
          className="px-5 py-3 bg-white text-teal-800 hover:bg-teal-50 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition shrink-0"
        >
          <DownloadCloud className="w-4 h-4 text-teal-600" />
          <span>Download Complete Python Project (.ZIP)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('code')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'code' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Browse Python Source Files ({PYTHON_PROJECT_FILES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('viva')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'viva' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>MCA Viva Questions & Answers (8)</span>
        </button>

        <button
          onClick={() => setActiveTab('concepts')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'concepts' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Python Syllabus Concepts Demonstrated</span>
        </button>
      </div>

      {/* Tab 1: Code Browser */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Tree (1 col) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 h-fit">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-2">
              Project Files
            </h4>

            <div className="space-y-1">
              {PYTHON_PROJECT_FILES.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition flex items-center justify-between ${
                    selectedFile.path === file.path
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-slate-400 text-[10px]">&bull;</span>
                    <span className="truncate font-mono">{file.path}</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                    {file.category}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer (3 cols) */}
          <div className="lg:col-span-3 bg-slate-900 rounded-xl border border-slate-800 shadow-lg overflow-hidden flex flex-col">
            {/* Code Header */}
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="ml-2 font-mono text-xs text-slate-300 font-semibold">{selectedFile.path}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {selectedFile.description}
                </span>
                <button
                  onClick={copyCode}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-4 overflow-x-auto text-xs font-mono text-emerald-400 leading-relaxed max-h-[550px] overflow-y-auto">
              <pre>{selectedFile.content}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Viva Q&A */}
      {activeTab === 'viva' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vivaQuestions.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <h4 className="text-xs font-bold text-sky-800 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 text-[10px]">
                  Q
                </span>
                <span>{item.q}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-7">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Python Concepts */}
      {activeTab === 'concepts' && (
        <div className="space-y-3">
          {pythonConcepts.map((c, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                {idx + 1}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">{c.name}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
