import { ref, unref, useSSRContext } from 'vue';
import { ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';

const _sfc_main = {
  __name: "ReportDisplayModal",
  __ssrInlineRender: true,
  props: {
    isOpen: Boolean,
    reportData: Object
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const showCopySuccess = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      if (__props.isOpen) {
        _push(`<div class="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] lg:w-[800px] flex flex-col bg-ontop-navy-dark shadow-2xl border-l border-white/10"><div class="flex-shrink-0 bg-gradient-ontop-hero px-6 py-4 border-b border-white/10"><div class="flex items-center justify-between"><div class="flex items-center flex-1 min-w-0"><div class="w-10 h-10 bg-gradient-cta rounded-lg flex items-center justify-center mr-3 flex-shrink-0"><svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></div><div class="min-w-0 flex-1"><h3 class="text-xl font-bold text-white truncate">${ssrInterpolate(__props.reportData.title)}</h3><p class="text-white/70 text-sm truncate">${ssrInterpolate(__props.reportData.dateRange)}</p></div></div><div class="flex items-center space-x-1 ml-4 flex-shrink-0"><button class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200" title="Copy report to clipboard"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button><button class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200" title="Download as PDF"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></button><button class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200" title="Download as text file"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></button><button class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div></div><div class="flex-1 overflow-y-auto p-6 bg-gradient-dark"><div class="mb-6"><div class="flex items-center mb-4"><div class="w-8 h-8 bg-gradient-cta rounded-lg flex items-center justify-center mr-3"><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></div><h4 class="text-lg font-bold text-white">Executive Summary</h4></div><div class="grid grid-cols-2 gap-3"><div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 hover:border-blue-500/50 transition-all"><div class="flex items-center justify-between"><div><div class="text-3xl font-bold text-blue-400">${ssrInterpolate(__props.reportData.summary.total)}</div><div class="text-sm font-medium text-white/70 mt-1">Total Feedback</div></div><div class="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center"><svg class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg></div></div></div><div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-green-500/30 hover:border-green-500/50 transition-all"><div class="flex items-center justify-between"><div><div class="text-3xl font-bold text-green-400">${ssrInterpolate(__props.reportData.summary.positive)}</div><div class="text-sm font-medium text-white/70 mt-1">Positive (${ssrInterpolate(__props.reportData.summary.positivePercent)}%)</div></div><div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center"><svg class="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg></div></div></div><div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-500/50 transition-all"><div class="flex items-center justify-between"><div><div class="text-3xl font-bold text-yellow-400">${ssrInterpolate(__props.reportData.summary.neutral)}</div><div class="text-sm font-medium text-white/70 mt-1">Neutral (${ssrInterpolate(__props.reportData.summary.neutralPercent)}%)</div></div><div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center"><svg class="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div></div></div><div class="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-red-500/30 hover:border-red-500/50 transition-all"><div class="flex items-center justify-between"><div><div class="text-3xl font-bold text-red-400">${ssrInterpolate(__props.reportData.summary.negative)}</div><div class="text-sm font-medium text-white/70 mt-1">Negative (${ssrInterpolate(__props.reportData.summary.negativePercent)}%)</div></div><div class="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center"><svg class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"></path></svg></div></div></div></div></div>`);
        if (__props.reportData.managers && __props.reportData.managers.length > 0) {
          _push(`<div class="mb-4"><div class="flex items-center mb-2"><div class="w-6 h-6 bg-purple-500 rounded flex items-center justify-center mr-2"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div><h4 class="text-sm font-bold text-white">Account Manager Performance</h4></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-2"><!--[-->`);
          ssrRenderList(__props.reportData.managers, (manager) => {
            _push(`<div class="bg-white/5 rounded-lg p-3 border border-white/10"><div class="flex items-center justify-between mb-2"><h5 class="text-sm font-semibold text-white truncate">${ssrInterpolate(manager.name)}</h5><span class="${ssrRenderClass([{
              "bg-green-500/20 text-green-300": manager.positiveRate >= 70,
              "bg-yellow-500/20 text-yellow-300": manager.positiveRate >= 50 && manager.positiveRate < 70,
              "bg-red-500/20 text-red-300": manager.positiveRate < 50
            }, "text-xs font-medium px-2 py-1 rounded-full"])}">${ssrInterpolate(manager.positiveRate)}% </span></div><div class="grid grid-cols-4 gap-1 text-xs"><div class="bg-white/10 rounded p-1 text-center"><div class="font-bold text-white">${ssrInterpolate(manager.total)}</div><div class="text-white/70 text-xs">Total</div></div><div class="bg-green-500/20 rounded p-1 text-center"><div class="font-bold text-green-400">${ssrInterpolate(manager.positive)}</div><div class="text-green-300 text-xs">+</div></div><div class="bg-yellow-500/20 rounded p-1 text-center"><div class="font-bold text-yellow-400">${ssrInterpolate(manager.neutral)}</div><div class="text-yellow-300 text-xs">~</div></div><div class="bg-red-500/20 rounded p-1 text-center"><div class="font-bold text-red-400">${ssrInterpolate(manager.negative)}</div><div class="text-red-300 text-xs">-</div></div></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.reportData.topAccounts && __props.reportData.topAccounts.length > 0) {
          _push(`<div class="mb-4"><div class="flex items-center mb-2"><div class="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center mr-2"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div><h4 class="text-sm font-bold text-white">Top Accounts by Feedback Volume</h4></div><div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2"><!--[-->`);
          ssrRenderList(__props.reportData.topAccounts.slice(0, 12), (account, index) => {
            _push(`<div class="flex items-center bg-white/5 rounded-lg p-2 border border-white/10"><span class="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">${ssrInterpolate(index + 1)}</span><div class="min-w-0 flex-1"><div class="font-medium text-white text-xs truncate">${ssrInterpolate(account.name)}</div><div class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">${ssrInterpolate(account.count)}</div></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mb-4"><div class="flex items-center mb-2"><div class="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-2"><svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg></div><h4 class="text-sm font-bold text-white">Key Insights &amp; Recommendations</h4></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-2"><!--[-->`);
        ssrRenderList(__props.reportData.insights, (insight) => {
          _push(`<div class="flex items-start bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800"><svg class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><p class="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">${ssrInterpolate(insight)}</p></div>`);
        });
        _push(`<!--]--></div></div></div><div class="flex-shrink-0 bg-white/5 px-4 py-3 border-t border-white/10"><div class="flex items-center justify-between"><p class="text-sm text-white"> Generated on ${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleString())}</p><div class="flex space-x-3"><button class="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"><svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Download PDF </button><button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"><svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> Copy Report </button><button class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"> Close </button></div></div></div>`);
        if (unref(showCopySuccess)) {
          _push(`<div class="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[60] flex items-center"><svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Report copied to clipboard! </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.isOpen) {
        _push(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ReportDisplayModal.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = Object.assign(_sfc_main, { __name: "ReportDisplayModal" });
const useAIRecommendations = () => {
  const loading = ref(false);
  const error = ref(null);
  const recommendations = ref(null);
  const metadata = ref(null);
  const generateRecommendations = async (feedbackItems, options = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch("/api/ai/recommendations", {
        method: "POST",
        body: {
          feedbackItems,
          segmentType: options.segmentType || "all",
          segmentValue: options.segmentValue,
          focusArea: options.focusArea,
          includeTranscripts: options.includeTranscripts || false,
          transcriptFeedback: options.transcriptFeedback || []
        }
      });
      if (response.success) {
        recommendations.value = response.data;
        metadata.value = response.metadata;
      } else {
        throw new Error("Failed to generate recommendations");
      }
    } catch (err) {
      error.value = err.message || "Failed to generate AI recommendations";
      console.error("AI Recommendations Error:", err);
    } finally {
      loading.value = false;
    }
  };
  const clearRecommendations = () => {
    recommendations.value = null;
    metadata.value = null;
    error.value = null;
  };
  return {
    loading,
    error,
    recommendations,
    metadata,
    generateRecommendations,
    clearRecommendations
  };
};

export { __nuxt_component_0 as _, useAIRecommendations as u };
//# sourceMappingURL=useAIRecommendations-DEFGeQJx.mjs.map
