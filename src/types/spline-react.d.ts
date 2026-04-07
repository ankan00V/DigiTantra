declare module '@splinetool/react-spline' {
  import type { ComponentType, CSSProperties } from 'react';

  type SplineProps = {
    scene: string;
    className?: string;
    style?: CSSProperties;
    onLoad?: () => void;
  };

  const Spline: ComponentType<SplineProps>;
  export default Spline;
}
