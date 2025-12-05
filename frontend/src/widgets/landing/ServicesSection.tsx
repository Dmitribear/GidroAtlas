import React from 'react'

type ServiceCard = {
  title: string
  description: string
  icon: string
  bullet1: string
  bullet2?: string
  bullet3?: string
  tone?: 'dark' | 'light'
}

const SERVICES: ServiceCard[] = [
  {
    title: 'Product Design',
    description: 'UI/UX that feels intuitive. We design systems that scale and interfaces that delight users on every click.',
    icon: 'layers',
    bullet1: 'Design Systems',
    bullet2: 'Prototyping',
    tone: 'light',
  },
  {
    title: 'Development',
    description: 'Clean code, fast load times, and buttery smooth animations. We build with the latest tech stack.',
    icon: 'code-2',
    bullet1: 'React & Next.js',
    bullet2: 'Creative Coding',
    bullet3: 'Headless CMS',
    tone: 'dark',
  },
  {
    title: 'Brand Strategy',
    description: 'Finding your voice in a crowded room. We craft identities that people remember and relate to.',
    icon: 'megaphone',
    bullet1: 'Visual Identity',
    bullet2: 'Tone of Voice',
    tone: 'light',
  },
]

export const ServicesSection: React.FC = () => {
  return (
    <section id="services" className="py-24 px-6 bg-slate-50 rounded-[3rem] mx-4 mb-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-fuchsia-600 font-semibold tracking-widest uppercase text-xs mb-4 block">Our Expertise</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-6">
            We don&apos;t just make it look good. We make it work.
          </h2>
          <p className="text-slate-600 text-lg md:text-xl">
            Combining data-driven strategy with &quot;whoa, that&apos;s cool&quot; design.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className={`p-10 rounded-[2rem] transition-shadow duration-300 ${
                service.tone === 'dark'
                  ? 'bg-slate-900 text-white shadow-xl transform md:-translate-y-4'
                  : 'bg-white shadow-sm hover:shadow-xl'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${
                  service.tone === 'dark' ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-blue-100 text-blue-600'
                }`}
              >
                <i data-lucide={service.icon} className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
              <p className={`leading-relaxed mb-8 ${service.tone === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {service.description}
              </p>
              <ul className="space-y-3">
                {[service.bullet1, service.bullet2, service.bullet3].filter(Boolean).map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-sm font-medium">
                    <i
                      data-lucide="check-circle-2"
                      className={`w-4 h-4 ${service.tone === 'dark' ? 'text-fuchsia-500' : 'text-blue-500'}`}
                    />
                    <span className={service.tone === 'dark' ? 'text-slate-300' : 'text-slate-700'}>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
