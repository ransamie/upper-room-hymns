const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Colors
  content = content.replace(/bg-brand-900/g, 'bg-bg-primary');
  content = content.replace(/bg-brand-800/g, 'bg-bg-secondary');
  content = content.replace(/text-slate-50/g, 'text-text-primary');
  content = content.replace(/text-slate-100/g, 'text-text-primary');
  content = content.replace(/text-slate-200/g, 'text-text-primary');
  content = content.replace(/text-white/g, 'text-text-primary');
  content = content.replace(/text-slate-300/g, 'text-text-secondary');
  content = content.replace(/text-slate-400/g, 'text-text-secondary');
  content = content.replace(/text-slate-500/g, 'text-text-secondary');
  
  // Borders and hover backgrounds
  content = content.replace(/border-white\/[0-9]+/g, 'border-border-subtle');
  content = content.replace(/bg-white\/[0-9]+/g, 'bg-border-subtle');
  content = content.replace(/bg-black\/40/g, 'bg-bg-secondary');
  
  // Specific Drawer and App fixes
  if (filePath.includes('Drawer.tsx')) {
    // Add theme toggle button
    content = content.replace(
      /<RefreshCw size=\{20\} className="mr-4 text-accent-gold" \/>\s*<span className="font-medium">Update the App<\/span>/g,
      `<RefreshCw size={20} className="mr-4 text-accent-gold" />
                  <span className="font-medium">Theme: {isLightMode ? 'Light' : 'Dark'}</span>`
    );
    // Add props
    content = content.replace(
      /interface DrawerProps {/,
      `interface DrawerProps {\n  isLightMode: boolean;\n  toggleTheme: () => void;`
    );
    content = content.replace(
      /export default function Drawer\(\{ isOpen, onClose \}: DrawerProps\) {/,
      `export default function Drawer({ isOpen, onClose, isLightMode, toggleTheme }: DrawerProps) {`
    );
    // Add onClick to the theme button (which was formerly update the app, which is the 3rd button)
    content = content.replace(
      /<button className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-border-subtle rounded-xl transition-colors">(\s*<RefreshCw)/,
      `<button onClick={toggleTheme} className="w-full flex items-center px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-border-subtle rounded-xl transition-colors">$1`
    );
    // For other buttons, add a toast or alert
    content = content.replace(
      /<button className="w-full flex items-center px-4 py-3/g,
      `<button onClick={(e) => { if(!e.currentTarget.getAttribute('onClick')) alert('Feature coming soon!'); }} className="w-full flex items-center px-4 py-3`
    );
  }
  
  if (filePath.includes('App.tsx')) {
    content = content.replace(
      /const \[activeTab, setActiveTab\] = useState<'all' \| 'index' \| 'favorite'>\('all'\);/,
      `const [activeTab, setActiveTab] = useState<'all' | 'index' | 'favourite'>('all');
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);`
    );
    
    // rename favorite to favourite
    content = content.replace(/'favorite'/g, "'favourite'");
    content = content.replace(/"favorite"/g, '"favourite"');
    
    // add scroll to top
    content = content.replace(
      /onClick=\{.*?setSelectedHymn\(hymn\).*?\}/g,
      `onClick={() => { setSelectedHymn(hymn); window.scrollTo(0, 0); }}`
    );
    
    // Drawer props
    content = content.replace(
      /<Drawer isOpen=\{isDrawerOpen\} onClose=\{.*?\} \/>/,
      `<Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} isLightMode={isLightMode} toggleTheme={() => setIsLightMode(!isLightMode)} />`
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

updateFile('./src/App.tsx');
updateFile('./src/components/Drawer.tsx');
console.log('Updated App and Drawer!');
