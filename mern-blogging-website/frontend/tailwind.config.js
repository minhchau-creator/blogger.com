/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        
        colors: {
            'white': '#FFFFFF',
            'black': '#242424',
            'grey': '#F3F3F3',
            'dark-grey': '#6B6B6B',
            'red': '#FF4E4E',
            'transparent': 'transparent',
            'twitter': '#1DA1F2',
            'purple': '#8B46FF'
        },

        fontSize: {
            'sm': ['12px', { lineHeight: '1.4' }],
            'base': ['14px', { lineHeight: '1.5' }],
            'xl': ['16px', { lineHeight: '1.6' }],
            '2xl': ['18px', { lineHeight: '1.6' }],
            '3xl': ['22px', { lineHeight: '1.4' }],
            '4xl': ['28px', { lineHeight: '1.3' }],
            '5xl': ['36px', { lineHeight: '1.2' }],
        },
        
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },

        extend: {
            fontFamily: {
              inter: ["'Inter'", "sans-serif"],
              gelasio: ["'Gelasio'", "serif"]
            },
        },

    },
    plugins: [],
};