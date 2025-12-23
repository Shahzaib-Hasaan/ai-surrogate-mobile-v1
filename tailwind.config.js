/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        surrogate: {
          dark: '#050511', // Deep space blue/black
          card: '#0F1123', // Slightly lighter for cards
          glass: 'rgba(20, 20, 40, 0.7)', // Translucent glass
        },
        neon: {
          primary: '#8B5CF6', // Electric Purple
          secondary: '#06b6d4', // Cyan
          accent: '#EC4899', // Pink
          success: '#10B981', // Emerald
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      }
    },
  },
  plugins: [],
}
