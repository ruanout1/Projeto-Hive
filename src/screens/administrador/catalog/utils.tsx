import { Service } from './types';

// Formatação de preço
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
};

// Formatação de duração
export const formatDuration = (
  duration: number,
  durationType: 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual' | 'horas'
): string => {
  let durationValue = duration;
  let maximumFractionDigits = 0;

  if (durationType === 'horas') {
    maximumFractionDigits = 1;
  } else {
    durationValue = Math.round(durationValue);
  }

  const typeLabels: Record<string, string[]> = {
    'diaria': ['diária', 'diárias'],
    'semanal': ['semana', 'semanas'],
    'quinzenal': ['quinzena', 'quinzenas'],
    'mensal': ['mês', 'meses'],
    'anual': ['ano', 'anos'],
    'horas': ['hora', 'horas']
  };

  const labels = typeLabels[durationType] || typeLabels['horas'];
  const label = (Number(durationValue) === 1) ? labels[0] : labels[1];

  const formattedDuration = Number(durationValue).toLocaleString('pt-BR', {
    maximumFractionDigits: maximumFractionDigits,
    minimumFractionDigits: 0
  });

  return `${formattedDuration} ${label}`;
};

// Componente HighlightText (agora em arquivo .tsx)
export const HighlightText = ({
  text,
  searchTerm
}: {
  text: string;
  searchTerm: string;
}) => {
  if (!searchTerm || !text) return <>{text}</>;

  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={index} className="bg-yellow-200 text-black">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

// Filtro de serviços
export const filterServices = (
  services: Service[],
  searchTerm: string,
  filterStatus: string,
  filterCategory: string
): Service[] => {
  const term = (searchTerm || '').toLowerCase();

  return services.filter(service => {
    const matchesSearch =
      (service.name || '').toLowerCase().includes(term) ||
      (service.description || '').toLowerCase().includes(term);

    const matchesStatus = filterStatus === 'todos' || service.status === filterStatus;
    const matchesCategory = filterCategory === 'todas' || service.category?.id === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });
};
