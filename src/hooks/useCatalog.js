import { useCallback, useEffect, useRef, useState } from 'react'
import { buildCatalog } from '../utils/catalogMapper.js'
import { fetchCatalog } from '../utils/catalogQuery.js'
import { supabase } from '../utils/supabaseClient.js'

// Estado de la carga del catálogo público: 'loading' | 'ready' | 'error' (RF-26 a RF-28, RF-40).
const LOADING_STATUS = 'loading'
const READY_STATUS = 'ready'
const ERROR_STATUS = 'error'

// Hook propio que lee el catálogo con una sola petición por página (RF-3, RNF-1).
// El efecto no depende de la ruta: el reintento es la única excepción a "una sola petición".
export function useCatalog() {
  const [status, setStatus] = useState(LOADING_STATUS)
  const [catalog, setCatalog] = useState(null)
  const [error, setError] = useState(null)

  // Guarda si el componente sigue montado para no actualizar el estado tras el desmontaje.
  const isMountedRef = useRef(true)
  // Identificador de la petición en curso: descarta respuestas de peticiones viejas.
  const requestIdRef = useRef(0)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])



  // Aplica el resultado de una lectura solo si el componente sigue montado y la
  // respuesta corresponde a la petición más reciente.
  const applyResult = useCallback((rows, loadError) => {
    if (!isMountedRef.current) return

    if (loadError) {
      setCatalog(null)
      setError(loadError)
      setStatus(ERROR_STATUS)
      return
    }

    setCatalog(buildCatalog(rows))
    setError(null)
    setStatus(READY_STATUS)
  }, [])




  // Primera carga: el estado ya nace en "loading", así que no hace falta reiniciarlo.
  useEffect(() => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    fetchCatalog(supabase).then(
      // Devuelve las filas de las tablas
      (rows) => {
        if (requestIdRef.current !== requestId) return
        applyResult(rows, null)
      },
      // Devuelve error si no se pudo leer el catalogo
      (loadError) => {
        if (requestIdRef.current !== requestId) return
        applyResult(null, loadError)
      },
    )
  }, [applyResult])


  // Repite la lectura y vuelve al estado de carga mientras se resuelve (RF-28).
  const retry = useCallback(() => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    setStatus(LOADING_STATUS)
    setError(null)

    fetchCatalog(supabase).then(
      (rows) => {
        if (requestIdRef.current !== requestId) return
        applyResult(rows, null)
      },
      (loadError) => {
        if (requestIdRef.current !== requestId) return
        applyResult(null, loadError)
      },
    )
  }, [applyResult])


  return { status, catalog, error, retry }
}
