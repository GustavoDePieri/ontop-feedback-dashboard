/**
 * GET /api/diio/reports/churned-accounts
 *
 * Generates a report showing churned accounts and their transcript counts
 */

import { createClient } from '@supabase/supabase-js'

interface ChurnedAccountsReport {
  totalChurnedAccounts: number
  totalTranscripts: number
  accountsWithTranscripts: number
  accountsWithoutTranscripts: number
  topAccountsByTranscripts: Array<{
    accountName: string
    clientPlatformId: string
    transcriptCount: number
    lastTranscriptDate: string | null
  }>
  transcriptDistribution: {
    accountsWith1Transcript: number
    accountsWith2To5Transcripts: number
    accountsWith6To10Transcripts: number
    accountsWith10PlusTranscripts: number
  }
  generatedAt: string
}

export default defineEventHandler(async (event): Promise<ChurnedAccountsReport> => {
  const config = useRuntimeConfig()

  // Initialize Supabase client
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey
  )

  try {
    console.log('📊 Generating churned accounts report...')

    // Query to get all unique churned accounts with their transcript counts
    const { data: accountData, error: accountError } = await supabase
      .rpc('get_churned_accounts_report')

    if (accountError) {
      // If the RPC function doesn't exist, fall back to manual query
      console.log('⚠️ RPC function not found, using manual query...')

      // Get all churned accounts with transcript counts
      const { data: transcripts, error: transcriptError } = await supabase
        .from('diio_transcripts')
        .select('client_platform_id, account_name, occurred_at')
        .not('client_platform_id', 'is', null)
        .not('account_name', 'is', null)
        .order('occurred_at', { ascending: false })

      if (transcriptError) {
        throw transcriptError
      }

      // Group by account and count transcripts
      const accountMap = new Map<string, {
        accountName: string
        transcriptCount: number
        lastTranscriptDate: string | null
        transcripts: string[]
      }>()

      for (const transcript of transcripts || []) {
        const key = transcript.client_platform_id
        if (!accountMap.has(key)) {
          accountMap.set(key, {
            accountName: transcript.account_name,
            transcriptCount: 0,
            lastTranscriptDate: null,
            transcripts: []
          })
        }

        const account = accountMap.get(key)!
        account.transcriptCount++
        account.transcripts.push(transcript.occurred_at)

        // Update last transcript date
        if (!account.lastTranscriptDate ||
            (transcript.occurred_at && transcript.occurred_at > account.lastTranscriptDate)) {
          account.lastTranscriptDate = transcript.occurred_at
        }
      }

      // Convert to array and sort by transcript count
      const accountsArray = Array.from(accountMap.entries()).map(([clientPlatformId, data]) => ({
        accountName: data.accountName,
        clientPlatformId,
        transcriptCount: data.transcriptCount,
        lastTranscriptDate: data.lastTranscriptDate
      }))

      accountsArray.sort((a, b) => b.transcriptCount - a.transcriptCount)

      // Calculate distribution
      const distribution = {
        accountsWith1Transcript: accountsArray.filter(a => a.transcriptCount === 1).length,
        accountsWith2To5Transcripts: accountsArray.filter(a => a.transcriptCount >= 2 && a.transcriptCount <= 5).length,
        accountsWith6To10Transcripts: accountsArray.filter(a => a.transcriptCount >= 6 && a.transcriptCount <= 10).length,
        accountsWith10PlusTranscripts: accountsArray.filter(a => a.transcriptCount > 10).length
      }

      const report: ChurnedAccountsReport = {
        totalChurnedAccounts: accountsArray.length,
        totalTranscripts: transcripts?.length || 0,
        accountsWithTranscripts: accountsArray.filter(a => a.transcriptCount > 0).length,
        accountsWithoutTranscripts: accountsArray.filter(a => a.transcriptCount === 0).length,
        topAccountsByTranscripts: accountsArray.slice(0, 20), // Top 20 accounts
        transcriptDistribution: distribution,
        generatedAt: new Date().toISOString()
      }

      console.log(`✅ Generated churned accounts report: ${report.totalChurnedAccounts} accounts, ${report.totalTranscripts} transcripts`)
      return report

    } else {
      // Use RPC function result
      const report: ChurnedAccountsReport = {
        totalChurnedAccounts: accountData.total_accounts || 0,
        totalTranscripts: accountData.total_transcripts || 0,
        accountsWithTranscripts: accountData.accounts_with_transcripts || 0,
        accountsWithoutTranscripts: accountData.accounts_without_transcripts || 0,
        topAccountsByTranscripts: accountData.top_accounts || [],
        transcriptDistribution: accountData.distribution || {
          accountsWith1Transcript: 0,
          accountsWith2To5Transcripts: 0,
          accountsWith6To10Transcripts: 0,
          accountsWith10PlusTranscripts: 0
        },
        generatedAt: new Date().toISOString()
      }

      return report
    }

  } catch (error: any) {
    console.error('❌ Error generating churned accounts report:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to generate churned accounts report: ${error.message}`
    })
  }
})
