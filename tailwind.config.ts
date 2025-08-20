
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "calma": {
          DEFAULT: "#645CBB",     // Cor principal Calma Blue
          blue: "#645CBB",        // Mesmo que DEFAULT para compatibilidade
          "blue-light": "#E5DEFF", // Background suave
          "blue-dark": "#5247A9",  // Hover states
          light: "#E5DEFF",       // Alias para blue-light
          dark: "#5247A9",        // Alias para blue-dark
        },
        "portal-purple": {
          DEFAULT: "#645CBB",     // Atualizado para Calma Blue
          dark: "#5247A9",        // Atualizado para Calma Blue Dark
          light: "#E5DEFF",       // Atualizado para Calma Blue Light
        },
      },
      fontFamily: {
        sans: ["Roboto", ...fontFamily.sans],
        display: ["Poppins", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        'gradient-portal': 'linear-gradient(135deg, #F8FAFC 0%, #E5DEFF 100%)',
        'gradient-button': 'linear-gradient(135deg, #645CBB 0%, #5247A9 100%)',
        'gradient-calma': 'linear-gradient(135deg, #E5DEFF 0%, #D6BCFA 100%)',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
