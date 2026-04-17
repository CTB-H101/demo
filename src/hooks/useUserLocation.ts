import { useEffect, useState } from 'react'
import { LOCATION_TIMEOUT_MS } from '../constants'
import type { UserLocation } from '../types'

export function useUserLocation() {
  const geolocationSupported =
    typeof navigator !== 'undefined' && typeof navigator.geolocation !== 'undefined'

  const [location, setLocation] = useState<UserLocation | null>(null)
  const [isLocating, setIsLocating] = useState(geolocationSupported)

  useEffect(() => {
    if (!geolocationSupported) {
      setIsLocating(false)
      setLocation(null)
      return
    }

    const onSuccess: PositionCallback = (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        source: 'gps',
      })
      setIsLocating(false)
    }

    const onError: PositionErrorCallback = () => {
      setIsLocating(false)
      setLocation(null)
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: LOCATION_TIMEOUT_MS,
      maximumAge: 0,
    })
  }, [geolocationSupported])

  return {
    location,
    isLocating,
  }
}
