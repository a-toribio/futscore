import { describe, expect, it } from 'vitest'
import {
  checkForAppUpdate,
  compareVersions,
  evaluateReleaseUpdate,
  extractRemoteMetadata,
  type GitHubRelease,
} from '@/services/appUpdater'

const baseRelease: GitHubRelease = {
  tag_name: 'v1.0.0',
  name: 'FutScore Android APK (v1.0.12)',
  body: 'Aplicación móvil Android de FutScore. Versión: v1.0.12 (commit:abcdef1234567890)',
  published_at: '2026-11-17T20:00:00Z',
  assets: [
    {
      id: 999,
      name: 'FutScore.apk',
      size: 4_500_000,
      updated_at: '2026-11-17T22:00:00Z',
      browser_download_url: 'https://github.com/a-toribio/futscore/releases/download/v1.0.0/FutScore.apk',
    },
  ],
}

describe('compareVersions', () => {
  it('compara versiones numéricamente segmento a segmento', () => {
    expect(compareVersions('1.0.15', '1.0.4')).toBe(1)
    expect(compareVersions('v1.1.0', '1.0.99')).toBe(1)
    expect(compareVersions('1.0.0', '1.0')).toBe(0)
    expect(compareVersions('1.0.1', '1.0.2')).toBe(-1)
  })
})

describe('extractRemoteMetadata', () => {
  it('extrae versión y commit desde título y notas aunque el tag sea fijo', () => {
    expect(extractRemoteMetadata(baseRelease)).toEqual({
      remoteVersion: '1.0.12',
      remoteSha: 'abcdef1234567890',
    })
  })

  it('usa el tag_name si no hay versión superior en el título o cuerpo', () => {
    expect(
      extractRemoteMetadata({
        tag_name: 'v1.2.0',
        name: 'Release 1.2',
        body: 'Notas sin commit',
      }),
    ).toEqual({
      remoteVersion: '1.2.0',
      remoteSha: null,
    })
  })
})

describe('evaluateReleaseUpdate', () => {
  it('devuelve null si el mismo assetId ya fue instalado', () => {
    const res = evaluateReleaseUpdate({
      release: baseRelease,
      installedVersion: '1.0.0',
      buildSha: '1111111',
      buildTime: '2026-11-17T10:00:00Z',
      lastUpdateTime: 0,
      installedAssetId: '999',
    })
    expect(res).toBeNull()
  })

  it('devuelve null si el commit SHA coincide con el instalado', () => {
    const res = evaluateReleaseUpdate({
      release: baseRelease,
      installedVersion: '1.0.12',
      buildSha: 'abcdef1234567890',
      buildTime: '2026-11-17T10:00:00Z',
      lastUpdateTime: 0,
      installedAssetId: null,
    })
    expect(res).toBeNull()
  })

  it('detecta actualización cuando cambia el commit y el asset es más reciente', () => {
    const res = evaluateReleaseUpdate({
      release: baseRelease,
      installedVersion: '1.0.11',
      buildSha: '1234567890abcdef',
      buildTime: '2026-11-17T21:00:00Z',
      lastUpdateTime: 0,
      installedAssetId: null,
    })
    expect(res).toEqual({
      assetId: 999,
      version: '1.0.12',
      downloadUrl: 'https://github.com/a-toribio/futscore/releases/download/v1.0.0/FutScore.apk',
      sizeBytes: 4_500_000,
      publishedAt: '2026-11-17T22:00:00Z',
    })
  })

  it('detecta actualización por versión superior aunque no haya buildSha', () => {
    const res = evaluateReleaseUpdate({
      release: baseRelease,
      installedVersion: '1.0.0',
      buildSha: '',
      buildTime: '2026-11-17T23:00:00Z',
      lastUpdateTime: 0,
      installedAssetId: null,
    })
    expect(res?.version).toBe('1.0.12')
  })

  it('detecta actualización por fecha cuando faltan metadatos de SHA y la versión coincide', () => {
    const legacyRelease: GitHubRelease = {
      tag_name: 'v1.0.0',
      name: 'FutScore Android APK (v1.0.0)',
      body: 'Sin metadatos extra',
      assets: [
        {
          id: 500,
          name: 'FutScore.apk',
          size: 4_000_000,
          updated_at: '2026-11-17T22:30:00Z',
          browser_download_url: 'https://example.com/FutScore.apk',
        },
      ],
    }
    const res = evaluateReleaseUpdate({
      release: legacyRelease,
      installedVersion: '1.0.0',
      buildSha: '',
      buildTime: '2026-11-17T21:00:00Z',
      lastUpdateTime: Date.parse('2026-11-17T21:30:00Z'),
      installedAssetId: null,
    })
    expect(res?.assetId).toBe(500)
  })

  it('no propone actualización si no hay asset .apk o si el instalado es más reciente', () => {
    expect(
      evaluateReleaseUpdate({
        release: { tag_name: 'v1.0.0', assets: [] },
        installedVersion: '1.0.0',
        buildSha: '',
        buildTime: '2026-11-17T21:00:00Z',
        lastUpdateTime: 0,
        installedAssetId: null,
      }),
    ).toBeNull()

    const sameVersionOldAsset: GitHubRelease = {
      tag_name: 'v1.0.0',
      assets: [
        {
          id: 501,
          name: 'FutScore.apk',
          size: 4_000_000,
          updated_at: '2026-11-17T20:00:00Z',
          browser_download_url: 'https://example.com/FutScore.apk',
        },
      ],
    }
    expect(
      evaluateReleaseUpdate({
        release: sameVersionOldAsset,
        installedVersion: '1.0.0',
        buildSha: '',
        buildTime: '2026-11-17T21:00:00Z',
        lastUpdateTime: Date.parse('2026-11-17T21:30:00Z'),
        installedAssetId: null,
      }),
    ).toBeNull()
  })
})

describe('checkForAppUpdate', () => {
  it('en entorno web no nativo devuelve null sin consultar GitHub', async () => {
    let called = false
    const fetchFn = (async () => {
      called = true
      return new Response('{}')
    }) as typeof fetch

    const res = await checkForAppUpdate(fetchFn)
    expect(res).toBeNull()
    expect(called).toBe(false)
  })
})
