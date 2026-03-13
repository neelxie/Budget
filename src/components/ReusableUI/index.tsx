import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  useRef,
} from "react";

//  Card
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}
export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--bg-surface)] rounded-xl elevation-2
        transition-shadow duration-200 ease-in-out
        ${onClick ? "cursor-pointer hover:elevation-4" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

//  Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "contained" | "outlined" | "text" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}
export function Button({
  children,
  variant = "contained",
  size = "md",
  loading = false,
  icon,
  className = "",
  disabled,
  onClick,
  ...rest
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const ripple = document.createElement("span");
    const diameter = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${e.clientX - rect.left - diameter / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - diameter / 2}px`;
    ripple.classList.add("ripple");
    btnRef.current.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
    onClick?.(e);
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const variantClasses = {
    contained: `
      bg-[var(--primary)] text-white font-medium
      hover:bg-[var(--primary-hover)] active:opacity-90
      disabled:bg-[var(--text-disabled)] disabled:text-white
    `,
    outlined: `
      border border-[var(--primary)] text-[var(--primary)] font-medium
      hover:bg-[var(--primary-light)] active:opacity-80
      disabled:border-[var(--border-color)] disabled:text-[var(--text-disabled)]
    `,
    text: `
      text-[var(--primary)] font-medium
      hover:bg-[var(--primary-light)] active:opacity-80
      disabled:text-[var(--text-disabled)]
    `,
    danger: `
      bg-[#f44336] text-white font-medium
      hover:bg-[#e53935] active:opacity-90
      disabled:bg-[var(--text-disabled)]
    `,
  };

  return (
    <button
      ref={btnRef}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`
        ripple-container inline-flex items-center justify-center
        rounded-lg transition-all duration-200 select-none
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

//  Badge
interface BadgeProps {
  children: ReactNode;
  color?: "blue" | "green" | "orange" | "purple" | "red" | "gray";
}
const badgeColors = {
  blue: "bg-[var(--primary-light)] text-[var(--primary)]",
  green: "bg-[var(--color-seeds-light)] text-[var(--color-seeds)]",
  orange: "bg-[var(--color-tools-light)] text-[var(--color-tools)]",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  red: "bg-[var(--color-error-50)] text-[var(--color-error-500)]",
  gray: "bg-[var(--bg-surface-2)] text-[var(--text-secondary)]",
};
export function Badge({ children, color = "blue" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[color]}`}
    >
      {children}
    </span>
  );
}

//  Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}
export function Input({
  label,
  error,
  icon,
  className = "",
  ...rest
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full bg-[var(--bg-surface)] border border-[var(--border-color)]
            rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]
            placeholder:text-[var(--text-disabled)]
            focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]
            transition-all duration-150
            ${icon ? "pl-9" : ""}
            ${error ? "border-[#f44336] focus:border-[#f44336] focus:ring-[#ffebee]" : ""}
            ${className}
          `}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-[#f44336]">{error}</p>}
    </div>
  );
}

//  Select
interface SelectProps {
  label?: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
}
export function Select({
  label,
  error,
  value,
  onChange,
  options,
  placeholder,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full bg-[var(--bg-surface)] border border-[var(--border-color)]
          rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]
          focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]
          transition-all duration-150 cursor-pointer
          ${error ? "border-[#f44336]" : ""}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#f44336]">{error}</p>}
    </div>
  );
}

//  Skeleton loader
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

//  Divider
export function Divider() {
  return <hr className="border-[var(--divider)] my-0" />;
}
