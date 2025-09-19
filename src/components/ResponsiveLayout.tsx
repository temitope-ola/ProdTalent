import React, { useState, useEffect, ReactNode } from 'react';

interface ResponsiveLayoutProps {
  children: ReactNode;
  breakpoint?: number;
  isMobile?: boolean;
  onMobileChange?: (isMobile: boolean) => void;
}

export const useResponsive = (breakpoint: number = 540) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= breakpoint;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};

// Helper component for responsive containers
export const ResponsiveContainer: React.FC<{
  children: ReactNode;
  desktopStyle?: React.CSSProperties;
  mobileStyle?: React.CSSProperties;
  breakpoint?: number;
}> = ({ children, desktopStyle = {}, mobileStyle = {}, breakpoint = 540 }) => {
  const isMobile = useResponsive(breakpoint);

  const baseStyle: React.CSSProperties = {
    width: '100%',
    transition: 'all 0.3s ease',
  };

  const style = {
    ...baseStyle,
    ...(isMobile ? mobileStyle : desktopStyle),
  };

  return <div style={style}>{children}</div>;
};

// Helper component for responsive flex layouts
export const ResponsiveFlex: React.FC<{
  children: ReactNode;
  gap?: string;
  breakpoint?: number;
  mobileDirection?: 'column' | 'row';
  desktopDirection?: 'column' | 'row';
}> = ({
  children,
  gap = '20px',
  breakpoint = 540,
  mobileDirection = 'column',
  desktopDirection = 'row'
}) => {
  const isMobile = useResponsive(breakpoint);

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: isMobile ? mobileDirection : desktopDirection,
    gap,
    width: '100%',
    transition: 'all 0.3s ease',
  };

  return <div style={style}>{children}</div>;
};

// Helper component for responsive grid
export const ResponsiveGrid: React.FC<{
  children: ReactNode;
  desktopColumns?: number;
  mobileColumns?: number;
  gap?: string;
  breakpoint?: number;
}> = ({
  children,
  desktopColumns = 2,
  mobileColumns = 1,
  gap = '20px',
  breakpoint = 540
}) => {
  const isMobile = useResponsive(breakpoint);

  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${isMobile ? mobileColumns : desktopColumns}, 1fr)`,
    gap,
    width: '100%',
    transition: 'all 0.3s ease',
  };

  return <div style={style}>{children}</div>;
};

export default ResponsiveContainer;