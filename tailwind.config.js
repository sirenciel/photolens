/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
  ],
  safelist: [
    // Dynamic color classes used in Settings -> Editing Status badges and color pickers
    'bg-yellow-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-slate-500',
    'bg-yellow-500/20', 'bg-blue-500/20', 'bg-purple-500/20', 'bg-green-500/20', 'bg-slate-500/20',
    'text-yellow-300', 'text-blue-300', 'text-purple-300', 'text-green-300', 'text-slate-300',
    'border-yellow-500/30', 'border-blue-500/30', 'border-purple-500/30', 'border-green-500/30', 'border-slate-500/30',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
