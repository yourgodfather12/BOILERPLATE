import { env } from './env'

// DataDog RUM (Real User Monitoring) configuration
if (typeof window !== 'undefined' && env.DATADOG_APPLICATION_ID && env.DATADOG_CLIENT_TOKEN) {
  import('@datadog/browser-rum').then(({ datadogRum }) => {
    datadogRum.init({
      applicationId: env.DATADOG_APPLICATION_ID!,
      clientToken: env.DATADOG_CLIENT_TOKEN!,
      site: 'datadoghq.com',
      service: 'nextjs-boilerplate',
      env: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    })

    datadogRum.startSessionReplayRecording()
  })
}

// DataDog Logs configuration
if (typeof window !== 'undefined' && env.DATADOG_CLIENT_TOKEN) {
  import('@datadog/browser-logs').then(({ datadogLogs }) => {
    datadogLogs.init({
      clientToken: env.DATADOG_CLIENT_TOKEN!,
      site: 'datadoghq.com',
      service: 'nextjs-boilerplate',
      env: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      forwardErrorsToLogs: true,
      sessionSampleRate: 100,
    })
  })
}
