import { CheckCircle, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export function Alert({ type, title, message }: AlertProps) {
  const isSuccess = type === 'success';
  
  return (
    <div 
      className={`rounded-2xl p-6 border flex items-start gap-4 animate-fade-in-up ${
        isSuccess 
          ? 'bg-primary/10 border-primary/30' 
          : 'bg-destructive/10 border-destructive/30'
      }`}
    >
      {/* Icon */}
      <div className={`p-2 rounded-xl ${
        isSuccess ? 'bg-primary/20' : 'bg-destructive/20'
      }`}>
        {isSuccess ? (
          <CheckCircle className="w-6 h-6 text-primary" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-destructive" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className={`font-bold text-lg mb-1 ${
          isSuccess ? 'text-primary' : 'text-destructive'
        }`}>
          {title}
        </h3>
        <p className="text-foreground/80 text-sm leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
