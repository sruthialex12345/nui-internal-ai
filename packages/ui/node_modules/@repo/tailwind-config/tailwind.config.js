/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    // Apps
    "../../apps/*/src/**/*.{js,ts,jsx,tsx}",
    "../../apps/*/index.html",
    // Packages
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
    "../../packages/components/**/*.{js,ts,jsx,tsx}",
    // Specific package paths for direct imports
    "../ui/**/*.{js,ts,jsx,tsx}",
    "../components/**/*.{js,ts,jsx,tsx}",
    // Node modules when linked via workspace
    "./node_modules/@repo/ui/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@repo/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
          subtle: "hsl(var(--muted-blue-gray))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // Custom InvestGrade IQ colors
        teal: {
          primary: "var(--teal-primary)",
          light: "var(--teal-light)",
          lighter: "var(--teal-lighter)",
          dark: "var(--teal-dark)",
          darker: "var(--teal-darker)",
        },
        slate: {
          dark: "var(--slate-dark)",
          medium: "var(--slate-medium)",
          light: "var(--slate-light)",
        },
        warm: {
          accent: "var(--warm-accent)",
          light: "var(--warm-light)",
        },
        neutral: {
          light: "var(--neutral-light)",
          medium: "var(--neutral-medium)",
          dark: "var(--neutral-dark)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
        },
      },
      spacing: {
        'page-margin': 'var(--page-margin)',
        'tile-gap': 'var(--tile-gap)',
        'tile-size': 'var(--tile-size)',
      },
      borderRadius: {
        'tile': 'var(--tile-radius)',
      },
      gridTemplateColumns: {
        'page-portrait': 'repeat(auto-fit, minmax(var(--tile-size), 1fr))',
        'page-landscape': 'repeat(auto-fit, minmax(var(--tile-size), 1fr))',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate")
  ],
};