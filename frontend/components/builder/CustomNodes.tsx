import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileText, Flag, Mail, CheckCircle2, ChevronDown, List, Hash, ToggleLeft, Star, UploadCloud } from 'lucide-react';

const iconMap = {
  short_text: <FileText size={14} />,
  long_text: <FileText size={14} />,
  email: <Mail size={14} />,
  multiple_choice: <List size={14} />,
  dropdown: <ChevronDown size={14} />,
  number: <Hash size={14} />,
  yes_no: <ToggleLeft size={14} />,
  rating: <Star size={14} />,
  file_upload: <UploadCloud size={14} />
};

export const StartNode = ({ data }: any) => {
  return (
    <div className="px-4 py-3 rounded-lg shadow-sm border min-w-[150px]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex flex-col items-start gap-1">
        <Flag size={16} style={{ color: 'var(--accent)' }} className="mb-1" />
        <div className="font-bold text-sm" style={{ color: 'var(--text)' }}>Start</div>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Pull data in</div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2" style={{ backgroundColor: 'var(--accent)', borderColor: 'var(--card)', right: -6 }} />
    </div>
  );
};

export const QuestionNode = ({ data }: any) => {
  return (
    <div className="rounded-lg shadow-sm border w-[200px] transition-colors cursor-grab active:cursor-grabbing hover:border-opacity-100" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2" style={{ backgroundColor: 'var(--text-muted)', borderColor: 'var(--card)', left: -6 }} />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded flex items-center justify-center opacity-80" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
            {iconMap[data.type as keyof typeof iconMap] || <FileText size={14} />}
          </div>
          <span className="text-xs font-bold px-1.5 py-0.5 rounded opacity-90" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
            {data.orderIndex + 1}
          </span>
        </div>
        <div className="font-semibold text-sm line-clamp-2 leading-snug" style={{ color: 'var(--text)' }}>
          {data.title || "Untitled Question"}
        </div>
        <div className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-faint)' }}>
          {data.description || "No description"}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 border-2" style={{ backgroundColor: 'var(--text-muted)', borderColor: 'var(--card)', right: -6 }} />
    </div>
  );
};

export const EndNode = ({ data }: any) => {
  return (
    <div className="p-3 rounded-lg shadow-sm border w-[180px]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <Handle type="target" position={Position.Left} className="w-3 h-3 border-2" style={{ backgroundColor: 'var(--text-muted)', borderColor: 'var(--card)', left: -6 }} />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
          <CheckCircle2 size={14} />
        </div>
        <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          All done!
        </div>
      </div>
      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
        Thanks for your time.
      </div>
    </div>
  );
};
