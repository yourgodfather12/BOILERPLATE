import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()

    // Check database connection
    let dbStatus = 'ok'
    let dbError = null

    try {
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is expected
        dbError = error.message
        dbStatus = 'error'
      }
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Unknown error'
      dbStatus = 'error'
    }

    const uptime = process.uptime()
    const memoryUsage = process.memoryUsage()

    const healthData = {
      status: dbStatus === 'ok' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        redis: 'ok', // Placeholder for Redis check
        external: 'ok', // Placeholder for external API checks
      },
      system: {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        },
        responseTime: Date.now() - startTime,
      },
    }

    // Log health check
    if (dbStatus !== 'ok') {
      logger.error('Health check failed', { dbError, healthData })
    } else {
      logger.info('Health check passed', { responseTime: healthData.system.responseTime })
    }

    const statusCode = dbStatus === 'ok' ? 200 : 503

    return NextResponse.json(healthData, { status: statusCode })

  } catch (error) {
    logger.error('Health check error:', error)

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}