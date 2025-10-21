export default function HiveSymbol() {
  return (
    <div className="relative w-20 h-20">
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        {/* Camadas da colmeia - ovais empilhadas */}
        {/* Camada superior */}
        <ellipse cx="40" cy="15" rx="22" ry="5" fill="#8B20EE" fillOpacity="0.3" />
        <ellipse cx="40" cy="15" rx="22" ry="5" stroke="#8B20EE" strokeWidth="1.5" />
        
        {/* Segunda camada */}
        <ellipse cx="40" cy="22" rx="27" ry="6" fill="#8B20EE" fillOpacity="0.4" />
        <ellipse cx="40" cy="22" rx="27" ry="6" stroke="#8B20EE" strokeWidth="1.5" />
        
        {/* Terceira camada */}
        <ellipse cx="40" cy="31" rx="32" ry="7" fill="#8B20EE" fillOpacity="0.5" />
        <ellipse cx="40" cy="31" rx="32" ry="7" stroke="#6400A4" strokeWidth="2" />
        
        {/* Camada central - maior */}
        <ellipse cx="40" cy="40" rx="35" ry="8" fill="#6400A4" fillOpacity="0.15" />
        <ellipse cx="40" cy="40" rx="35" ry="8" stroke="#6400A4" strokeWidth="2.5" />
        
        {/* Quinta camada */}
        <ellipse cx="40" cy="49" rx="32" ry="7" fill="#8B20EE" fillOpacity="0.5" />
        <ellipse cx="40" cy="49" rx="32" ry="7" stroke="#6400A4" strokeWidth="2" />
        
        {/* Sexta camada */}
        <ellipse cx="40" cy="58" rx="27" ry="6" fill="#8B20EE" fillOpacity="0.4" />
        <ellipse cx="40" cy="58" rx="27" ry="6" stroke="#8B20EE" strokeWidth="1.5" />
        
        {/* Camada inferior */}
        <ellipse cx="40" cy="65" rx="22" ry="5" fill="#8B20EE" fillOpacity="0.3" />
        <ellipse cx="40" cy="65" rx="22" ry="5" stroke="#8B20EE" strokeWidth="1.5" />
        
        {/* Linhas de conexão verticais */}
        <line x1="40" y1="20" x2="40" y2="60" stroke="#6400A4" strokeWidth="1" opacity="0.4" />
        <line x1="30" y1="25" x2="30" y2="55" stroke="#8B20EE" strokeWidth="0.8" opacity="0.4" />
        <line x1="50" y1="25" x2="50" y2="55" stroke="#8B20EE" strokeWidth="0.8" opacity="0.4" />
        
        {/* Letra H estilizada no centro - com fundo sólido para destaque */}
        <g transform="translate(30, 30)">
          {/* Fundo sólido circular branco para máximo contraste */}
          <circle cx="10" cy="10" r="12" fill="#FFFFFF" stroke="#6400A4" strokeWidth="2" />
          <circle cx="10" cy="10" r="9" fill="#FFFFFF" />
          
          {/* Lado esquerdo do H - mais espesso e bem definido */}
          <rect x="4" y="4" width="3.5" height="12" fill="#6400A4" rx="1.75" />
          {/* Lado direito do H - mais espesso e bem definido */}
          <rect x="12.5" y="4" width="3.5" height="12" fill="#6400A4" rx="1.75" />
          {/* Barra horizontal do H - mais espessa e bem definida */}
          <rect x="4" y="8.25" width="12" height="3.5" fill="#6400A4" rx="1.75" />
          
          {/* Detalhes tecnológicos simplificados mas mais visíveis */}
          <circle cx="5.75" cy="6" r="1.2" fill="#8B20EE" stroke="#6400A4" strokeWidth="1.5" />
          <circle cx="14.25" cy="6" r="1.2" fill="#8B20EE" stroke="#6400A4" strokeWidth="1.5" />
          <circle cx="5.75" cy="14" r="1.2" fill="#8B20EE" stroke="#6400A4" strokeWidth="1.5" />
          <circle cx="14.25" cy="14" r="1.2" fill="#8B20EE" stroke="#6400A4" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="1.5" fill="#FFFFFF" stroke="#6400A4" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}