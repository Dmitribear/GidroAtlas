import React from 'react'

export const Marquee: React.FC = () => {
  return (
    <div className="py-12 bg-lime-300 -rotate-1 overflow-hidden border-y-2 border-black">
      <div className="whitespace-nowrap flex gap-8 animate-marquee">
        <span className="text-4xl font-bold uppercase tracking-tight text-black flex items-center gap-8">
          Strategy <i data-lucide="star" className="w-8 h-8 fill-black" />
          Branding <i data-lucide="star" className="w-8 h-8 fill-black" />
          Web Design <i data-lucide="star" className="w-8 h-8 fill-black" />
          Development <i data-lucide="star" className="w-8 h-8 fill-black" />
          Motion <i data-lucide="star" className="w-8 h-8 fill-black" />
          Strategy <i data-lucide="star" className="w-8 h-8 fill-black" />
          Branding <i data-lucide="star" className="w-8 h-8 fill-black" />
          Web Design <i data-lucide="star" className="w-8 h-8 fill-black" />
          Development <i data-lucide="star" className="w-8 h-8 fill-black" />
          Motion <i data-lucide="star" className="w-8 h-8 fill-black" />
        </span>
      </div>
    </div>
  )
}
