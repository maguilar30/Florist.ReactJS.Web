import { useEffect, useState } from 'react'
import { fetchDeliveryFees } from '../api/delivery'
import { FALLBACK_DELIVERY_OPTIONS } from '../delivery'
import type { DeliveryFee } from '../types'

export function useDeliveryOptions(): DeliveryFee[] {
  const [options, setOptions] = useState<DeliveryFee[]>(FALLBACK_DELIVERY_OPTIONS)

  useEffect(() => {
    void fetchDeliveryFees()
      .then(setOptions)
      .catch(() => {
        setOptions(FALLBACK_DELIVERY_OPTIONS)
      })
  }, [])

  return options
}
