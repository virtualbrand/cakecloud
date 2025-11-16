import { useState } from 'react'

interface ProductSettings {
  showLossFactorIngredients: boolean
  showLossFactorBases: boolean
  showLossFactorProducts: boolean
}

const defaultSettings: ProductSettings = {
  showLossFactorIngredients: true,
  showLossFactorBases: true,
  showLossFactorProducts: true,
}

function getInitialSettings(): ProductSettings {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('productSettings')
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        return { ...defaultSettings, ...parsedSettings }
      } catch (error) {
        console.error('Error parsing product settings:', error)
      }
    }
  }
  return defaultSettings
}

export function useProductSettings() {
  const [settings] = useState<ProductSettings>(getInitialSettings)
  return settings
}
