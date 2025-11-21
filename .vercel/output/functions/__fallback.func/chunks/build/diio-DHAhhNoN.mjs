import { _ as __nuxt_component_0 } from './nuxt-link-DirVq4_Y.mjs';
import { defineComponent, useSSRContext, ref, reactive, computed, watch, mergeProps, withCtx, createBlock, createVNode, openBlock, unref } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { u as useSupabase } from './useSupabase-C1W25sD6.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'pinia';
import 'vue-router';
import '@supabase/supabase-js';

const itemsPerPage = 20;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "diio",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabase();
    const transcripts = ref([]);
    const loading = ref(false);
    const syncing = ref(false);
    const generatingReport = ref(false);
    const error = ref(null);
    const selectedTranscript = ref(null);
    const currentPage = ref(1);
    const churnedReportData = ref(null);
    const showChurnedReportModal = ref(false);
    const analyzingTranscript = ref(null);
    const aiAnalysisResult = ref(null);
    const hasQuotaError = ref(false);
    const stats = reactive({
      total: 0,
      meetings: 0,
      phoneCalls: 0,
      aiAnalyzed: 0,
      churned: 0,
      active: 0
    });
    const lastSyncTime = ref(null);
    const syncProgress = reactive({
      show: false,
      current: 0,
      total: 0,
      message: ""
    });
    const filters = reactive({
      search: "",
      type: "",
      aiAnalysis: "",
      churnedStatus: "",
      dateFrom: "",
      dateTo: ""
    });
    const hasActiveFilters = computed(() => {
      return !!(filters.search || filters.type || filters.aiAnalysis || filters.churnedStatus || filters.dateFrom || filters.dateTo);
    });
    const filteredTranscripts = computed(() => {
      let filtered = [...transcripts.value];
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) => t.source_name?.toLowerCase().includes(searchLower) || t.transcript_text?.toLowerCase().includes(searchLower)
        );
      }
      if (filters.type) {
        filtered = filtered.filter((t) => t.transcript_type === filters.type);
      }
      if (filters.aiAnalysis === "analyzed") {
        filtered = filtered.filter((t) => t.ai_analysis !== null && t.ai_analysis !== void 0);
      } else if (filters.aiAnalysis === "not_analyzed") {
        filtered = filtered.filter((t) => !t.ai_analysis);
      }
      if (filters.churnedStatus === "churned") {
        filtered = filtered.filter((t) => t.account_status === "churned");
      } else if (filters.churnedStatus === "active") {
        filtered = filtered.filter((t) => t.account_status === "active");
      }
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter((t) => {
          const date = new Date(t.occurred_at || t.created_at);
          return date >= fromDate;
        });
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((t) => {
          const date = new Date(t.occurred_at || t.created_at);
          return date <= toDate;
        });
      }
      return filtered;
    });
    const totalPages = computed(() => Math.ceil(filteredTranscripts.value.length / itemsPerPage));
    const paginatedTranscripts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return filteredTranscripts.value.slice(start, end);
    });
    const selectedFeedbackTranscript = ref(null);
    const feedbackSegments = ref([]);
    const loadingFeedback = ref(false);
    const criticalSignalsCount = computed(() => {
      return feedbackSegments.value.filter((s) => s.urgency === "critical").length;
    });
    const painPointsCount = computed(() => {
      return feedbackSegments.value.filter((s) => s.feedback_type === "pain_point").length;
    });
    const negativeSentimentCount = computed(() => {
      return feedbackSegments.value.filter((s) => s.sentiment === "negative").length;
    });
    const formatDate = (dateString) => {
      if (!dateString) return "Unknown";
      return new Date(dateString).toLocaleString();
    };
    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    };
    const getTranscriptPreview = (text) => {
      if (!text) return "No transcript text available";
      if (typeof text !== "string") {
        try {
          text = JSON.stringify(text);
        } catch {
          text = String(text);
        }
      }
      text = text.replace(/\[object Object\]/g, "").trim();
      if (!text || text.length === 0) return "No transcript text available";
      return text.substring(0, 200) + (text.length > 200 ? "..." : "");
    };
    const getAttendeeCount = (attendees) => {
      if (!attendees) return 0;
      const sellers = attendees.sellers?.length || 0;
      const customers = attendees.customers?.length || 0;
      return sellers + customers;
    };
    const formatTranscriptText = (text) => {
      if (!text) return "No transcript text available";
      if (typeof text !== "string") {
        try {
          if (Array.isArray(text)) {
            return text.map((segment) => {
              if (typeof segment === "string") {
                return segment;
              } else if (segment && typeof segment === "object") {
                return segment.text || segment.content || segment.transcript || (segment.speaker && segment.text ? `${segment.speaker}: ${segment.text}` : null) || JSON.stringify(segment);
              }
              return String(segment);
            }).filter((t) => t && t.trim().length > 0).join("\n");
          } else if (text && typeof text === "object") {
            return text.text || text.content || text.transcript || JSON.stringify(text, null, 2);
          } else {
            return JSON.stringify(text);
          }
        } catch {
          return String(text);
        }
      }
      text = text.replace(/\[object Object\]/g, "").trim();
      return text || "No transcript text available";
    };
    watch([filters.search, filters.type, filters.aiAnalysis, filters.churnedStatus, filters.dateFrom, filters.dateTo], () => {
      currentPage.value = 1;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-dark p-4 sm:p-6 lg:p-8" }, _attrs))} data-v-142df71f><div class="max-w-7xl mx-auto" data-v-142df71f><div class="mb-8" data-v-142df71f><div class="flex items-center justify-between flex-wrap gap-4" data-v-142df71f><div class="flex items-center gap-4" data-v-142df71f>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" data-v-142df71f${_scopeId}></path></svg><span class="text-sm text-gray-400 group-hover:text-white transition-colors" data-v-142df71f${_scopeId}>Home</span>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "w-5 h-5 text-gray-400 group-hover:text-white transition-colors",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                })
              ])),
              createVNode("span", { class: "text-sm text-gray-400 group-hover:text-white transition-colors" }, "Home")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div data-v-142df71f><h1 class="text-3xl sm:text-4xl font-bold text-white mb-2" data-v-142df71f> Call Transcripts </h1><p class="text-gray-400" data-v-142df71f>Access and analyze meeting and call transcripts from DIIO</p></div></div><div class="flex items-center gap-2" data-v-142df71f><div class="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm" data-v-142df71f><div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" data-v-142df71f></div><span class="text-sm text-white/80" data-v-142df71f>DIIO Connected</span></div><button${ssrIncludeBooleanAttr(unref(generatingReport)) ? " disabled" : ""} class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" data-v-142df71f>`);
      if (!unref(generatingReport)) {
        _push(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" data-v-142df71f></path></svg>`);
      } else {
        _push(`<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" data-v-142df71f><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-142df71f></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-142df71f></path></svg>`);
      }
      _push(` ${ssrInterpolate(unref(generatingReport) ? "Generating..." : "⚠️ Churned Report")}</button><button${ssrIncludeBooleanAttr(unref(syncing)) ? " disabled" : ""} class="flex items-center gap-2 px-4 py-2 bg-gradient-cta text-white rounded-lg hover:bg-gradient-cta-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" data-v-142df71f>`);
      if (!unref(syncing)) {
        _push(`<svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" data-v-142df71f></path></svg>`);
      } else {
        _push(`<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" data-v-142df71f><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-142df71f></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-142df71f></path></svg>`);
      }
      _push(` ${ssrInterpolate(unref(syncing) ? "Syncing..." : "Sync New Transcripts")}</button></div></div></div><div class="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8" data-v-142df71f><div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="flex items-center justify-between" data-v-142df71f><div data-v-142df71f><p class="text-gray-400 text-sm mb-1" data-v-142df71f>Total Transcripts</p><p class="text-3xl font-bold text-white" data-v-142df71f>${ssrInterpolate(unref(stats).total)}</p></div><div class="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center" data-v-142df71f><svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-142df71f></path></svg></div></div></div><div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="flex items-center justify-between" data-v-142df71f><div data-v-142df71f><p class="text-gray-400 text-sm mb-1" data-v-142df71f>Meetings</p><p class="text-3xl font-bold text-white" data-v-142df71f>${ssrInterpolate(unref(stats).meetings)}</p></div><div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center" data-v-142df71f><svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-v-142df71f></path></svg></div></div></div><div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="flex items-center justify-between" data-v-142df71f><div data-v-142df71f><p class="text-gray-400 text-sm mb-1" data-v-142df71f>Phone Calls</p><p class="text-3xl font-bold text-white" data-v-142df71f>${ssrInterpolate(unref(stats).phoneCalls)}</p></div><div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center" data-v-142df71f><svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" data-v-142df71f></path></svg></div></div></div><div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="flex items-center justify-between" data-v-142df71f><div data-v-142df71f><p class="text-gray-400 text-sm mb-1" data-v-142df71f>AI Analyzed</p><p class="text-3xl font-bold text-white" data-v-142df71f>${ssrInterpolate(unref(stats).aiAnalyzed)}</p><p class="text-xs text-gray-500 mt-1" data-v-142df71f>${ssrInterpolate(unref(stats).total > 0 ? Math.round(unref(stats).aiAnalyzed / unref(stats).total * 100) : 0)}% complete</p></div><div class="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center" data-v-142df71f><svg class="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" data-v-142df71f></path></svg></div></div></div><div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="flex items-center justify-between" data-v-142df71f><div data-v-142df71f><p class="text-gray-400 text-sm mb-1" data-v-142df71f>Churned Accounts</p><p class="text-3xl font-bold text-white" data-v-142df71f>${ssrInterpolate(unref(stats).churned)}</p><p class="text-xs text-gray-500 mt-1" data-v-142df71f>${ssrInterpolate(unref(stats).total > 0 ? Math.round(unref(stats).churned / unref(stats).total * 100) : 0)}% of transcripts</p></div><div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center" data-v-142df71f><svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" data-v-142df71f></path></svg></div></div></div><div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="flex items-center justify-between" data-v-142df71f><div data-v-142df71f><p class="text-gray-400 text-sm mb-1" data-v-142df71f>Active Accounts</p><p class="text-3xl font-bold text-white" data-v-142df71f>${ssrInterpolate(unref(stats).active)}</p><p class="text-xs text-gray-500 mt-1" data-v-142df71f>${ssrInterpolate(unref(stats).total > 0 ? Math.round(unref(stats).active / unref(stats).total * 100) : 0)}% of transcripts</p></div><div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center" data-v-142df71f><svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-v-142df71f></path></svg></div></div></div><div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="flex items-center justify-between" data-v-142df71f><div data-v-142df71f><p class="text-gray-400 text-sm mb-1" data-v-142df71f>Last Sync</p><p class="text-lg font-semibold text-white" data-v-142df71f>${ssrInterpolate(unref(lastSyncTime) || "Never")}</p></div><div class="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center" data-v-142df71f><svg class="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-v-142df71f></path></svg></div></div></div></div>`);
      if (unref(syncProgress).show) {
        _push(`<div class="mb-8 bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="flex items-center justify-between mb-4" data-v-142df71f><h3 class="text-xl font-bold text-white" data-v-142df71f>🔄 Syncing Transcripts</h3><div class="text-sm text-gray-400" data-v-142df71f>${ssrInterpolate(unref(syncProgress).current)} / ${ssrInterpolate(unref(syncProgress).total)}</div></div><div class="w-full bg-gray-700 rounded-full h-3 mb-4" data-v-142df71f><div class="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-300" style="${ssrRenderStyle({ width: `${unref(syncProgress).current / unref(syncProgress).total * 100}%` })}" data-v-142df71f></div></div><div class="text-gray-300 text-sm" data-v-142df71f>${ssrInterpolate(unref(syncProgress).message)}</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(error)) {
        _push(`<div class="mb-8 bg-red-500/10 border border-red-500/30 rounded-lg p-4" data-v-142df71f><div class="flex items-start justify-between" data-v-142df71f><div class="flex-1" data-v-142df71f><h3 class="text-red-400 font-semibold mb-1" data-v-142df71f>${ssrInterpolate(unref(error).title || "Error")}</h3><p class="text-red-300 text-sm" data-v-142df71f>${ssrInterpolate(unref(error).message)}</p></div><button class="text-red-400 hover:text-red-300" data-v-142df71f><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-142df71f></path></svg></button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mb-6 bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="grid grid-cols-1 md:grid-cols-6 gap-4" data-v-142df71f><div class="relative" data-v-142df71f><label class="block text-sm text-gray-400 mb-2" data-v-142df71f>Search</label><input${ssrRenderAttr("value", unref(filters).search)} type="text" placeholder="Search transcripts..." class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" data-v-142df71f><svg class="absolute right-3 top-10 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-142df71f></path></svg></div><div data-v-142df71f><label class="block text-sm text-gray-400 mb-2" data-v-142df71f>Type</label><select class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors" data-v-142df71f><option value="" class="text-gray-900 bg-white" data-v-142df71f${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "") : ssrLooseEqual(unref(filters).type, "")) ? " selected" : ""}>All Types</option><option value="meeting" class="text-gray-900 bg-white" data-v-142df71f${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "meeting") : ssrLooseEqual(unref(filters).type, "meeting")) ? " selected" : ""}>Meetings</option><option value="phone_call" class="text-gray-900 bg-white" data-v-142df71f${ssrIncludeBooleanAttr(Array.isArray(unref(filters).type) ? ssrLooseContain(unref(filters).type, "phone_call") : ssrLooseEqual(unref(filters).type, "phone_call")) ? " selected" : ""}>Phone Calls</option></select></div><div data-v-142df71f><label class="block text-sm text-gray-400 mb-2" data-v-142df71f>AI Analysis</label><select class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors" data-v-142df71f><option value="" class="text-gray-900 bg-white" data-v-142df71f${ssrIncludeBooleanAttr(Array.isArray(unref(filters).aiAnalysis) ? ssrLooseContain(unref(filters).aiAnalysis, "") : ssrLooseEqual(unref(filters).aiAnalysis, "")) ? " selected" : ""}>All Transcripts</option><option value="analyzed" class="text-gray-900 bg-white" data-v-142df71f${ssrIncludeBooleanAttr(Array.isArray(unref(filters).aiAnalysis) ? ssrLooseContain(unref(filters).aiAnalysis, "analyzed") : ssrLooseEqual(unref(filters).aiAnalysis, "analyzed")) ? " selected" : ""}>Analyzed</option><option value="not_analyzed" class="text-gray-900 bg-white" data-v-142df71f${ssrIncludeBooleanAttr(Array.isArray(unref(filters).aiAnalysis) ? ssrLooseContain(unref(filters).aiAnalysis, "not_analyzed") : ssrLooseEqual(unref(filters).aiAnalysis, "not_analyzed")) ? " selected" : ""}>Not Analyzed</option></select></div><div data-v-142df71f><label class="block text-sm text-gray-400 mb-2" data-v-142df71f>Account Status</label><select class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors" data-v-142df71f><option value="" class="text-gray-900 bg-white" data-v-142df71f${ssrIncludeBooleanAttr(Array.isArray(unref(filters).churnedStatus) ? ssrLooseContain(unref(filters).churnedStatus, "") : ssrLooseEqual(unref(filters).churnedStatus, "")) ? " selected" : ""}>All Accounts</option><option value="churned" class="text-gray-900 bg-white" data-v-142df71f${ssrIncludeBooleanAttr(Array.isArray(unref(filters).churnedStatus) ? ssrLooseContain(unref(filters).churnedStatus, "churned") : ssrLooseEqual(unref(filters).churnedStatus, "churned")) ? " selected" : ""}>Churned Accounts</option><option value="active" class="text-gray-900 bg-white" data-v-142df71f${ssrIncludeBooleanAttr(Array.isArray(unref(filters).churnedStatus) ? ssrLooseContain(unref(filters).churnedStatus, "active") : ssrLooseEqual(unref(filters).churnedStatus, "active")) ? " selected" : ""}>Active Accounts</option></select></div><div data-v-142df71f><label class="block text-sm text-gray-400 mb-2" data-v-142df71f>From Date</label><input${ssrRenderAttr("value", unref(filters).dateFrom)} type="date" class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors" data-v-142df71f></div><div data-v-142df71f><label class="block text-sm text-gray-400 mb-2" data-v-142df71f>To Date</label><input${ssrRenderAttr("value", unref(filters).dateTo)} type="date" class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 transition-colors" data-v-142df71f></div></div><div class="flex items-center justify-between mt-4" data-v-142df71f><div class="text-sm text-gray-400" data-v-142df71f> Showing ${ssrInterpolate(unref(filteredTranscripts).length)} of ${ssrInterpolate(unref(transcripts).length)} transcripts </div>`);
      if (unref(hasActiveFilters)) {
        _push(`<button class="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-lg hover:bg-white/10 hover:text-white transition-colors duration-200" data-v-142df71f><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-142df71f></path></svg> Clear Filters </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10" data-v-142df71f><div class="flex items-center justify-between mb-6" data-v-142df71f><h2 class="text-2xl font-bold text-white flex items-center gap-2" data-v-142df71f><svg class="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-142df71f></path></svg> Stored Transcripts (${ssrInterpolate(unref(filteredTranscripts).length)}) </h2><button${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200" data-v-142df71f><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" data-v-142df71f></path></svg> ${ssrInterpolate(unref(loading) ? "Loading..." : "Refresh")}</button></div>`);
      if (unref(loading)) {
        _push(`<div class="text-center py-12" data-v-142df71f><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" data-v-142df71f></div><p class="text-gray-400 mt-2" data-v-142df71f>Loading transcripts...</p></div>`);
      } else if (unref(filteredTranscripts).length === 0) {
        _push(`<div class="text-center py-12" data-v-142df71f><svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-142df71f></path></svg><p class="text-gray-400 mb-2" data-v-142df71f>${ssrInterpolate(unref(transcripts).length === 0 ? "No transcripts stored yet" : "No transcripts match your filters")}</p><p class="text-gray-500 text-sm" data-v-142df71f>${ssrInterpolate(unref(transcripts).length === 0 ? 'Click "Sync New Transcripts" to fetch transcripts from DIIO' : "Try adjusting your search criteria")}</p></div>`);
      } else {
        _push(`<div class="space-y-4" data-v-142df71f><!--[-->`);
        ssrRenderList(unref(paginatedTranscripts), (transcript) => {
          _push(`<div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-emerald-500/50 transition-colors duration-200 cursor-pointer" data-v-142df71f><div class="flex items-start justify-between" data-v-142df71f><div class="flex-1" data-v-142df71f><div class="flex items-center gap-3 mb-2 flex-wrap" data-v-142df71f><span class="${ssrRenderClass([transcript.transcript_type === "meeting" ? "bg-blue-900/30 text-blue-300" : "bg-green-900/30 text-green-300", "px-2 py-1 text-xs font-medium rounded-full"])}" data-v-142df71f>${ssrInterpolate(transcript.transcript_type === "meeting" ? "📅 Meeting" : "📞 Call")}</span>`);
          if (transcript.client_platform_id) {
            _push(`<span class="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border border-red-500/30"${ssrRenderAttr("title", `Churned Account: ${transcript.account_name} (${transcript.client_platform_id})`)} data-v-142df71f> ⚠️ Churned </span>`);
          } else {
            _push(`<!---->`);
          }
          if (transcript.ai_analysis) {
            _push(`<span class="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30" title="AI Analysis completed" data-v-142df71f> 🤖 AI Analyzed </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<span class="text-xs text-gray-400" data-v-142df71f>${ssrInterpolate(formatDate(transcript.occurred_at || transcript.created_at))}</span>`);
          if (transcript.duration) {
            _push(`<span class="text-xs text-gray-400" data-v-142df71f>${ssrInterpolate(formatDuration(transcript.duration))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><h3 class="text-white font-medium mb-2" data-v-142df71f>${ssrInterpolate(transcript.source_name || "Untitled")}</h3><p class="text-gray-300 text-sm mb-3 line-clamp-2" data-v-142df71f>${ssrInterpolate(getTranscriptPreview(transcript.transcript_text))}</p>`);
          if (transcript.client_platform_id) {
            _push(`<div class="mb-3 p-2 bg-red-900/20 rounded border border-red-500/30" data-v-142df71f><p class="text-xs text-red-400 font-semibold mb-1" data-v-142df71f>⚠️ Churned Account:</p><div class="flex items-center gap-2" data-v-142df71f><div class="flex items-center gap-1" data-v-142df71f><span class="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300 border border-red-500/30" data-v-142df71f>${ssrInterpolate(transcript.account_name)}</span><button class="text-red-400 hover:text-red-200 transition-colors p-1 rounded" title="Copy Account Name" data-v-142df71f><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg></button></div><div class="flex items-center gap-1" data-v-142df71f><span class="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300 border border-red-500/30" data-v-142df71f> ID: ${ssrInterpolate(transcript.client_platform_id)}</span><button class="text-red-400 hover:text-red-200 transition-colors p-1 rounded" title="Copy Client Platform ID" data-v-142df71f><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg></button></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (transcript.attendees && (transcript.attendees.sellers || transcript.attendees.customers)) {
            _push(`<div class="mb-3 p-2 bg-gray-900/50 rounded border border-gray-700" data-v-142df71f>`);
            if (transcript.attendees.sellers && transcript.attendees.sellers.length > 0) {
              _push(`<div class="mb-2" data-v-142df71f><p class="text-xs text-purple-400 font-semibold mb-1" data-v-142df71f>👔 Sellers:</p><div class="flex flex-wrap gap-2" data-v-142df71f><!--[-->`);
              ssrRenderList(transcript.attendees.sellers.slice(0, 3), (seller, idx) => {
                _push(`<span class="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300 border border-purple-500/30"${ssrRenderAttr("title", seller.email)} data-v-142df71f>${ssrInterpolate(seller.name || seller.email || "Unknown")}</span>`);
              });
              _push(`<!--]-->`);
              if (transcript.attendees.sellers.length > 3) {
                _push(`<span class="px-2 py-1 text-xs text-gray-400" data-v-142df71f> +${ssrInterpolate(transcript.attendees.sellers.length - 3)} more </span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div>`);
            } else {
              _push(`<!---->`);
            }
            if (transcript.attendees.customers && transcript.attendees.customers.length > 0) {
              _push(`<div data-v-142df71f><p class="text-xs text-blue-400 font-semibold mb-1" data-v-142df71f>🏢 Customers:</p><div class="flex flex-wrap gap-2" data-v-142df71f><!--[-->`);
              ssrRenderList(transcript.attendees.customers.slice(0, 3), (customer, idx) => {
                _push(`<span class="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300 border border-blue-500/30"${ssrRenderAttr("title", customer.email)} data-v-142df71f>${ssrInterpolate(customer.name || customer.email || "Unknown")}</span>`);
              });
              _push(`<!--]-->`);
              if (transcript.attendees.customers.length > 3) {
                _push(`<span class="px-2 py-1 text-xs text-gray-400" data-v-142df71f> +${ssrInterpolate(transcript.attendees.customers.length - 3)} more </span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex items-center gap-4 text-xs text-gray-400" data-v-142df71f><div class="flex items-center gap-1" data-v-142df71f><span class="select-all cursor-pointer hover:text-gray-300 transition-colors" title="Click to select full ID" data-v-142df71f>ID: ${ssrInterpolate(transcript.diio_transcript_id)}</span><button class="text-gray-500 hover:text-white transition-colors p-1 rounded" title="Copy Transcript ID" data-v-142df71f><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg></button></div>`);
          if (transcript.attendees) {
            _push(`<span data-v-142df71f>${ssrInterpolate(getAttendeeCount(transcript.attendees))} attendees</span>`);
          } else {
            _push(`<!---->`);
          }
          if (transcript.client_platform_id) {
            _push(`<div class="flex items-center gap-1" data-v-142df71f><button class="text-gray-500 hover:text-white transition-colors p-1 rounded" title="Copy Client Platform ID" data-v-142df71f><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg></button></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="ml-4 flex flex-col items-end gap-2" data-v-142df71f><div class="flex items-center gap-2" data-v-142df71f><button class="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors duration-200" data-v-142df71f> View </button>`);
          if (transcript.feedback_extracted) {
            _push(`<button class="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-1" data-v-142df71f><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-142df71f></path></svg> Feedback </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><button${ssrIncludeBooleanAttr(unref(analyzingTranscript) === transcript.id || unref(hasQuotaError)) ? " disabled" : ""} class="${ssrRenderClass(unref(hasQuotaError) ? "px-3 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 text-xs rounded-lg cursor-not-allowed flex items-center gap-1" : "px-3 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1")}"${ssrRenderAttr("title", unref(hasQuotaError) ? "AI quota exceeded - please wait and try again" : "Analyze with AI")} data-v-142df71f>`);
          if (unref(analyzingTranscript) !== transcript.id) {
            _push(`<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" data-v-142df71f></path></svg>`);
          } else {
            _push(`<svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24" data-v-142df71f><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-142df71f></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-142df71f></path></svg>`);
          }
          _push(` ${ssrInterpolate(unref(analyzingTranscript) === transcript.id ? "Analyzing..." : unref(hasQuotaError) ? "Quota Exceeded" : "AI Analysis")}</button></div></div></div>`);
        });
        _push(`<!--]-->`);
        if (unref(totalPages) > 1) {
          _push(`<div class="pt-6 border-t border-white/10 mt-6 flex items-center justify-between" data-v-142df71f><div class="text-gray-400 text-sm" data-v-142df71f> Page ${ssrInterpolate(unref(currentPage))} of ${ssrInterpolate(unref(totalPages))}</div><div class="flex items-center gap-2" data-v-142df71f><button${ssrIncludeBooleanAttr(unref(currentPage) === 1) ? " disabled" : ""} class="px-4 py-2 bg-white/5 text-white rounded-lg border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" data-v-142df71f> Previous </button><button${ssrIncludeBooleanAttr(unref(currentPage) === unref(totalPages)) ? " disabled" : ""} class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200" data-v-142df71f> Next </button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
      if (unref(selectedTranscript)) {
        _push(`<div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" data-v-142df71f><div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[85vh] overflow-auto border border-gray-700 shadow-2xl" data-v-142df71f><div class="flex justify-between items-start mb-4" data-v-142df71f><div class="flex-1" data-v-142df71f><div class="flex items-center gap-2 mb-1" data-v-142df71f><h2 class="text-2xl font-bold text-white" data-v-142df71f>${ssrInterpolate(unref(selectedTranscript).source_name || "Untitled")}</h2><button class="text-gray-400 hover:text-white transition-colors p-1 rounded" title="Copy transcript name" data-v-142df71f><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg></button></div><div class="flex items-center gap-4" data-v-142df71f><p class="text-gray-400 text-sm" data-v-142df71f>${ssrInterpolate(unref(selectedTranscript).transcript_type === "meeting" ? "Meeting" : "Phone Call")} • ${ssrInterpolate(formatDate(unref(selectedTranscript).occurred_at || unref(selectedTranscript).created_at))}</p><div class="flex items-center gap-2" data-v-142df71f><span class="text-gray-500 text-xs" data-v-142df71f>ID:</span><button class="text-gray-400 hover:text-white transition-colors px-2 py-1 bg-gray-800 rounded text-xs flex items-center gap-1" title="Copy Transcript ID" data-v-142df71f><span data-v-142df71f>${ssrInterpolate(unref(selectedTranscript).diio_transcript_id)}</span><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg></button></div></div>`);
        if (unref(selectedTranscript).attendees && (unref(selectedTranscript).attendees.sellers || unref(selectedTranscript).attendees.customers)) {
          _push(`<div class="mt-3 p-3 bg-gray-900/50 rounded border border-gray-700" data-v-142df71f>`);
          if (unref(selectedTranscript).attendees.sellers && unref(selectedTranscript).attendees.sellers.length > 0) {
            _push(`<div class="mb-3" data-v-142df71f><p class="text-xs text-purple-400 font-semibold mb-2" data-v-142df71f>👔 Sellers:</p><div class="space-y-1" data-v-142df71f><!--[-->`);
            ssrRenderList(unref(selectedTranscript).attendees.sellers, (seller, idx) => {
              _push(`<div class="flex items-center gap-2 text-sm" data-v-142df71f><span class="text-purple-300" data-v-142df71f>${ssrInterpolate(seller.name || "Unknown")}</span>`);
              if (seller.email) {
                _push(`<span class="text-gray-400 text-xs" data-v-142df71f>${ssrInterpolate(seller.email)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(selectedTranscript).attendees.customers && unref(selectedTranscript).attendees.customers.length > 0) {
            _push(`<div data-v-142df71f><p class="text-xs text-blue-400 font-semibold mb-2" data-v-142df71f>🏢 Customers:</p><div class="space-y-1" data-v-142df71f><!--[-->`);
            ssrRenderList(unref(selectedTranscript).attendees.customers, (customer, idx) => {
              _push(`<div class="flex items-center gap-2 text-sm" data-v-142df71f><span class="text-blue-300" data-v-142df71f>${ssrInterpolate(customer.name || "Unknown")}</span>`);
              if (customer.email) {
                _push(`<span class="text-gray-400 text-xs" data-v-142df71f>${ssrInterpolate(customer.email)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button class="text-gray-400 hover:text-white text-2xl transition-colors duration-200 ml-4" data-v-142df71f> × </button></div><div class="bg-gray-900 rounded-lg p-4 text-gray-300 whitespace-pre-wrap border border-gray-700 max-h-[50vh] overflow-auto" data-v-142df71f>${ssrInterpolate(formatTranscriptText(unref(selectedTranscript).transcript_text))}</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(selectedFeedbackTranscript)) {
        _push(`<div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" data-v-142df71f><div class="bg-gray-800 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-auto border border-gray-700 shadow-2xl" data-v-142df71f><div class="flex justify-between items-start mb-4" data-v-142df71f><div data-v-142df71f><div class="flex items-center gap-2 mb-1" data-v-142df71f><h2 class="text-2xl font-bold text-white" data-v-142df71f>Feedback &amp; Churn Signals</h2><button class="text-gray-400 hover:text-white transition-colors p-1 rounded" title="Copy Transcript ID" data-v-142df71f><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg></button></div><p class="text-gray-400 text-sm" data-v-142df71f>${ssrInterpolate(unref(selectedFeedbackTranscript).source_name || "Untitled")} • ${ssrInterpolate(formatDate(unref(selectedFeedbackTranscript).occurred_at || unref(selectedFeedbackTranscript).created_at))}</p></div><button class="text-gray-400 hover:text-white text-2xl transition-colors duration-200" data-v-142df71f> × </button></div>`);
        if (unref(loadingFeedback)) {
          _push(`<div class="text-center py-8" data-v-142df71f><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto" data-v-142df71f></div><p class="text-gray-400 mt-2" data-v-142df71f>Loading feedback...</p></div>`);
        } else if (unref(feedbackSegments).length === 0) {
          _push(`<div class="text-center py-8" data-v-142df71f><p class="text-gray-400" data-v-142df71f>No feedback segments found for this transcript.</p></div>`);
        } else {
          _push(`<div class="space-y-4" data-v-142df71f><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-v-142df71f><div class="bg-gray-900 rounded-lg p-4 border border-gray-700" data-v-142df71f><p class="text-gray-400 text-sm" data-v-142df71f>Total Segments</p><p class="text-2xl font-bold text-white" data-v-142df71f>${ssrInterpolate(unref(feedbackSegments).length)}</p></div><div class="bg-gray-900 rounded-lg p-4 border border-gray-700" data-v-142df71f><p class="text-gray-400 text-sm" data-v-142df71f>Critical Signals</p><p class="text-2xl font-bold text-red-400" data-v-142df71f>${ssrInterpolate(unref(criticalSignalsCount))}</p></div><div class="bg-gray-900 rounded-lg p-4 border border-gray-700" data-v-142df71f><p class="text-gray-400 text-sm" data-v-142df71f>Pain Points</p><p class="text-2xl font-bold text-orange-400" data-v-142df71f>${ssrInterpolate(unref(painPointsCount))}</p></div><div class="bg-gray-900 rounded-lg p-4 border border-gray-700" data-v-142df71f><p class="text-gray-400 text-sm" data-v-142df71f>Negative Sentiment</p><p class="text-2xl font-bold text-red-400" data-v-142df71f>${ssrInterpolate(unref(negativeSentimentCount))}</p></div></div><div class="space-y-3" data-v-142df71f><h3 class="text-lg font-semibold text-white mb-3" data-v-142df71f>Feedback Segments</h3><!--[-->`);
          ssrRenderList(unref(feedbackSegments), (segment, index) => {
            _push(`<div class="${ssrRenderClass([{
              "border-red-500": segment.urgency === "critical",
              "border-orange-500": segment.urgency === "high" && segment.urgency !== "critical",
              "border-yellow-500": segment.urgency === "medium" && segment.urgency !== "high" && segment.urgency !== "critical"
            }, "bg-gray-900 rounded-lg p-4 border border-gray-700"])}" data-v-142df71f><div class="flex items-start justify-between mb-2" data-v-142df71f><div class="flex items-center gap-2 flex-wrap" data-v-142df71f><span class="px-2 py-1 text-xs rounded bg-indigo-500/20 text-indigo-300" data-v-142df71f>${ssrInterpolate(segment.speaker_type === "seller" ? "Seller" : segment.speaker_type === "customer" ? "Customer" : "Unknown")}</span><span class="${ssrRenderClass([{
              "bg-red-500/20 text-red-300": segment.feedback_type === "pain_point",
              "bg-blue-500/20 text-blue-300": segment.feedback_type === "feature_request",
              "bg-green-500/20 text-green-300": segment.feedback_type === "praise",
              "bg-yellow-500/20 text-yellow-300": segment.feedback_type === "concern",
              "bg-purple-500/20 text-purple-300": segment.feedback_type === "question"
            }, "px-2 py-1 text-xs rounded"])}" data-v-142df71f>${ssrInterpolate(segment.feedback_type.replace("_", " "))}</span><span class="${ssrRenderClass([{
              "bg-red-500/20 text-red-300": segment.urgency === "critical",
              "bg-orange-500/20 text-orange-300": segment.urgency === "high",
              "bg-yellow-500/20 text-yellow-300": segment.urgency === "medium",
              "bg-gray-500/20 text-gray-300": segment.urgency === "low"
            }, "px-2 py-1 text-xs rounded"])}" data-v-142df71f>${ssrInterpolate(segment.urgency)}</span><span class="${ssrRenderClass([{
              "bg-green-500/20 text-green-300": segment.sentiment === "positive",
              "bg-red-500/20 text-red-300": segment.sentiment === "negative",
              "bg-gray-500/20 text-gray-300": segment.sentiment === "neutral"
            }, "px-2 py-1 text-xs rounded"])}" data-v-142df71f>${ssrInterpolate(segment.sentiment)}</span></div></div><p class="text-gray-300 mb-2" data-v-142df71f>${ssrInterpolate(segment.feedback_text)}</p>`);
            if (segment.keywords && segment.keywords.length > 0) {
              _push(`<div class="mt-2" data-v-142df71f><p class="text-xs text-gray-500 mb-1" data-v-142df71f>Keywords:</p><div class="flex flex-wrap gap-1" data-v-142df71f><!--[-->`);
              ssrRenderList(segment.keywords, (keyword) => {
                _push(`<span class="px-2 py-1 text-xs rounded bg-gray-800 text-gray-400" data-v-142df71f>${ssrInterpolate(keyword)}</span>`);
              });
              _push(`<!--]--></div></div>`);
            } else {
              _push(`<!---->`);
            }
            if (segment.churn_signals && segment.churn_signals.length > 0) {
              _push(`<div class="mt-3 pt-3 border-t border-gray-700" data-v-142df71f><p class="text-xs text-red-400 font-semibold mb-2" data-v-142df71f>⚠️ Churn Signals Detected:</p><div class="flex flex-wrap gap-2" data-v-142df71f><!--[-->`);
              ssrRenderList(segment.churn_signals, (signal) => {
                _push(`<span class="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300 border border-red-500/50" data-v-142df71f>${ssrInterpolate(signal)}</span>`);
              });
              _push(`<!--]--></div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showChurnedReportModal)) {
        _push(`<div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" data-v-142df71f><div class="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto border border-gray-700 shadow-2xl" data-v-142df71f><div class="flex justify-between items-start mb-6" data-v-142df71f><div data-v-142df71f><h2 class="text-2xl font-bold text-white flex items-center gap-2" data-v-142df71f><svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" data-v-142df71f></path></svg> Churned Accounts Report </h2><p class="text-gray-400 text-sm mt-1" data-v-142df71f> Generated on ${ssrInterpolate(unref(churnedReportData) ? new Date(unref(churnedReportData).generatedAt).toLocaleString() : "Unknown")}</p></div><button class="text-gray-400 hover:text-white text-2xl transition-colors duration-200" data-v-142df71f> × </button></div>`);
        if (unref(churnedReportData)) {
          _push(`<div class="space-y-6" data-v-142df71f><div class="bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg p-6 border border-red-500/30" data-v-142df71f><h3 class="text-xl font-bold text-white mb-4 flex items-center gap-2" data-v-142df71f><svg class="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" data-v-142df71f></path></svg> Executive Summary </h3><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4" data-v-142df71f><div class="bg-gray-900/50 rounded-lg p-4 text-center" data-v-142df71f><div class="text-2xl font-bold text-red-400" data-v-142df71f>${ssrInterpolate(unref(churnedReportData).totalChurnedAccounts)}</div><div class="text-xs text-gray-400" data-v-142df71f>Churned Accounts</div></div><div class="bg-gray-900/50 rounded-lg p-4 text-center" data-v-142df71f><div class="text-2xl font-bold text-blue-400" data-v-142df71f>${ssrInterpolate(unref(churnedReportData).totalTranscripts)}</div><div class="text-xs text-gray-400" data-v-142df71f>Total Transcripts</div></div><div class="bg-gray-900/50 rounded-lg p-4 text-center" data-v-142df71f><div class="text-2xl font-bold text-green-400" data-v-142df71f>${ssrInterpolate(unref(churnedReportData).accountsWithTranscripts)}</div><div class="text-xs text-gray-400" data-v-142df71f>Accounts with Data</div></div><div class="bg-gray-900/50 rounded-lg p-4 text-center" data-v-142df71f><div class="text-2xl font-bold text-gray-400" data-v-142df71f>${ssrInterpolate(unref(churnedReportData).accountsWithoutTranscripts)}</div><div class="text-xs text-gray-400" data-v-142df71f>Accounts without Data</div></div></div></div><div class="bg-gray-900/50 rounded-lg p-6 border border-gray-700" data-v-142df71f><h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2" data-v-142df71f><svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" data-v-142df71f></path></svg> Transcript Distribution </h3><div class="space-y-3" data-v-142df71f><div class="flex items-center justify-between p-3 bg-gray-800 rounded" data-v-142df71f><span class="text-gray-300" data-v-142df71f>1 transcript</span><span class="text-blue-400 font-bold" data-v-142df71f>${ssrInterpolate(unref(churnedReportData).transcriptDistribution.accountsWith1Transcript)}</span></div><div class="flex items-center justify-between p-3 bg-gray-800 rounded" data-v-142df71f><span class="text-gray-300" data-v-142df71f>2-5 transcripts</span><span class="text-blue-400 font-bold" data-v-142df71f>${ssrInterpolate(unref(churnedReportData).transcriptDistribution.accountsWith2To5Transcripts)}</span></div><div class="flex items-center justify-between p-3 bg-gray-800 rounded" data-v-142df71f><span class="text-gray-300" data-v-142df71f>6-10 transcripts</span><span class="text-blue-400 font-bold" data-v-142df71f>${ssrInterpolate(unref(churnedReportData).transcriptDistribution.accountsWith6To10Transcripts)}</span></div><div class="flex items-center justify-between p-3 bg-gray-800 rounded" data-v-142df71f><span class="text-gray-300" data-v-142df71f>10+ transcripts</span><span class="text-red-400 font-bold" data-v-142df71f>${ssrInterpolate(unref(churnedReportData).transcriptDistribution.accountsWith10PlusTranscripts)}</span></div></div></div><div class="bg-gray-900/50 rounded-lg p-6 border border-gray-700" data-v-142df71f><div class="flex items-center justify-between mb-4" data-v-142df71f><h3 class="text-lg font-bold text-white flex items-center gap-2" data-v-142df71f><svg class="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" data-v-142df71f></path></svg> Top Accounts by Transcripts </h3><button class="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors" data-v-142df71f><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg> Copy Report </button></div><div class="space-y-2" data-v-142df71f><!--[-->`);
          ssrRenderList(unref(churnedReportData).topAccountsByTranscripts.slice(0, 20), (account, index) => {
            _push(`<div class="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-700 transition-colors" data-v-142df71f><div class="flex items-center gap-3" data-v-142df71f><span class="text-lg font-bold text-yellow-400 min-w-[30px]" data-v-142df71f>#${ssrInterpolate(index + 1)}</span><div data-v-142df71f><div class="text-white font-medium" data-v-142df71f>${ssrInterpolate(account.accountName)}</div><div class="text-gray-400 text-sm" data-v-142df71f>${ssrInterpolate(account.clientPlatformId)}</div></div></div><div class="flex items-center gap-3" data-v-142df71f><div class="text-right" data-v-142df71f><div class="text-blue-400 font-bold" data-v-142df71f>${ssrInterpolate(account.transcriptCount)}</div><div class="text-gray-500 text-xs" data-v-142df71f>transcripts</div></div><div class="flex gap-1" data-v-142df71f><button class="text-gray-500 hover:text-white transition-colors p-1 rounded" title="Copy Account Name" data-v-142df71f><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg></button><button class="text-gray-500 hover:text-white transition-colors p-1 rounded" title="Copy Client Platform ID" data-v-142df71f><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg></button></div></div></div>`);
          });
          _push(`<!--]--></div></div><div class="bg-gray-900/50 rounded-lg p-6 border border-gray-700" data-v-142df71f><h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2" data-v-142df71f><svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-142df71f></path></svg> Raw Data </h3><div class="bg-gray-800 rounded p-4 font-mono text-sm text-gray-300 overflow-x-auto" data-v-142df71f><pre data-v-142df71f>${ssrInterpolate(JSON.stringify(unref(churnedReportData), null, 2))}</pre></div><div class="flex justify-end mt-4" data-v-142df71f><button class="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors" data-v-142df71f><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-142df71f></path></svg> Copy JSON </button></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(aiAnalysisResult)) {
        _push(`<div class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50" data-v-142df71f><div class="bg-gray-800 rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-auto border border-gray-700 shadow-2xl" data-v-142df71f><div class="flex justify-between items-start mb-4" data-v-142df71f><div data-v-142df71f><div class="flex items-center gap-3" data-v-142df71f><h2 class="text-2xl font-bold text-white flex items-center gap-2" data-v-142df71f><svg class="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" data-v-142df71f></path></svg> AI Sentiment Analysis </h2>`);
        if (unref(aiAnalysisResult).metadata.cached) {
          _push(`<span class="px-3 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300 border border-green-500/30" data-v-142df71f> ⚡ Cached </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><p class="text-gray-400 text-sm mt-1" data-v-142df71f>${ssrInterpolate(unref(aiAnalysisResult).metadata.sourceName)}</p></div><button class="text-gray-400 hover:text-white text-2xl transition-colors duration-200" data-v-142df71f> × </button></div><div class="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30" data-v-142df71f><p class="text-white text-sm leading-relaxed" data-v-142df71f>${ssrInterpolate(unref(aiAnalysisResult).analysis.summary)}</p></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-v-142df71f><div class="bg-gray-900 rounded-lg p-4 border border-gray-700" data-v-142df71f><p class="text-gray-400 text-xs mb-1" data-v-142df71f>Overall Sentiment</p><p class="${ssrRenderClass([{
          "text-green-400": unref(aiAnalysisResult).analysis.overallSentiment === "positive",
          "text-yellow-400": unref(aiAnalysisResult).analysis.overallSentiment === "neutral" || unref(aiAnalysisResult).analysis.overallSentiment === "mixed",
          "text-red-400": unref(aiAnalysisResult).analysis.overallSentiment === "negative"
        }, "text-lg font-bold"])}" data-v-142df71f>${ssrInterpolate(unref(aiAnalysisResult).analysis.overallSentiment.toUpperCase())}</p></div><div class="bg-gray-900 rounded-lg p-4 border border-gray-700" data-v-142df71f><p class="text-gray-400 text-xs mb-1" data-v-142df71f>Customer Status</p><p class="${ssrRenderClass([{
          "text-green-400": unref(aiAnalysisResult).analysis.customerSatisfaction === "satisfied",
          "text-yellow-400": unref(aiAnalysisResult).analysis.customerSatisfaction === "neutral",
          "text-orange-400": unref(aiAnalysisResult).analysis.customerSatisfaction === "frustrated",
          "text-red-400": unref(aiAnalysisResult).analysis.customerSatisfaction === "at_risk"
        }, "text-lg font-bold"])}" data-v-142df71f>${ssrInterpolate(unref(aiAnalysisResult).analysis.customerSatisfaction.replace("_", " ").toUpperCase())}</p></div><div class="bg-gray-900 rounded-lg p-4 border border-gray-700" data-v-142df71f><p class="text-gray-400 text-xs mb-1" data-v-142df71f>Churn Risk</p><p class="${ssrRenderClass([{
          "text-green-400": unref(aiAnalysisResult).analysis.churnRisk === "low",
          "text-yellow-400": unref(aiAnalysisResult).analysis.churnRisk === "medium",
          "text-orange-400": unref(aiAnalysisResult).analysis.churnRisk === "high",
          "text-red-400": unref(aiAnalysisResult).analysis.churnRisk === "critical"
        }, "text-lg font-bold"])}" data-v-142df71f>${ssrInterpolate(unref(aiAnalysisResult).analysis.churnRisk.toUpperCase())}</p></div><div class="bg-gray-900 rounded-lg p-4 border border-gray-700" data-v-142df71f><p class="text-gray-400 text-xs mb-1" data-v-142df71f>Sentiment Score</p><p class="${ssrRenderClass([{
          "text-green-400": unref(aiAnalysisResult).analysis.sentimentScore > 0.3,
          "text-yellow-400": unref(aiAnalysisResult).analysis.sentimentScore >= -0.3 && unref(aiAnalysisResult).analysis.sentimentScore <= 0.3,
          "text-red-400": unref(aiAnalysisResult).analysis.sentimentScore < -0.3
        }, "text-lg font-bold"])}" data-v-142df71f>${ssrInterpolate((unref(aiAnalysisResult).analysis.sentimentScore * 100).toFixed(0))}% </p></div></div>`);
        if (unref(aiAnalysisResult).analysis.churnSignals.length > 0) {
          _push(`<div class="mb-6" data-v-142df71f><h3 class="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2" data-v-142df71f><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-142df71f><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" data-v-142df71f></path></svg> ⚠️ Churn Signals Detected </h3><div class="space-y-2" data-v-142df71f><!--[-->`);
          ssrRenderList(unref(aiAnalysisResult).analysis.churnSignals, (signal, idx) => {
            _push(`<div class="p-3 bg-red-500/10 rounded border border-red-500/30 text-red-300 text-sm" data-v-142df71f>${ssrInterpolate(signal)}</div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(aiAnalysisResult).analysis.keyThemes.length > 0) {
          _push(`<div class="mb-6" data-v-142df71f><h3 class="text-lg font-semibold text-white mb-3" data-v-142df71f>🎯 Key Themes</h3><div class="space-y-3" data-v-142df71f><!--[-->`);
          ssrRenderList(unref(aiAnalysisResult).analysis.keyThemes, (theme, idx) => {
            _push(`<div class="p-3 bg-gray-900 rounded border border-gray-700" data-v-142df71f><div class="flex items-center justify-between mb-2" data-v-142df71f><span class="text-white font-medium" data-v-142df71f>${ssrInterpolate(theme.theme)}</span><div class="flex items-center gap-2" data-v-142df71f><span class="${ssrRenderClass([{
              "bg-green-500/20 text-green-300": theme.sentiment === "positive",
              "bg-yellow-500/20 text-yellow-300": theme.sentiment === "neutral",
              "bg-red-500/20 text-red-300": theme.sentiment === "negative"
            }, "px-2 py-1 text-xs rounded"])}" data-v-142df71f>${ssrInterpolate(theme.sentiment)}</span><span class="${ssrRenderClass([{
              "bg-red-500/20 text-red-300": theme.urgency === "critical",
              "bg-orange-500/20 text-orange-300": theme.urgency === "high",
              "bg-yellow-500/20 text-yellow-300": theme.urgency === "medium",
              "bg-gray-500/20 text-gray-300": theme.urgency === "low"
            }, "px-2 py-1 text-xs rounded"])}" data-v-142df71f>${ssrInterpolate(theme.urgency)}</span><span class="text-gray-400 text-xs" data-v-142df71f>${ssrInterpolate(theme.mentions)} mentions</span></div></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" data-v-142df71f>`);
        if (unref(aiAnalysisResult).analysis.painPoints.length > 0) {
          _push(`<div data-v-142df71f><h3 class="text-lg font-semibold text-orange-400 mb-3" data-v-142df71f>😰 Pain Points</h3><div class="space-y-2" data-v-142df71f><!--[-->`);
          ssrRenderList(unref(aiAnalysisResult).analysis.painPoints, (point, idx) => {
            _push(`<div class="p-3 bg-orange-500/10 rounded border border-orange-500/30 text-orange-200 text-sm" data-v-142df71f>${ssrInterpolate(point)}</div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(aiAnalysisResult).analysis.positiveHighlights.length > 0) {
          _push(`<div data-v-142df71f><h3 class="text-lg font-semibold text-green-400 mb-3" data-v-142df71f>✨ Positive Highlights</h3><div class="space-y-2" data-v-142df71f><!--[-->`);
          ssrRenderList(unref(aiAnalysisResult).analysis.positiveHighlights, (highlight, idx) => {
            _push(`<div class="p-3 bg-green-500/10 rounded border border-green-500/30 text-green-200 text-sm" data-v-142df71f>${ssrInterpolate(highlight)}</div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(aiAnalysisResult).analysis.actionableInsights.length > 0) {
          _push(`<div data-v-142df71f><h3 class="text-lg font-semibold text-blue-400 mb-3" data-v-142df71f>💡 Actionable Insights</h3><div class="space-y-3" data-v-142df71f><!--[-->`);
          ssrRenderList(unref(aiAnalysisResult).analysis.actionableInsights, (insight, idx) => {
            _push(`<div class="p-4 bg-blue-500/10 rounded border border-blue-500/30" data-v-142df71f><div class="flex items-start justify-between mb-2" data-v-142df71f><span class="text-white font-medium flex-1" data-v-142df71f>${ssrInterpolate(insight.insight)}</span><span class="${ssrRenderClass([{
              "bg-red-500/20 text-red-300": insight.priority === "critical",
              "bg-orange-500/20 text-orange-300": insight.priority === "high",
              "bg-yellow-500/20 text-yellow-300": insight.priority === "medium",
              "bg-gray-500/20 text-gray-300": insight.priority === "low"
            }, "px-2 py-1 text-xs rounded ml-2"])}" data-v-142df71f>${ssrInterpolate(insight.priority.toUpperCase())}</span></div><div class="flex items-center gap-4 text-xs text-gray-400" data-v-142df71f><span data-v-142df71f>👤 Owner: <span class="text-blue-300" data-v-142df71f>${ssrInterpolate(insight.owner)}</span></span><span data-v-142df71f>📊 Impact: <span class="text-blue-300" data-v-142df71f>${ssrInterpolate(insight.estimatedImpact)}</span></span></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/diio.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const diio = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-142df71f"]]);

export { diio as default };
//# sourceMappingURL=diio-DHAhhNoN.mjs.map
