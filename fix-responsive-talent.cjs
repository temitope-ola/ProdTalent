const fs = require('fs');

const filePath = '/Users/franceola/Desktop/Archive 6/src/pages/TalentDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Remplacements pour le breakpoint à 540px
const replacements = [
  // screenWidth <= 480 devient isMobile (puisque 540 > 480)
  [/screenWidth <= 480/g, 'isMobile'],
  // screenWidth <= 768 devient !isMobile (puisque 540 < 768)
  [/screenWidth <= 768/g, '!isMobile'],
  // Les expressions ternaires complexes
  [/screenWidth <= 480 \? '10px' : screenWidth <= 768 \? '15px' : '20px'/g, "isMobile ? '10px' : '20px'"],
  [/screenWidth <= 480 \? '11px' : '12px'/g, "isMobile ? '11px' : '12px'"],
  [/screenWidth <= 480 \? '18px' : '20px'/g, "isMobile ? '18px' : '20px'"],
  [/screenWidth <= 480 \? '12px' : '20px'/g, "isMobile ? '12px' : '20px'"],
  [/screenWidth <= 480 \? '0 10px' : '0'/g, "isMobile ? '0 10px' : '0'"],
  [/screenWidth <= 480 \? '15px' : '20px'/g, "isMobile ? '15px' : '20px'"],
  [/screenWidth <= 480 \? 'column' : 'row'/g, "isMobile ? 'column' : 'row'"],
  [/screenWidth <= 480 \? 'stretch' : 'center'/g, "isMobile ? 'stretch' : 'center'"],
  [/screenWidth <= 480 \? '12px' : '0'/g, "isMobile ? '12px' : '0'"],
  [/screenWidth <= 480 \? '15px' : '20px'/g, "isMobile ? '15px' : '20px'"],
  [/screenWidth <= 480 \? '0' : screenWidth <= 768 \? '10px' : '20px'/g, "isMobile ? '0' : '20px'"],
  [/screenWidth <= 480 \? 'column' : 'row'/g, "isMobile ? 'column' : 'row'"],
  [/screenWidth <= 480 \? 'stretch' : 'center'/g, "isMobile ? 'stretch' : 'center'"],
  [/screenWidth <= 480 \? '8px' : '16px'/g, "isMobile ? '8px' : '16px'"],
  [/screenWidth <= 480 \? '10px 16px' : '8px 12px'/g, "isMobile ? '10px 16px' : '8px 12px'"],
  [/screenWidth <= 480 \? '16px' : '16px'/g, "'16px'"],
  [/screenWidth <= 480 \? '140px' : 'auto'/g, "isMobile ? '140px' : 'auto'"],
  [/screenWidth <= 480 \? '13px' : '14px'/g, "isMobile ? '13px' : '14px'"],
  [/screenWidth <= 480 \? 'center' : 'left'/g, "isMobile ? 'center' : 'left'"],
  [/screenWidth <= 480 \? '16px' : screenWidth <= 768 \? '18px' : '20px'/g, "isMobile ? '16px' : '20px'"],
  [/screenWidth <= 480 \? '12px' : '14px'/g, "isMobile ? '12px' : '14px'"],
  [/screenWidth <= 480 \? 'center' : 'auto'/g, "isMobile ? 'center' : 'auto'"],
  [/screenWidth <= 480 \? '15px' : '20px'/g, "isMobile ? '15px' : '20px'"],
  [/screenWidth <= 480 \? '12px' : '16px'/g, "isMobile ? '12px' : '16px'"],
  [/screenWidth <= 480 \? '0 5px' : screenWidth <= 768 \? '0 10px' : '0'/g, "isMobile ? '0 5px' : '0'"],
  [/screenWidth <= 480 \? '12px' : '16px'/g, "isMobile ? '12px' : '16px'"],
  [/screenWidth <= 480 \? '0 10px' : '0'/g, "isMobile ? '0 10px' : '0'"],

  // Grid template columns complexes - simplifions pour le mobile
  [/gridTemplateColumns: screenWidth <= 480[^,}]+/g, "gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))'"],
];

replacements.forEach(([pattern, replacement]) => {
  content = content.replace(pattern, replacement);
});

fs.writeFileSync(filePath, content);
console.log('✅ TalentDashboard responsive conversion completed');