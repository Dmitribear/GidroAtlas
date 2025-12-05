import { Text } from '@shared/ui/atoms/Text/Text'
import { FeatureGrid } from '@shared/ui/organisms/FeatureGrid/FeatureGrid'
import { featureList } from '@shared/config/features'
import { HeroSection } from '@widgets/hero'
import { PageLayout } from '@widgets/layout'
import styles from './HomePage.module.css'

export const HomePage = () => {
  return (
    <PageLayout>
      <HeroSection />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Text as="h2" size="lg" weight="bold">
            Основные блоки
          </Text>
          <Text tone="muted">
            FSD-слои уже разведены: shared/ui c атомами и молекулами, виджеты, страницы. Добавляйте
            сущности и фичи без пересечений.
          </Text>
        </div>

        <FeatureGrid items={featureList} />
      </section>
    </PageLayout>
  )
}
