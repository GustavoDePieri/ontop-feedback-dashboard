import { createClient } from '@supabase/supabase-js';
import { b as useRuntimeConfig } from './server.mjs';

const useSupabase = () => {
  const config = useRuntimeConfig();
  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  );
  const saveReport = async (report) => {
    try {
      const { data, error } = await supabase.from("saved_reports").insert([report]).select().single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error saving report:", error);
      return { data: null, error };
    }
  };
  const getSavedReports = async () => {
    try {
      const { data, error } = await supabase.from("saved_reports").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching reports:", error);
      return { data: null, error };
    }
  };
  const getReportById = async (id) => {
    try {
      const { data, error } = await supabase.from("saved_reports").select("*").eq("id", id).single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching report:", error);
      return { data: null, error };
    }
  };
  const deleteReport = async (id) => {
    try {
      const { error } = await supabase.from("saved_reports").delete().eq("id", id);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error deleting report:", error);
      return { error };
    }
  };
  const updateReport = async (id, updates) => {
    try {
      const { data, error } = await supabase.from("saved_reports").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error updating report:", error);
      return { data: null, error };
    }
  };
  const saveDiioUsers = async (users) => {
    try {
      const userRecords = users.map((user) => ({
        diio_id: user.id,
        name: user.name,
        email: user.email
      }));
      const { data, error } = await supabase.from("diio_users").upsert(userRecords, {
        onConflict: "diio_id",
        ignoreDuplicates: false
      }).select();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error saving DIIO users:", error);
      return { data: null, error };
    }
  };
  const saveDiioMeetings = async (meetings) => {
    try {
      console.log(`💾 Preparing to store ${meetings.length} meetings...`);
      const meetingRecords = meetings.map((meeting) => {
        const participantEmails = [];
        if (meeting.attendees) {
          if (meeting.attendees.sellers) {
            participantEmails.push(...meeting.attendees.sellers.map((s) => s.email).filter((e) => e));
          }
          if (meeting.attendees.customers) {
            participantEmails.push(...meeting.attendees.customers.map((c) => c.email).filter((e) => e));
          }
        }
        return {
          diio_meeting_id: meeting.id,
          name: meeting.name,
          scheduled_at: meeting.scheduled_at,
          attendees: meeting.attendees,
          participant_emails: participantEmails.length > 0 ? participantEmails : void 0,
          analyzed_status: meeting.analyzed_status || "pending",
          error_cause: meeting.error_cause,
          last_transcript_id: meeting.last_transcript_id
        };
      });
      const batchSize = 1e3;
      const batches = [];
      for (let i = 0; i < meetingRecords.length; i += batchSize) {
        batches.push(meetingRecords.slice(i, i + batchSize));
      }
      console.log(`📦 Processing ${batches.length} batches of meetings...`);
      let totalStored = 0;
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📦 Storing batch ${i + 1}/${batches.length} (${batch.length} meetings)...`);
        const { data, error } = await supabase.from("diio_meetings").upsert(batch, {
          onConflict: "diio_meeting_id",
          ignoreDuplicates: false
        }).select();
        if (error) throw error;
        totalStored += batch.length;
      }
      console.log(`✅ Successfully stored ${totalStored} meetings in ${batches.length} batches`);
      return { data: { count: totalStored }, error: null };
    } catch (error) {
      console.error("Error saving DIIO meetings:", error);
      return { data: null, error };
    }
  };
  const saveDiioPhoneCalls = async (phoneCalls) => {
    try {
      console.log(`💾 Preparing to store ${phoneCalls.length} phone calls...`);
      const callRecords = phoneCalls.map((call) => {
        const participantEmails = [];
        if (call.attendees) {
          if (call.attendees.sellers) {
            participantEmails.push(...call.attendees.sellers.map((s) => s.email).filter((e) => e));
          }
          if (call.attendees.customers) {
            participantEmails.push(...call.attendees.customers.map((c) => c.email).filter((e) => e));
          }
        }
        return {
          diio_call_id: call.id,
          name: call.name,
          occurred_at: call.occurred_at,
          duration: call.duration,
          call_from_number: call.call_from_number,
          attendees: call.attendees,
          participant_emails: participantEmails.length > 0 ? participantEmails : void 0,
          analyzed_status: call.analyzed_status || "pending",
          error_cause: call.error_cause,
          last_transcript_id: call.last_transcript_id
        };
      });
      const batchSize = 1e3;
      const batches = [];
      for (let i = 0; i < callRecords.length; i += batchSize) {
        batches.push(callRecords.slice(i, i + batchSize));
      }
      console.log(`📦 Processing ${batches.length} batches of phone calls...`);
      let totalStored = 0;
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📦 Storing batch ${i + 1}/${batches.length} (${batch.length} calls)...`);
        const { data, error } = await supabase.from("diio_phone_calls").upsert(batch, {
          onConflict: "diio_call_id",
          ignoreDuplicates: false
        }).select();
        if (error) throw error;
        totalStored += batch.length;
      }
      console.log(`✅ Successfully stored ${totalStored} phone calls in ${batches.length} batches`);
      return { data: { count: totalStored }, error: null };
    } catch (error) {
      console.error("Error saving DIIO phone calls:", error);
      return { data: null, error };
    }
  };
  const saveDiioTranscript = async (transcript, sourceType, sourceId, sourceName, metadata) => {
    try {
      const transcriptRecord = {
        diio_transcript_id: transcript.id,
        transcript_text: transcript.transcript,
        transcript_type: sourceType,
        source_id: sourceId,
        source_name: sourceName,
        occurred_at: metadata?.occurred_at,
        duration: metadata?.duration,
        attendees: metadata?.attendees,
        analyzed_status: "pending"
      };
      const { data, error } = await supabase.from("diio_transcripts").upsert(transcriptRecord, {
        onConflict: "diio_transcript_id",
        ignoreDuplicates: false
      }).select().single();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error saving DIIO transcript:", error);
      return { data: null, error };
    }
  };
  const getDiioTranscripts = async (limit = 50, offset = 0) => {
    try {
      if (limit > 1e4) {
        let allData = [];
        let currentOffset = offset;
        const chunkSize = 1e3;
        let hasMore = true;
        while (hasMore) {
          const { data: data2, error: error2 } = await supabase.from("diio_transcripts").select(`
              id,
              diio_transcript_id,
              transcript_text,
              transcript_type,
              source_id,
              source_name,
              occurred_at,
              duration,
              attendees,
              ai_analysis,
              ai_analysis_date,
              analyzed_status,
              client_platform_id,
              account_name,
              account_status,
              created_at,
              updated_at
            `).order("created_at", { ascending: false }).range(currentOffset, currentOffset + chunkSize - 1);
          if (error2) throw error2;
          if (data2 && data2.length > 0) {
            allData.push(...data2);
            currentOffset += chunkSize;
            hasMore = data2.length === chunkSize;
          } else {
            hasMore = false;
          }
          if (currentOffset > 1e5) {
            console.warn("⚠️ Reached safety limit of 100,000 transcripts");
            break;
          }
        }
        console.log(`✅ Loaded ${allData.length} transcripts in chunks`);
        return { data: allData, error: null };
      }
      const { data, error } = await supabase.from("diio_transcripts").select(`
          id,
          diio_transcript_id,
          transcript_text,
          transcript_type,
          source_id,
          source_name,
          occurred_at,
          duration,
          attendees,
          ai_analysis,
          ai_analysis_date,
          analyzed_status,
          client_platform_id,
          account_name,
          account_status,
          created_at,
          updated_at
        `).order("created_at", { ascending: false }).range(offset, offset + limit - 1);
      if (error) throw error;
      if (data && data.length > 0) {
        console.log("✅ Loaded transcript with text length:", data[0].transcript_text?.length || 0);
      }
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching DIIO transcripts:", error);
      return { data: null, error };
    }
  };
  const getDiioTranscriptStats = async () => {
    try {
      const { data, error } = await supabase.rpc("get_diio_transcript_stats");
      if (error) throw error;
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error("Error fetching DIIO transcript stats:", error);
      return { data: null, error };
    }
  };
  const transcriptExists = async (diioTranscriptId) => {
    try {
      const { data, error } = await supabase.from("diio_transcripts").select("id").eq("diio_transcript_id", diioTranscriptId).maybeSingle();
      if (error) throw error;
      return { exists: !!data, error: null };
    } catch (error) {
      console.error("Error checking transcript existence:", error);
      return { exists: false, error };
    }
  };
  const saveTranscriptFeedback = async (feedbackSegments) => {
    try {
      if (feedbackSegments.length === 0) {
        return { data: null, error: null };
      }
      console.log(`💾 Saving ${feedbackSegments.length} transcript feedback segments...`);
      const { data, error } = await supabase.from("diio_transcript_feedback").upsert(feedbackSegments).select();
      if (error) throw error;
      console.log(`✅ Saved ${feedbackSegments.length} feedback segments`);
      return { data, error: null };
    } catch (error) {
      console.error("Error saving transcript feedback:", error);
      return { data: null, error };
    }
  };
  const getTranscriptFeedback = async (transcriptId) => {
    try {
      const { data, error } = await supabase.from("diio_transcript_feedback").select("*").eq("transcript_id", transcriptId).order("segment_number", { ascending: true });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching transcript feedback:", error);
      return { data: null, error };
    }
  };
  const getAllTranscriptFeedback = async (filters) => {
    try {
      let query = supabase.from("diio_transcript_feedback_summary").select("*");
      if (filters?.startDate) {
        query = query.gte("occurred_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("occurred_at", filters.endDate);
      }
      if (filters?.feedbackType) {
        query = query.eq("feedback_type", filters.feedbackType);
      }
      if (filters?.urgency) {
        query = query.eq("urgency", filters.urgency);
      }
      query = query.order("occurred_at", { ascending: false });
      if (filters?.limit) {
        query = query.range(filters.offset || 0, (filters.offset || 0) + filters.limit - 1);
      }
      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching all transcript feedback:", error);
      return { data: null, error };
    }
  };
  const getTranscriptFeedbackStats = async () => {
    try {
      const { data, error } = await supabase.rpc("get_diio_transcript_feedback_stats");
      if (error) throw error;
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error("Error fetching transcript feedback stats:", error);
      return { data: null, error };
    }
  };
  return {
    supabase,
    // Saved Reports
    saveReport,
    getSavedReports,
    getReportById,
    deleteReport,
    updateReport,
    // DIIO Functions
    saveDiioUsers,
    saveDiioMeetings,
    saveDiioPhoneCalls,
    saveDiioTranscript,
    getDiioTranscripts,
    getDiioTranscriptStats,
    transcriptExists,
    // DIIO Transcript Feedback Functions
    saveTranscriptFeedback,
    getTranscriptFeedback,
    getAllTranscriptFeedback,
    getTranscriptFeedbackStats
  };
};

export { useSupabase as u };
//# sourceMappingURL=useSupabase-OiP577xr.mjs.map
