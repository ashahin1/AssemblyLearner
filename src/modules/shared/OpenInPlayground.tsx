// COE224: Assembly Language Studio - "Open in Playground" Button

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { PersistenceManager } from '../../store/persistence';

interface OpenInPlaygroundProps {
  code: string;
  label?: string;
}

export const OpenInPlayground: React.FC<OpenInPlaygroundProps> = ({
  code,
  label = 'Open in Playground ↗',
}) => {
  const navigate = useNavigate();

  const handleOpen = () => {
    PersistenceManager.saveCode(code);
    navigate('/playground');
  };

  return (
    <button
      onClick={handleOpen}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition"
    >
      <ExternalLink size={14} />
      <span>{label}</span>
    </button>
  );
};
