import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export function Alert({ type, title, message }: AlertProps) {
  const isSuccess = type === 'success';
  const isInfo = type === 'info';
  
  const getStyles = () => {
    if (isSuccess) return 'bg-primary/10 border-primary/30';
    if (isInfo) return 'bg-blue-500/10 border-blue-500/30';
    return 'bg-destructive/10 border-destructive/30';
  };
  
  const getIconBg = () => {
    if (isSuccess) return 'bg-primary/20';
    if (isInfo) return 'bg-blue-500/20';
    return 'bg-destructive/20';
  };
  
  const getTextColor = () => {
    if (isSuccess) return 'text-primary';
    if (isInfo) return 'text-blue-400';
    return 'text-destructive';
  };
  
  return (
    <div 
      className={`rounded-2xl p-6 border flex items-start gap-4 animate-fade-in-up ${getStyles()}`}
    >
      {/* Icon */}
      <div className={`p-2 rounded-xl ${getIconBg()}`}>
        {isSuccess ? (
          <CheckCircle className="w-6 h-6 text-primary" />
        ) : isInfo ? (
          <Info className="w-6 h-6 text-blue-400" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-destructive" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className={`font-bold text-lg mb-1 ${getTextColor()}`}>
          {title}
        </h3>
        <p className="text-foreground/80 text-sm leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
