import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getConditionColor(condition: number): string {
  const colors: Record<number, string> = {
    1: "bg-green-500",
    2: "bg-lime-500",
    3: "bg-yellow-500",
    4: "bg-orange-500",
    5: "bg-red-500",
  }
  return colors[condition] || "bg-gray-500"
}

export function getConditionLabel(condition: number): string {
  const labels: Record<number, string> = {
    1: "Отличное состояние",
    2: "Хорошее состояние",
    3: "Удовлетворительное состояние",
    4: "Плохое состояние",
    5: "Критическое состояние",
  }
  return labels[condition] || "Неизвестно"
}

export function getResourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    lake: "Озеро",
    canal: "Канал",
    reservoir: "Водохранилище",
  }
  return labels[type] || type
}
