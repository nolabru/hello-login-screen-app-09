import React from 'react';
interface LogoProps {
  showTextLogo?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
const Logo: React.FC<LogoProps> = ({
  showTextLogo = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-16 h-15',    
    md: 'w-24 h-23',     
    lg: 'w-32 h-30'      
  };
  return <div className="flex flex-col items-center">
      <img src="/lovable-uploads/splash-screen.png" alt="Portal Calma Logo" className={`${sizeClasses[size]} mb-2`} />
    </div>;
};
export default Logo;
