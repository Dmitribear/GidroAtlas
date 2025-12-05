import { FeatureCard } from '@shared/ui/molecules/FeatureCard/FeatureCard'
import styles from './FeatureGrid.module.css'

export type FeatureItem = {
  id: string
  title: string
  description: string
  tag: string
}

type FeatureGridProps = {
  items: FeatureItem[]
}

export const FeatureGrid = ({ items }: FeatureGridProps) => {
  return (
    <section className={styles.grid}>
      {items.map((item) => (
        <FeatureCard
          key={item.id}
          title={item.title}
          description={item.description}
          tag={item.tag}
        />
      ))}
    </section>
  )
}
