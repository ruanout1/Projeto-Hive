import React from 'react';
import { Team, TeamFormData } from './types'; // Importa os novos tipos

// --- FUNÇÕES DE LÓGICA / VALIDAÇÃO ---

/**
 * Valida os dados do formulário de equipe.
 * (Corrigido para usar TeamFormData e checar managerId)
 */
export const validateTeamData = (formData: Partial<TeamFormData>): boolean => {
  // Descrição não é mais um campo obrigatório no tipo
  return !!(formData.name && formData.managerId);
};

/**
 * Filtra equipes ativas.
 * (Corrigido para usar 'status' em vez de 'isActive')
 */
export const filterActiveTeams = (teams: Team[]): Team[] => {
  return teams.filter(team => team.status === 'active');
};

// (Função getTeamMemberCount removida, pois agora usamos team.members.length)


// --- FUNÇÕES DE UI (Apresentação) ---

/**
 * Pega as iniciais de um nome para usar em avatares.
 */
export const getInitials = (name: string) => {
  if (!name) return '??';
  return name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Componente React para destacar texto de busca.
 */
interface HighlightTextProps {
  text: string;
  searchTerm: string;
  highlightClassName?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ 
  text, 
  searchTerm, 
  highlightClassName = "bg-yellow-200 text-black" 
}) => {
  if (!searchTerm || !text) return <>{text}</>; 

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={index} className={highlightClassName}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};


