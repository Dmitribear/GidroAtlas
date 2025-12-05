import React from 'react'

type WorkCard = {
  title: string
  subtitle: string
  tag: string
  image?: string
  span?: string
  tone?: 'indigo' | 'rose' | 'teal'
}

const WORK: WorkCard[] = [
  {
    title: 'Nova Wallet',
    subtitle: 'App Design & Branding',
    tag: 'Fintech',
    image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=2000',
    span: 'lg:col-span-8',
  },
  {
    title: 'Soundbox',
    subtitle: 'Web Experience',
    tag: 'Music',
    span: 'lg:col-span-4',
    tone: 'indigo',
  },
  {
    title: 'Sweet Tooth',
    subtitle: 'Packaging & 3D',
    tag: 'Food',
    span: 'lg:col-span-5',
    tone: 'rose',
  },
  {
    title: 'Bolt Energy',
    subtitle: 'Corporate Identity',
    tag: 'Energy',
    span: 'lg:col-span-7',
    tone: 'teal',
  },
]

export const FeaturedWork: React.FC = () => {
  return (
    <section id="work" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4">Selected Work</h2>
            <p className="text-slate-500 text-lg">Pixels with personality.</p>
          </div>
          <a
            href="#contact"
            className="hidden md:flex items-center gap-2 text-sm font-semibold uppercase tracking-wide border-b border-black pb-1 hover:text-fuchsia-600 hover:border-fuchsia-600 transition-colors"
          >
            View All Projects
            <i data-lucide="arrow-up-right" className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {WORK.map((item, index) => (
            <article
              key={item.title}
              className={`${item.span ?? 'lg:col-span-6'} group cursor-pointer ${index === 1 ? 'mt-12 md:mt-0' : ''}`}
            >
              <div
                className={`relative overflow-hidden rounded-[2.5rem] aspect-[4/3] mb-6 hover-pop ${
                  item.tone === 'indigo'
                    ? 'bg-indigo-100 aspect-[3/4]'
                    : item.tone === 'rose'
                      ? 'bg-rose-100 aspect-[1/1]'
                      : item.tone === 'teal'
                        ? 'bg-teal-50 aspect-[16/10]'
                        : 'bg-slate-100'
                }`}
              >
                {!item.tone && (
                  <div className="absolute inset-0 bg-[#E9E4DE] flex items-center justify-center p-12">
                    <div
                      className="w-full h-full bg-cover bg-center rounded-2xl shadow-lg border border-slate-200/50"
                      style={{ backgroundImage: `url('${item.image}')` }}
                    ></div>
                  </div>
                )}

                {item.tone === 'indigo' && (
                  <div className="absolute inset-0 bg-indigo-500 flex items-center justify-center text-white">
                    <i data-lucide="music" className="w-32 h-32 opacity-20 animate-pulse" />
                    <span className="absolute text-8xl font-bold tracking-tighter opacity-10 rotate-90 top-10 -right-10">
                      VIBE
                    </span>
                  </div>
                )}

                {item.tone === 'rose' && (
                  <div className="absolute inset-0 bg-[#FF6B6B] flex flex-col items-center justify-center p-8 text-white">
                    <h4 className="text-5xl font-bold tracking-tighter text-center leading-none">YUMMY</h4>
                    <h4 className="text-5xl font-bold tracking-tighter text-center leading-none">GUMMY</h4>
                  </div>
                )}

                {item.tone === 'teal' && (
                  <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2">E</div>
                      <div className="text-3xl font-semibold tracking-tight">Energy Reborn</div>
                    </div>
                  </div>
                )}

                {!item.tone && (
                  <div className="absolute top-8 left-8 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-semibold">
                    {item.tag}
                  </div>
                )}
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-slate-500">{item.subtitle}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                  <i data-lucide="arrow-right" className="w-5 h-5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
