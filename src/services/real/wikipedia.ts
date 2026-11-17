import type { FetchFn } from '@/services/errors'

export interface WikiDescription {
  text: string
  url?: string
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Recorta el texto a un máximo de caracteres cortando en el final de una frase. */
export function clampSentences(text: string, max = 520): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('.)'))
  return lastStop > 160 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}…`
}

const BAD_TITLE = /femenin|juvenil|filial|\(.*(?:b|c)\)|"|cantera|categorías|temporada|historial/i

/**
 * Obtiene la descripción breve de un club desde la Wikipedia en español.
 * Valida que el artículo sea de un club deportivo y que su título contenga el nombre buscado.
 */
export async function fetchClubDescription(
  clubName: string,
  fetchFn: FetchFn = fetch,
): Promise<WikiDescription | undefined> {
  try {
    const headers = { 'Api-User-Agent': 'FutScore/1.0 (https://futscore.local; info@futscore.local)' }
    let search = await fetchFn(
      `https://es.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&limit=6&search=${encodeURIComponent(`${clubName} club de fútbol`)}`,
      { headers },
    )
    if (!search.ok) {
      search = await fetchFn(
        `https://es.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&limit=6&search=${encodeURIComponent(clubName)}`,
        { headers },
      )
    }
    if (!search.ok) return undefined
    const data = (await search.json()) as [string, string[]]
    let titles = (data[1] ?? []).filter((t) => !BAD_TITLE.test(t))
    if (titles.length === 0) {
      const fallbackSearch = await fetchFn(
        `https://es.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&limit=6&search=${encodeURIComponent(clubName)}`,
        { headers },
      )
      if (fallbackSearch.ok) {
        const fallbackData = (await fallbackSearch.json()) as [string, string[]]
        titles = (fallbackData[1] ?? []).filter((t) => !BAD_TITLE.test(t))
      }
    }

    const token = norm(clubName)
      .split(' ')
      .filter((w) => w.length >= 4)
      .sort((a, b) => b.length - a.length)[0]
    const title = titles.find((t) => !token || norm(t).includes(token)) ?? titles[0]
    if (!title) return undefined

    const res = await fetchFn(
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers },
    )
    if (!res.ok) return undefined
    const sum = (await res.json()) as {
      extract?: string
      description?: string
      content_urls?: { desktop?: { page?: string } }
    }
    const blob = `${sum.description ?? ''} ${sum.extract ?? ''}`
    if (!sum.extract || !/f[úu]tbol|football|club deportivo|club|equipo|estadio/i.test(blob)) return undefined
    return { text: clampSentences(sum.extract), url: sum.content_urls?.desktop?.page }
  } catch {
    return undefined
  }
}
