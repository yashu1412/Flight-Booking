export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#FFFFFF",
        primaryDeep: "#E5E5E5",
        bg: "#0B0B0F",
        base: "#141414",
        surface: "#16161F",
        panelHover: "#1D1D28",
        borderSubtle: "rgba(255,255,255,0.08)",
        textPrimary: "#F5F5F7",
        textSecondary: "#B3B3B3",
        muted: "#7A7A86",
        success: "#16A34A",
        error: "#EF4444",
        netflixRed: "#FFFFFF",
        netflixRedHover: "#E5E5E5",
        // Light mode colors
        "light-bg": "#FFFFFF",
        "light-base": "#F8F9FA",
        "light-surface": "#F0F2F5",
        "light-text-primary": "#0B0B0F",
        "light-text-secondary": "#4B5563",
        "light-border": "rgba(0,0,0,0.08)"
      },
      backgroundImage: {
        brandGradient: "linear-gradient(135deg, #FFFFFF 0%, #000000 100%)",
        heroOverlay: "linear-gradient(180deg, rgba(11,11,15,0.35) 0%, #0B0B0F 75%)",
        radialWash1: "radial-gradient(600px circle at 20% 10%, rgba(255,255,255,0.05), transparent 55%)",
        radialWash2: "radial-gradient(600px circle at 80% 30%, rgba(255,255,255,0.03), transparent 55%)",
        lightHeroOverlay: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, #FFFFFF 75%)",
        lightRadialWash1: "radial-gradient(600px circle at 20% 10%, rgba(0,0,0,0.03), transparent 55%)",
        lightRadialWash2: "radial-gradient(600px circle at 80% 30%, rgba(0,0,0,0.02), transparent 55%)"
      },
      boxShadow: {
        glass: "0 0 40px rgba(255,255,255,0.18)",
        card: "0 10px 30px rgba(0,0,0,0.45)",
        cardHover: "0 18px 45px rgba(0,0,0,0.55), 0 0 0 1px rgba(229,9,20,0.25)",
        lightGlass: "0 0 40px rgba(0,0,0,0.08)",
        lightCard: "0 10px 30px rgba(0,0,0,0.08)",
        lightCardHover: "0 18px 45px rgba(0,0,0,0.12)"
      },
      borderRadius: {
        xl: "1rem"
      }
    }
  },
  plugins: []
}
