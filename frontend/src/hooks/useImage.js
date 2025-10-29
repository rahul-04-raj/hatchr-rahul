import { useState, useEffect } from 'react'

export function useImage(src) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [imgSrc, setImgSrc] = useState(src)

  useEffect(() => {
    setLoaded(false)
    setError(false)
    
    if (!src) return
    
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.onerror = () => {
      setError(true)
      // If it's a local path that failed, try prefixing with VITE_API_URL
      if (src && !src.startsWith('http') && !src.startsWith('data:')) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
        const newSrc = src.startsWith('/') ? `${baseUrl}${src}` : `${baseUrl}/${src}`
        if (newSrc !== imgSrc) {
          setImgSrc(newSrc)
        }
      }
    }
    img.src = src
  }, [src])

  return { loaded, error, imgSrc }
}