/**
 * Маппинг названий объектов на пути к изображениям
 * Изображения должны быть размещены в /public/images/objects/
 */
const objectImageMap: Record<string, string> = {
  // Озера
  'озеро балхаш': '/images/objects/balkhash.jpg',
  'балхаш': '/images/objects/balkhash.jpg',
  'озеро алаколь': '/images/objects/alakol.jpg',
  'алаколь': '/images/objects/alakol.jpg',
  'озеро зайсан': '/images/objects/zaysan.jpg',
  'зайсан': '/images/objects/zaysan.jpg',
  'озеро маркаколь': '/images/objects/markakol.jpg',
  'маркаколь': '/images/objects/markakol.jpg',
  'озеро иссык': '/images/objects/issykkul.jpg',
  'иссык': '/images/objects/issykkul.jpg',
  'озеро каинды': '/images/objects/kaindy.jpg',
  'каинды': '/images/objects/kaindy.jpg',
  'озеро сасыкколь': '/images/objects/sasykkol.jpg',
  'сасыкколь': '/images/objects/sasykkol.jpg',
  'озеро копа': '/images/objects/kopa.jpg',
  'копа': '/images/objects/kopa.jpg',
  'озеро тенгиз': '/images/objects/tengiz.jpg',
  'тенгиз': '/images/objects/tengiz.jpg',
  'озеро индер': '/images/objects/inder.jpg',
  'индер': '/images/objects/inder.jpg',
  
  // Водохранилища
  'капшагайское водохранилище': '/images/objects/kapshagay.jpg',
  'капшагай': '/images/objects/kapshagay.jpg',
  'бартогайское водохранилище': '/images/objects/bartogay.jpg',
  'бартогай': '/images/objects/bartogay.jpg',
  'мойнакское водохранилище': '/images/objects/moynak.jpg',
  'мойнак': '/images/objects/moynak.jpg',
  'шульбинское водохранилище': '/images/objects/shulba.jpg',
  'шульба': '/images/objects/shulba.jpg',
  'бухтарминское водохранилище': '/images/objects/bukhtarma.jpg',
  'бухтарма': '/images/objects/bukhtarma.jpg',
  'усть-каменогорское водохранилище': '/images/objects/ust-kamenogorsk.jpg',
  'усть-каменогорск': '/images/objects/ust-kamenogorsk.jpg',
  'интумакское водохранилище': '/images/objects/intumak.jpg',
  'интумак': '/images/objects/intumak.jpg',
  'самаркандское водохранилище': '/images/objects/samarkand.jpg',
  'самарканд': '/images/objects/samarkand.jpg',
  'коксарайское водохранилище': '/images/objects/koksaray.jpg',
  'коксарай': '/images/objects/koksaray.jpg',
  'кенгирское водохранилище': '/images/objects/kengir.jpg',
  'кенгир': '/images/objects/kengir.jpg',
  
  // Каналы
  'канал иртыш–караганда': '/images/objects/irtysh-karaganda.jpg',
  'иртыш–караганда': '/images/objects/irtysh-karaganda.jpg',
  'иртыш-караганда': '/images/objects/irtysh-karaganda.jpg',
  'арысь–туркестанский канал': '/images/objects/arys-turkestan.jpg',
  'арысь-туркестанский канал': '/images/objects/arys-turkestan.jpg',
  'арысь–туркестан': '/images/objects/arys-turkestan.jpg',
  'канал шардара–кызылорда': '/images/objects/shardara-kyzylorda.jpg',
  'шардара–кызылорда': '/images/objects/shardara-kyzylorda.jpg',
  'шардара-кызылорда': '/images/objects/shardara-kyzylorda.jpg',
  'канал астраханка': '/images/objects/astrakhanka.jpg',
  'астраханка': '/images/objects/astrakhanka.jpg',
  
  // ГТС
  'гтс каратал': '/images/objects/karatal.jpg',
  'каратал': '/images/objects/karatal.jpg',
  'гтс чарын': '/images/objects/charyn.jpg',
  'чарын': '/images/objects/charyn.jpg',
  'гтс аягоз': '/images/objects/ayagoz.jpg',
  'аягоз': '/images/objects/ayagoz.jpg',
  'гтс урал': '/images/objects/ural.jpg',
  'урал': '/images/objects/ural.jpg',
  'гтс есиль': '/images/objects/yesil.jpg',
  'есиль': '/images/objects/yesil.jpg',
  'гтс сырдарья': '/images/objects/syrdarya.jpg',
  'сырдарья': '/images/objects/syrdarya.jpg',
}

/**
 * Получить путь к изображению объекта по его названию
 */
export function getObjectImage(name: string | null | undefined, fallback?: string): string {
  if (!name) return fallback || '/images/objects/default.jpg'
  
  const normalizedName = name.toLowerCase().trim()
  
  // Прямое совпадение
  if (objectImageMap[normalizedName]) {
    return objectImageMap[normalizedName]
  }
  
  // Поиск по частичному совпадению
  for (const [key, imagePath] of Object.entries(objectImageMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return imagePath
    }
  }
  
  return fallback || '/images/objects/default.jpg'
}

