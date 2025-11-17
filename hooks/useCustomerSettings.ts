import { useState } from 'react'

interface CustomerSettings {
  showCpfCnpj: boolean
  showPhoto: boolean
}

const defaultSettings: CustomerSettings = {
  showCpfCnpj: true,
  showPhoto: true,
}

function getInitialSettings(): CustomerSettings {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('customerSettings')
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        return { ...defaultSettings, ...parsedSettings }
      } catch (error) {
        console.error('Error parsing customer settings:', error)
      }
    }
  }
  return defaultSettings
}

export function useCustomerSettings() {
  const [settings] = useState<CustomerSettings>(getInitialSettings)
  return settings
}
