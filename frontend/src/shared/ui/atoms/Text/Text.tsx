import type { ReactNode } from 'react'
import styles from './Text.module.css'

type TextTag = 'p' | 'span' | 'h1' | 'h2' | 'h3'

type TextProps = {
  as?: TextTag
  size?: 'sm' | 'md' | 'lg' | 'xl'
  weight?: 'regular' | 'medium' | 'bold'
  tone?: 'default' | 'muted'
  className?: string
  children: ReactNode
}

export const Text = ({
  as: Component = 'p',
  size = 'md',
  weight = 'regular',
  tone = 'default',
  className,
  children,
}: TextProps) => {
  const classes = [styles.text, styles[size], styles[weight], styles[tone], className]
    .filter(Boolean)
    .join(' ')

  return <Component className={classes}>{children}</Component>
}
