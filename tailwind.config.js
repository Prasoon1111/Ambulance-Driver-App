/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#E53935',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceMuted: '#F3F4F6',
        border: '#E5E7EB',
        textPrimary: '#111827',
        textMuted: '#4B5563',
        emergency: '#E53935',
      },
      boxShadow: {
        soft: '0 16px 40px rgba(15, 23, 42, 0.08)',
        card: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
