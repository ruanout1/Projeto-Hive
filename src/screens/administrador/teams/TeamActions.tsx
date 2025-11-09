import React from 'react';

interface TeamActionsProps {
  onCreateTeam: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

export const TeamActions: React.FC<TeamActionsProps> = ({
  onCreateTeam,
  onExport,
  onImport
}) => {
  return (
    <div className="flex space-x-3">
      <button
        onClick={onImport}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Importar
      </button>
      <button
        onClick={onExport}
        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Exportar
      </button>
      <button
        onClick={onCreateTeam}
        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
      >
        Nova Equipe
      </button>
    </div>
  );
};