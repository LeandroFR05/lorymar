// Ilustración decorativa de hoja reutilizable.
export default function Leaf({ className = '', color = 'currentColor' }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <path
        d="M60 110C60 70 75 35 108 12C104 58 88 92 60 110Z"
        fill={color}
        opacity="0.9"
      />
      <path
        d="M60 110C60 80 48 55 18 40C20 72 34 98 60 110Z"
        fill={color}
        opacity="0.6"
      />
      <path d="M60 110C66 80 80 48 104 18" stroke="#f7f3ec" strokeWidth="1.5" opacity="0.6" />
    </svg>
  )
}
