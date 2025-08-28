// Tamil Nadu Spice-Themed Color Palette
export const spiceTheme = {
  colors: {
    // Primary spice colors
    saffron: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316', // Main saffron
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
    turmeric: {
      50: '#FEFCE8',
      100: '#FEF9C3',
      200: '#FEF08A',
      300: '#FDE047',
      400: '#FACC15',
      500: '#EAB308', // Main turmeric
      600: '#CA8A04',
      700: '#A16207',
      800: '#854D0E',
      900: '#713F12',
    },
    chili: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444', // Main chili red
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
    },
    cardamom: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E', // Main cardamom green
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    cinnamon: {
      50: '#FDF2F8',
      100: '#FCE7F3',
      200: '#FBCFE8',
      300: '#F9A8D4',
      400: '#F472B6',
      500: '#EC4899', // Main cinnamon
      600: '#DB2777',
      700: '#BE185D',
      800: '#9D174D',
      900: '#831843',
    },
  },
  gradients: {
    spiceMix: 'from-orange-500 via-red-500 to-yellow-500',
    warmSpice: 'from-orange-400 to-red-600',
    goldenSpice: 'from-yellow-400 to-orange-500',
    richSpice: 'from-red-600 to-orange-800',
  },
  animations: {
    spiceFloat: 'spice-float 6s ease-in-out infinite',
    spiceGlow: 'spice-glow 2s ease-in-out infinite alternate',
    spicePulse: 'spice-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  }
};

// Animation keyframes for Tailwind CSS
export const spiceAnimations = `
  @keyframes spice-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }
  
  @keyframes spice-glow {
    from { box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); }
    to { box-shadow: 0 0 30px rgba(249, 115, 22, 0.8); }
  }
  
  @keyframes spice-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

export const spicePatterns = {
  paisley: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><path d=\"M20 20c20-20 60 0 60 40s-40 60-60 40c0-20 20-40 0-40s-20-20 0-40z\" fill=\"%23f97316\" opacity=\"0.1\"/></svg>')",
  mandala: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><circle cx=\"50\" cy=\"50\" r=\"30\" fill=\"none\" stroke=\"%23f97316\" stroke-width=\"2\" opacity=\"0.1\"/><circle cx=\"50\" cy=\"50\" r=\"20\" fill=\"none\" stroke=\"%23dc2626\" stroke-width=\"1\" opacity=\"0.1\"/></svg>')",
};
