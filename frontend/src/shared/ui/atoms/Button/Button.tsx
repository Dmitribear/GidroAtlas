import type { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export const Button = ({ variant = 'primary', className, ...rest }: ButtonProps) => {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ')

  return <button className={classes} {...rest} />
}
