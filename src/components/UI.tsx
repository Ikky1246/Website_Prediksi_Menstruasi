import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

// ==========================================
// BUTTON
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] cursor-pointer';
  
  const variants = {
    primary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-100 hover:shadow-lg focus:ring-rose-500',
    secondary: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100/60 focus:ring-rose-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-100 focus:ring-red-500',
    outline: 'bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 focus:ring-slate-300',
    ghost: 'bg-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ==========================================
// INPUT
// ==========================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 bg-white border ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-rose-400 focus:ring-rose-100'
          } rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:ring-4 placeholder-slate-400 ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs font-medium text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-xs text-slate-400">{helperText}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==========================================
// SELECT
// ==========================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`w-full px-4 py-2.5 bg-white border appearance-none ${
              error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-rose-400 focus:ring-rose-100'
            } rounded-xl text-sm text-slate-800 transition-all focus:outline-none focus:ring-4 ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-xs font-medium text-red-500 flex items-center gap-1">
            <AlertCircle size={12} /> {error}
          </span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ==========================================
// CARD
// ==========================================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-100/80 rounded-2xl p-6 shadow-sm shadow-rose-100/10 transition-all duration-300 hover:shadow-md hover:shadow-rose-100/20 ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between gap-4 mb-5 border-b border-slate-50 pb-4">
          <div>
            {title && (
              <h3 className="font-semibold text-slate-800 tracking-tight text-lg">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

// ==========================================
// MODAL
// ==========================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl z-10 border border-slate-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[75vh] overflow-y-auto pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// BADGE
// ==========================================
interface BadgeProps {
  variant?: 'rose' | 'slate' | 'green' | 'blue' | 'yellow' | 'red';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'rose', children }) => {
  const styles = {
    rose: 'bg-rose-50 text-rose-700 border border-rose-100',
    slate: 'bg-slate-50 text-slate-600 border border-slate-100',
    green: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    yellow: 'bg-amber-50 text-amber-700 border border-amber-100',
    red: 'bg-red-50 text-red-700 border border-red-100',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
};

// ==========================================
// ALERT
// ==========================================
interface AlertProps {
  type?: 'success' | 'info' | 'error' | 'warning';
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', children, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-100',
      text: 'text-emerald-800',
      icon: <CheckCircle className="text-emerald-500" size={18} />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-100',
      text: 'text-blue-800',
      icon: <Info className="text-blue-500" size={18} />,
    },
    error: {
      bg: 'bg-red-50 border-red-100',
      text: 'text-red-800',
      icon: <AlertCircle className="text-red-500" size={18} />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-100',
      text: 'text-amber-800',
      icon: <AlertCircle className="text-amber-500" size={18} />,
    },
  };

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 transition-all duration-300 ${styles[type].bg} ${styles[type].text}`}>
      <div className="flex-shrink-0 mt-0.5">{styles[type].icon}</div>
      <div className="flex-grow text-sm">{children}</div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 ml-auto p-0.5 hover:bg-black/5 rounded">
          <X size={14} />
        </button>
      )}
    </div>
  );
};

// ==========================================
// TABLE
// ==========================================
interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-left border-collapse bg-white">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {headers.map((header, i) => (
              <th key={i} className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 text-sm text-slate-700">
          {children}
        </tbody>
      </table>
    </div>
  );
};

// ==========================================
// CHART CONTAINER
// ==========================================
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ title, subtitle, children }) => {
  return (
    <Card title={title} subtitle={subtitle} className="w-full overflow-hidden">
      <div className="h-64 flex items-center justify-center">
        {children}
      </div>
    </Card>
  );
};
