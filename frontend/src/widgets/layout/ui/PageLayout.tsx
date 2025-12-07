import type { ReactNode } from 'react'
import styles from './PageLayout.module.css'

type PageLayoutProps = {
  children: ReactNode
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className={styles.background}>
      <div className={styles.overlay} />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.branding}>
            <div className={styles.logoMark} />
            <div>
              <p className={styles.brandName}>GidroAtlas</p>
              <p className={styles.brandNote}>данные, сценарии, аналитика</p>
            </div>
          </div>

          <nav className={styles.nav}>
            <span>Документация</span>
            <span>API</span>
            <span>Помощь</span>
          </nav>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
