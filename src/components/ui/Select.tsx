import { cn } from '@/lib/utils/cn';
import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5',
            'text-text-primary text-sm appearance-none',
            'focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20',
            'transition-all duration-200',
            'backdrop-blur-sm',
            'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]',
            error && 'border-accent-red/50',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-dark-800 text-text-muted">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-dark-800 text-text-primary"
            >
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-accent-red">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
