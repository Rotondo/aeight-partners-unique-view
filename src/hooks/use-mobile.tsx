
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Add safety check for React initialization
  if (!React || typeof React.useState !== 'function' || typeof React.useEffect !== 'function') {
    console.warn('[useIsMobile] React is not properly initialized, returning false')
    return false
  }

  try {
    const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

    React.useEffect(() => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
      const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      }
      mql.addEventListener("change", onChange)
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      return () => mql.removeEventListener("change", onChange)
    }, [])

    return !!isMobile
  } catch (error) {
    console.error('[useIsMobile] Hook error:', error)
    return false
  }
}
