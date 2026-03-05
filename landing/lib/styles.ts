// FanZone Brand Colors - Matching Mobile App
export const colors = {
  darkGreen: '#0A1F1A',
  mediumGreen: '#1A3A2E',
  accentGreen: '#2D5F4C',
  forestGreen: '#4A8B6F',
  limeGreen: '#B8D96E',
  cardGreen: '#1E3D32',
};

// Gradient Styles
export const gradients = {
  background: `linear-gradient(to bottom, ${colors.darkGreen}, #0F2820, ${colors.darkGreen})`,
  button: `linear-gradient(to right, ${colors.accentGreen}, ${colors.forestGreen}, ${colors.limeGreen})`,
  buttonHover: `linear-gradient(to right, ${colors.forestGreen}, ${colors.limeGreen})`,
  text: `linear-gradient(to right, ${colors.forestGreen}, ${colors.limeGreen})`,
  textLong: `linear-gradient(to right, ${colors.forestGreen}, ${colors.limeGreen}, ${colors.limeGreen})`,
  border: `linear-gradient(135deg, ${colors.accentGreen}, ${colors.forestGreen}, ${colors.limeGreen})`,
  card: `linear-gradient(to bottom right, ${colors.accentGreen}, ${colors.forestGreen}, ${colors.limeGreen})`,
};

// Common Styles
export const styles = {
  badge: {
    backgroundColor: `rgba(45, 95, 76, 0.2)`,
    border: `1px solid rgba(74, 139, 111, 0.3)`,
  },
  glassEffect: {
    background: `rgba(26, 58, 46, 0.6)`,
    backdropFilter: 'blur(12px)',
    border: `1px solid rgba(45, 95, 76, 0.3)`,
  },
  gradientText: {
    background: gradients.text,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  floatingOrb: (opacity: number = 0.1) => ({
    backgroundColor: `rgba(45, 95, 76, ${opacity})`,
  }),
};

// Helper function for gradient text
export const getGradientTextStyle = (gradient: string = gradients.text) => ({
  background: gradient,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
});
