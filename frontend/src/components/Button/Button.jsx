import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import './Button.css'

export default function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  icon = false,
  type = 'button',
  onClick,
  children,
  className = '',
}) {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim()

  const content = (
    <>
      {children}
      {icon && <ArrowRight size={16} />}
    </>
  )

  if (as === 'link' && to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {content}
      </Link>
    )
  }

  if (as === 'a' && href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {content}
    </button>
  )
}
