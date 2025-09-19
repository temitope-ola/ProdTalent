const fs = require('fs');

const filePath = '/Users/franceola/Desktop/Archive 6/src/pages/RecruiterDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Supprimer la gestion manuelle de screenWidth
content = content.replace(/const \[screenWidth, setScreenWidth\] = useState\(window\.innerWidth\);/, '');
content = content.replace(/  \/\/ Gérer le redimensionnement de l'écran[\s\S]*?  }, \[\]\);/, '');

// Remplacements pour le breakpoint à 540px
const replacements = [
  // screenWidth <= 480 devient isMobile
  [/screenWidth <= 480/g, 'isMobile'],
  // screenWidth <= 768 devient !isMobile
  [/screenWidth <= 768/g, '!isMobile'],
  // Expressions ternaires simples
  [/screenWidth <= 480 \? '([^']+)' : '([^']+)'/g, "isMobile ? '$1' : '$2'"],
  [/screenWidth <= 768 \? '([^']+)' : '([^']+)'/g, "!isMobile ? '$1' : '$2'"],
  [/screenWidth <= 480 \? ([^:]+) : ([^,}]+)/g, "isMobile ? $1 : $2"],
  [/screenWidth <= 768 \? ([^:]+) : ([^,}]+)/g, "!isMobile ? $1 : $2"],
  // Grid template columns
  [/gridTemplateColumns: screenWidth <= 480[^,}]+/g, "gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))'"],
];

replacements.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

fs.writeFileSync(filePath, content);
console.log('✅ RecruiterDashboard responsive conversion completed');