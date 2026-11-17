import { registerPlugin, type PluginListenerHandle } from '@capacitor/core'
import { isNativeApp } from '@/lib/runtime'

const RELEASES_LATEST_URL = 'https://api.github.com/repos/a-toribio/futscore/releases/latest'
const RELEASES_FALLBACK_URL = 'https://api.github.com/repos/a-toribio/futscore/releases/tags/v1.0.0'
const INSTALLED_ASSET_KEY = 'futscore-installed-asset-id'

export interface AppInfo {
  versionName: string
  versionCode: number
  lastUpdateTime: number
}

export interface DownloadProgressEvent {
  percent: number
  downloadedBytes: number
  totalBytes: number
}

export interface AppUpdaterPlugin {
  getAppInfo(): Promise<AppInfo>
  downloadAndInstall(options: { url: string }): Promise<{ started: boolean }>
  addListener(
    eventName: 'downloadProgress',
    listenerFunc: (event: DownloadProgressEvent) => void,
  ): Promise<PluginListenerHandle>
}

export const AppUpdater = registerPlugin<AppUpdaterPlugin>('AppUpdater')

export interface GitHubReleaseAsset {
  id: number
  name: string
  size: number
  updated_at?: string
  browser_download_url?: string
}

export interface GitHubRelease {
  tag_name?: string
  name?: string
  body?: string
  published_at?: string
  assets?: GitHubReleaseAsset[]
}

export interface AvailableUpdate {
  assetId: number
  version: string
  downloadUrl: string
  sizeBytes: number
  publishedAt: string
}

export interface EvaluateReleaseInput {
  release: GitHubRelease
  installedVersion: string
  buildSha: string
  buildTime: string
  lastUpdateTime: number
  installedAssetId: string | null
}

function getBuildMeta(): { version: string; sha: string; time: string } {
  return {
    version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0',
    sha: typeof __APP_BUILD_SHA__ !== 'undefined' ? __APP_BUILD_SHA__ : '',
    time: typeof __APP_BUILD_TIME__ !== 'undefined' ? __APP_BUILD_TIME__ : '',
  }
}

export function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    v
      .trim()
      .replace(/^v/i, '')
      .split(/[^0-9]+/)
      .filter(Boolean)
      .map(Number)

  const pa = parse(a)
  const pb = parse(b)
  const len = Math.max(pa.length, pb.length)

  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0
    const nb = pb[i] ?? 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

export function extractRemoteMetadata(release: GitHubRelease): {
  remoteVersion: string
  remoteSha: string | null
} {
  const sources = [release.name ?? '', release.body ?? '', release.tag_name ?? '']
  const versions: string[] = []
  for (const text of sources) {
    const matches = text.matchAll(/\bv?(\d+\.\d+\.\d+)\b/g)
    for (const m of matches) {
      versions.push(m[1])
    }
  }

  let remoteVersion = release.tag_name?.replace(/^v/i, '') || '1.0.0'
  for (const v of versions) {
    if (compareVersions(v, remoteVersion) > 0) {
      remoteVersion = v
    }
  }

  const shaMatch = /commit:([0-9a-f]{7,40})/i.exec(release.body ?? '')
  return {
    remoteVersion,
    remoteSha: shaMatch ? shaMatch[1] : null,
  }
}

function sameSha(a: string, b: string): boolean {
  const la = a.toLowerCase()
  const lb = b.toLowerCase()
  return la === lb || la.startsWith(lb) || lb.startsWith(la)
}

export function evaluateReleaseUpdate(input: EvaluateReleaseInput): AvailableUpdate | null {
  const { release, installedVersion, buildSha, buildTime, lastUpdateTime, installedAssetId } = input
  const assets = release.assets ?? []
  const apkAsset =
    assets.find((a) => a.name.toLowerCase() === 'futscore.apk' && a.browser_download_url) ??
    assets.find((a) => a.name.toLowerCase().endsWith('.apk') && a.browser_download_url)

  if (!apkAsset?.browser_download_url) return null
  if (installedAssetId && String(apkAsset.id) === installedAssetId) return null

  const { remoteVersion, remoteSha } = extractRemoteMetadata(release)
  const updatedIso = apkAsset.updated_at || release.published_at || ''
  const assetUpdatedMs = Date.parse(updatedIso) || 0
  const buildTimeMs = Date.parse(buildTime) || 0

  if (remoteSha && buildSha && sameSha(remoteSha, buildSha)) {
    return null
  }

  const newerBySha =
    Boolean(remoteSha && buildSha && !sameSha(remoteSha, buildSha) && assetUpdatedMs > buildTimeMs)
  const newerByVersion = compareVersions(remoteVersion, installedVersion) > 0
  const newerByTimestamp =
    (!remoteSha || !buildSha) &&
    assetUpdatedMs > Math.max(lastUpdateTime, buildTimeMs > 0 ? buildTimeMs + 10 * 60_000 : 0)

  if (!newerBySha && !newerByVersion && !newerByTimestamp) {
    return null
  }

  return {
    assetId: apkAsset.id,
    version: remoteVersion,
    downloadUrl: apkAsset.browser_download_url,
    sizeBytes: apkAsset.size,
    publishedAt: updatedIso,
  }
}

async function fetchLatestRelease(fetchFn: typeof fetch): Promise<GitHubRelease | null> {
  const headers = { Accept: 'application/vnd.github+json' }
  const signal =
    typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal ? AbortSignal.timeout(10_000) : undefined

  for (const url of [RELEASES_LATEST_URL, RELEASES_FALLBACK_URL]) {
    try {
      const res = await fetchFn(url, { headers, signal })
      if (!res.ok) continue
      return (await res.json()) as GitHubRelease
    } catch {
      // Se prueba el fallback
    }
  }
  return null
}

export async function checkForAppUpdate(fetchFn: typeof fetch = fetch): Promise<AvailableUpdate | null> {
  if (!isNativeApp()) return null

  const meta = getBuildMeta()
  let appInfo: AppInfo = {
    versionName: meta.version,
    versionCode: 1,
    lastUpdateTime: 0,
  }

  try {
    appInfo = await AppUpdater.getAppInfo()
  } catch {
    // Fallback a metadatos de compilación
  }

  const release = await fetchLatestRelease(fetchFn)
  if (!release) return null

  let installedAssetId: string | null = null
  try {
    installedAssetId = localStorage.getItem(INSTALLED_ASSET_KEY)
  } catch {
    installedAssetId = null
  }

  return evaluateReleaseUpdate({
    release,
    installedVersion: appInfo.versionName || meta.version,
    buildSha: meta.sha,
    buildTime: meta.time,
    lastUpdateTime: appInfo.lastUpdateTime || 0,
    installedAssetId,
  })
}

export function markAssetInstalled(assetId: number): void {
  try {
    localStorage.setItem(INSTALLED_ASSET_KEY, String(assetId))
  } catch {
    // Ignorar errores de almacenamiento
  }
}
