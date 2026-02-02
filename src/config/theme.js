export const theme = {
  colors: {
    light: {
      text: '#473729',
      textSecondary: '#A09485',

      accent: '#FFBC2d',

      background: '#f3f2ee',
      surface: '#EDE9E4',
      border: '#E8E2D8',

      danger: '#8B4513',
      success: '#388E3C',
      warning: '#D2691E',

      overlay: 'rgba(0, 0, 0, 0.5)',

      inverse: '#ffffff',
    },
    dark: {
      text: '#F5F2ED',
      textSecondary: '#D4C4B7',

      accent: '#FFD700',

      background: '#2A2520',
      surface: '#3A332E',
      border: '#5A524D',

      danger: '#CD853F',
      success: '#6B8E23',
      warning: '#DAA520',

      overlay: 'rgba(0, 0, 0, 0.7)',

      inverse: '#1A1613',
    },
  },

  typography: {
    families: {
      primary: 'font-default',
      secondary: 'font-default-secondary',
    },
    fontFamily: 'font-default',
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    weightsByFamily: {
      primary: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      secondary: {
        regular: '400',
        medium: '600',
        semibold: '700',
        bold: '800',
      },
    },
    fontFaces: {
      primary: {
        regular: 'font-default',
        medium: 'font-default',
        semibold: 'font-default',
        bold: 'font-bold',
      },
      secondary: {
        regular: 'font-default-secondary',
        medium: 'font-default-secondary',
        semibold: 'font-bold-secondary',
        bold: 'font-bold-secondary',
      },
    },
    variants: {
      tiny: { family: 'primary', weight: 'regular' },
      caption: { family: 'primary', weight: 'regular' },
      body: { family: 'primary', weight: 'regular' },
      subtitle: { family: 'primary', weight: 'regular' },
      title: { family: 'primary', weight: 'regular' },
    },
    sizes: {
      tiny: 11,
      caption: 13,
      body: 15,
      subtitle: 19,
      title: 23,
    },
    lineHeights: {
      tiny: 14,
      caption: 16,
      body: 20,
      subtitle: 24,
      title: 28,
    },
    iconSizes: {
      tiny: 14,
      caption: 16,
      body: 20,
      subtitle: 24,
      title: 28,
    },
  },

  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3.0,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 5.0,
      elevation: 5,
    },
  },

  animations: {
    duration: {
      standard: 350,
      quick: 250,
    },
  },
};
