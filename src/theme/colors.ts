export const colors = {
  background: {
    peach: '#FBE5D8',
    warm: '#EFEFE4',
    cream: '#EDE9E1',
    softCream: '#EAE7E2',
    white: '#FFFFFF',
  },
  text: {
    primary: '#2E2B28',
    secondary: '#548A5C',
    muted: '#708C63',
    placeholder: '#B9C7B2',
    inverse: '#FFFFFF',
    dark: '#1F2024',
  },
  brand: {
    green: '#548A5C',
    orange: '#C2531C',
    dark: '#2E2B28',
  },
  surface: {
    white: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.5)',
    glassLight: 'rgba(255, 255, 255, 0.2)',
    glassSubtle: 'rgba(255, 255, 255, 0.05)',
    dark: '#2E2B28',
    plantPlaceholder: '#C2C8CA',
    overlay: 'rgba(0,0,0,0.2)',
  },
  border: {
    white: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.6)',
    glassSoft: 'rgba(255, 255, 255, 0.4)',
  },
  action: {
    primary: '#2E2B28',
    success: '#548A5C',
    danger: '#C2531C',
    disabled: 'rgba(46, 43, 40, 0.48)',
  },
  icon: {
    primary: '#2E2B28',
    inverse: '#FFFFFF',
    green: '#548A5C',
  },
  overlay: {
    dark18: 'rgba(46, 43, 40, 0.18)',
    light45: 'rgba(255, 255, 255, 0.45)',
    glass20: 'rgba(255, 255, 255, 0.2)',
  },
} as const;

export const gradients = {
  appBackground: [colors.background.peach, colors.background.warm],
} as const;
