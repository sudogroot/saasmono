import * as React from "react"

export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => {
      setMatches(mql.matches)
    }

    // Set initial value
    setMatches(mql.matches)

    // Listen for changes
    mql.addEventListener("change", onChange)

    return () => mql.removeEventListener("change", onChange)
  }, [query])

  return matches
}