import { cn } from '@/utils'

interface CheckboxProps {
  checked?: boolean
  selected?: boolean  // highlighted but not checked
  disabled?: boolean
  onChange?: () => void
  className?: string
}

export function Checkbox({ checked, selected, disabled, onChange, className }: CheckboxProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'checkbox',
        checked  && 'checked',
        selected && !checked && 'selected',
        disabled && 'opacity-30 cursor-not-allowed',
        'focus-visible:shadow-glow',
        className,
      )}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <svg
          className="w-3 h-3 text-on-primary animate-spin-in"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2 6 5 9 10 3" />
        </svg>
      )}
    </button>
  )
}
