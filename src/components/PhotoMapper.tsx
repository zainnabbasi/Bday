import React, { useState, useRef } from 'react';
import { Employee, EventType } from '../types';
import { UploadCloud, CheckCircle2, X, AlertCircle, ArrowRight, Upload } from 'lucide-react';

interface Props {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  onComplete: () => void;
  eventType?: EventType;
}

export function PhotoMapper({ employees, setEmployees, onComplete, eventType }: Props) {
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mappedCount = employees.filter(e => e.imageUrl).length;
  const totalCount = employees.length;
  const progressPercentage = (mappedCount / totalCount) * 100;

  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGlobal(true);
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    // Only set false if we are leaving the main container, to avoid flickering on children
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingGlobal(false);
    }
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingGlobal(false);
    const files = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('image/'));
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = (Array.from(e.target.files || []) as File[]).filter(f => f.type.startsWith('image/'));
    processFiles(files);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFiles = (files: File[]) => {
    setEmployees((prev) => {
      const next = [...prev];
      
      files.forEach((file) => {
        const fileName = file.name.toLowerCase();
        // Remove file extension for cleaner matching
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
        
        const empIndex = next.findIndex((emp) => {
          if (emp.imageUrl) return false; // Skip already mapped
          
          if (emp.empCode) {
            const codeLower = emp.empCode.toLowerCase();
            // Match if the filename contains the exact employee code
            if (fileNameWithoutExt.includes(codeLower)) return true;
          }
          
          return false;
        });

        if (empIndex !== -1) {
          next[empIndex] = { ...next[empIndex], imageUrl: URL.createObjectURL(file) };
        }
      });
      
      return next;
    });
  };

  const handleSinglePhotoUpload = (empId: string, file: File) => {
     if (!file.type.startsWith('image/')) return;
     setEmployees(prev => prev.map(emp => 
        emp.id === empId ? { ...emp, imageUrl: URL.createObjectURL(file) } : emp
     ));
  };

  const removePhoto = (empId: string) => {
     setEmployees(prev => prev.map(emp => 
        emp.id === empId ? { ...emp, imageUrl: undefined } : emp
     ));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden w-full max-w-5xl mx-auto">
      {/* Header & Global Dropzone */}
      <div 
        onDragOver={handleGlobalDragOver}
        onDragLeave={handleGlobalDragLeave}
        onDrop={handleGlobalDrop}
        className={`p-10 border-b-2 transition-all duration-300 relative ${isDraggingGlobal ? 'border-[#046eb6] bg-blue-50/80' : 'border-slate-100 bg-slate-50/50'}`}
      >
        {isDraggingGlobal && (
           <div className="absolute inset-0 bg-[#046eb6]/10 backdrop-blur-[2px] z-10 flex items-center justify-center border-[4px] border-[#046eb6] border-dashed rounded-t-[2.5rem]">
              <div className="bg-white px-8 py-5 rounded-full shadow-2xl text-2xl font-bold text-[#046eb6] flex items-center gap-4 animate-bounce">
                 <UploadCloud size={32} /> Drop photos to auto-match!
              </div>
           </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-[#12284b] tracking-tight">Studio Roster</h2>
            <p className="text-slate-500 mt-2 text-lg">Upload photos in bulk; they will be matched strictly by Employee Code.</p>
          </div>
          <div className="flex items-center gap-4">
             <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="bg-white border-2 border-slate-200 hover:border-[#046eb6] text-slate-700 hover:text-[#046eb6] px-6 py-3 rounded-2xl font-bold transition-all shadow-sm flex items-center gap-2"
             >
               <Upload size={20} /> Upload Folder / Photos
             </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-10 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex items-center justify-between text-sm font-bold mb-3 uppercase tracking-wider">
             <span className="text-slate-500">Matching Progress</span>
             <span className={mappedCount === totalCount ? 'text-[#1eb259]' : 'text-[#046eb6]'}>
               {mappedCount} / {totalCount} Ready
             </span>
           </div>
           <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
             <div 
               className={`h-full rounded-full transition-all duration-700 ${mappedCount === totalCount ? 'bg-[#1eb259]' : 'bg-[#046eb6]'}`}
               style={{ width: `${progressPercentage}%` }}
             />
           </div>
        </div>
      </div>

      {/* Roster List */}
      <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC] min-h-[400px]">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(emp => (
               <div key={emp.id} className={`bg-white rounded-2xl border-[2px] shadow-sm p-4 flex gap-5 items-center transition-all hover:shadow-lg ${emp.imageUrl ? 'border-transparent' : 'border-slate-200 hover:border-blue-300'}`}>
                  {/* Photo Area */}
                  <div className="w-[100px] h-[100px] rounded-xl flex-shrink-0 relative overflow-hidden group bg-slate-50">
                     {emp.imageUrl ? (
                        <>
                           <img src={emp.imageUrl} alt={emp.name} className="w-full h-full object-cover" />
                           <button 
                             onClick={() => removePhoto(emp.id)}
                             className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                           >
                              <X size={28} />
                              <span className="text-xs mt-1 font-bold">Remove</span>
                           </button>
                           <div className="absolute top-1 right-1 bg-white rounded-full p-0.5 text-[#1eb259] shadow-md border border-white">
                              <CheckCircle2 size={18} />
                           </div>
                        </>
                     ) : (
                        <label className="w-full h-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-[#046eb6] hover:text-[#046eb6] hover:bg-blue-50 cursor-pointer transition-colors">
                           <UploadCloud size={28} />
                           <span className="text-[10px] font-bold uppercase mt-2 text-center leading-tight">Add<br/>Photo</span>
                           <input 
                             type="file" 
                             accept="image/*" 
                             className="hidden" 
                             onChange={(e) => {
                                if (e.target.files?.[0]) handleSinglePhotoUpload(emp.id, e.target.files[0]);
                             }}
                           />
                        </label>
                     )}
                  </div>

                  {/* Info Area */}
                  <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-slate-800 text-lg truncate" title={emp.name}>{emp.name}</h3>
                     <p className="text-xs font-bold text-[#046eb6] mt-0.5">Code: {emp.empCode || 'N/A'}</p>
                     {emp.designation && (
                       <p className="text-xs text-slate-500 truncate mt-0.5" title={emp.designation}>{emp.designation}</p>
                     )}
                     {emp.location && (
                       <p className="text-[11px] font-bold text-[#1eb259] uppercase tracking-wider mt-0.5">{emp.location}</p>
                     )}
                     
                     <div className="mt-2.5 flex items-center gap-1.5">
                        {emp.imageUrl ? (
                           <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#1eb259] bg-green-50 px-2.5 py-1 rounded-md border border-green-200/50">
                              Matched
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50">
                              <AlertCircle size={12} />
                              Missing
                           </span>
                        )}
                        {!emp.imageUrl && emp.empCode && (
                           <span className="text-[10px] font-semibold text-slate-400 truncate pl-1 border-l border-slate-200">Needs: *{emp.empCode}*</span>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* Footer Action */}
      <div className="p-8 border-t border-slate-100 bg-white flex justify-between items-center">
         <p className="text-slate-500 font-medium">Step 2 of 3</p>
         <button
           onClick={onComplete}
           disabled={eventType === 'new_joiners' ? totalCount === 0 : mappedCount === 0}
           className="bg-[#12284b] hover:bg-[#046eb6] text-white px-10 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-blue-900/20 text-lg"
         >
            {eventType === 'new_joiners' 
              ? `Proceed to Creatives (${mappedCount}/${totalCount} Photos)` 
              : `Generate ${mappedCount} Creatives`} <ArrowRight size={24} />
         </button>
      </div>
    </div>
  );
}
