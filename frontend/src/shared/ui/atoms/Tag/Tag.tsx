import type { HTMLAttributes } from 'react'
import styles from './Tag.module.css'

type TagProps = HTMLAttributes<HTMLSpanElement>

export const Tag = ({ className, ...rest }: TagProps) => {
  const classes = [styles.tag, className].filter(Boolean).join(' ')
  return <span className={classes} {...rest} />
}
