import { Tag } from '@shared/ui/atoms/Tag/Tag'
import { Text } from '@shared/ui/atoms/Text/Text'
import styles from './FeatureCard.module.css'

type FeatureCardProps = {
  title: string
  description: string
  tag: string
}

export const FeatureCard = ({ title, description, tag }: FeatureCardProps) => {
  return (
    <article className={styles.card}>
      <Tag>{tag}</Tag>
      <Text as="h3" size="lg" weight="bold">
        {title}
      </Text>
      <Text tone="muted">{description}</Text>
    </article>
  )
}
