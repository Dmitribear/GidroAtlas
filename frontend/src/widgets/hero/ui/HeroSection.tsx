import { Button } from '@shared/ui/atoms/Button/Button'
import { Tag } from '@shared/ui/atoms/Tag/Tag'
import { Text } from '@shared/ui/atoms/Text/Text'
import styles from './HeroSection.module.css'

const highlights = [
  { label: 'датчики', value: '120+' },
  { label: 'гигабайт данных / сутки', value: '48' },
  { label: 'регионов', value: '7' },
]

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <Tag>Пилот: гидрографическая аналитика</Tag>

      <Text as="h1" size="xl" weight="bold" className={styles.title}>
        Сценарии для воды, погодных рисков и инфраструктуры
      </Text>

      <Text as="p" size="md" tone="muted" className={styles.lead}>
        FSD + atomic каркас на React, готовый подключать реальное API, витрины данных и слой
        визуализации. Быстрый старт с понятной структурой и чистыми зависимостями.
      </Text>

      <div className={styles.actions}>
        <Button variant="primary">Запустить демо</Button>
        <Button variant="ghost">Документация</Button>
      </div>

      <div className={styles.stats}>
        {highlights.map(({ label, value }) => (
          <div className={styles.stat} key={label}>
            <span className={styles.value}>{value}</span>
            <span className={styles.label}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
