import { u as useAIRecommendations, _ as __nuxt_component_0 } from './useAIRecommendations-DEFGeQJx.mjs';
import { defineComponent, ref, resolveComponent, mergeProps, withCtx, createVNode, createBlock, openBlock, createTextVNode, unref, toDisplayString, Fragment, renderList, createCommentVNode, withModifiers, readonly, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useHead } from './composables-BNSvOOTx.mjs';
import './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'pinia';
import 'vue-router';

const useGoogleSheets = () => {
  const data = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const lastUpdated = ref(null);
  const fetchData = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await $fetch("/api/sheets/data");
      data.value = response.data;
      lastUpdated.value = response.lastUpdated;
    } catch (err) {
      error.value = err.message || "Failed to fetch data";
      console.error("Error fetching Google Sheets data:", err);
    } finally {
      loading.value = false;
    }
  };
  const testConnection = async () => {
    try {
      const response = await $fetch("/api/sheets/test");
      return response;
    } catch (err) {
      throw new Error(`Connection test failed: ${err.message}`);
    }
  };
  const refreshData = async () => {
    await fetchData();
  };
  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    lastUpdated: readonly(lastUpdated),
    fetchData,
    testConnection,
    refreshData
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reports",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Unified Reports - Ontop Feedback Analytics",
      meta: [
        { name: "description", content: "Generate comprehensive unified reports with AI insights" }
      ]
    });
    useGoogleSheets();
    useAIRecommendations();
    const showReportModal = ref(false);
    const showReportDisplay = ref(false);
    const generating = ref(false);
    const currentReportHTML = ref("");
    const reportConfig = ref({
      title: "Unified Intelligence Report",
      period: "last-week",
      startDate: "",
      endDate: "",
      includeAI: true,
      includeManager: true,
      includeAccounts: true
    });
    const recentReports = ref([]);
    const saveReportsToStorage = () => {
      try {
        localStorage.setItem("unified_reports", JSON.stringify(recentReports.value));
      } catch (error) {
        console.error("Error saving reports:", error);
      }
    };
    const updateDateRange = () => {
      const now = /* @__PURE__ */ new Date();
      let startDate, endDate;
      switch (reportConfig.value.period) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case "yesterday":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setDate(now.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "this-week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          break;
        case "last-week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay() - 7);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          endDate.setDate(now.getDate() - now.getDay() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "this-month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now);
          break;
        case "last-month":
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          break;
        case "last-30-days":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          break;
        case "last-90-days":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 90);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now);
          break;
        default:
          return;
      }
      reportConfig.value.startDate = startDate.toISOString().split("T")[0];
      reportConfig.value.endDate = endDate.toISOString().split("T")[0];
    };
    const getDateRangePreview = () => {
      if (reportConfig.value.period === "custom") {
        return `${reportConfig.value.startDate} to ${reportConfig.value.endDate}`;
      }
      const labels = {
        "today": "today",
        "yesterday": "yesterday",
        "this-week": "this week",
        "last-week": "last week",
        "this-month": "this month",
        "last-month": "last month",
        "last-30-days": "the last 30 days",
        "last-90-days": "the last 90 days"
      };
      return labels[reportConfig.value.period] || "selected period";
    };
    const viewReport = (report) => {
      currentReportHTML.value = report.html;
      showReportDisplay.value = true;
    };
    const downloadReport = (report) => {
      const blob = new Blob([report.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = (void 0).createElement("a");
      link.href = url;
      link.download = `${report.title.replace(/\s+/g, "_")}_${report.id}.html`;
      link.click();
      URL.revokeObjectURL(url);
    };
    const deleteReport = (id) => {
      if (confirm("Are you sure you want to delete this report?")) {
        recentReports.value = recentReports.value.filter((r) => r.id !== id);
        saveReportsToStorage();
      }
    };
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    updateDateRange();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppCard = resolveComponent("AppCard");
      const _component_ReportDisplayModal = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" }, _attrs))}><header class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center py-8"><div><h1 class="text-3xl font-bold text-white drop-shadow-lg"> 📊 Unified Intelligence Reports </h1><p class="mt-2 text-blue-100 font-medium drop-shadow"> Comprehensive reports with AI-powered insights </p></div><div class="flex space-x-3"><button class="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105 flex items-center space-x-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><span>Generate New Report</span></button></div></div></div></header><main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">`);
      _push(ssrRenderComponent(_component_AppCard, { class: "mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-600" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><div class="flex items-start"${_scopeId}><div class="flex-shrink-0"${_scopeId}><svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"${_scopeId}></path></svg></div><div class="ml-4 flex-1"${_scopeId}><h3 class="text-lg font-bold text-white mb-2"${_scopeId}> 🎯 New Unified Report System </h3><p class="text-white text-sm leading-relaxed"${_scopeId}> All report types have been merged into <strong${_scopeId}>one comprehensive report</strong> that includes: <span class="block mt-2 space-y-1"${_scopeId}> • <strong${_scopeId}>AI-Powered Insights</strong> - Recurring patterns and recommendations<br${_scopeId}> • <strong${_scopeId}>Executive Summary</strong> - Key metrics and trends<br${_scopeId}> • <strong${_scopeId}>Detailed Analysis</strong> - By category, account, and manager<br${_scopeId}> • <strong${_scopeId}>Custom Time Periods</strong> - Analyze any date range you want </span></p></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("div", { class: "flex items-start" }, [
                  createVNode("div", { class: "flex-shrink-0" }, [
                    (openBlock(), createBlock("svg", {
                      class: "w-8 h-8 text-blue-600",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      })
                    ]))
                  ]),
                  createVNode("div", { class: "ml-4 flex-1" }, [
                    createVNode("h3", { class: "text-lg font-bold text-white mb-2" }, " 🎯 New Unified Report System "),
                    createVNode("p", { class: "text-white text-sm leading-relaxed" }, [
                      createTextVNode(" All report types have been merged into "),
                      createVNode("strong", null, "one comprehensive report"),
                      createTextVNode(" that includes: "),
                      createVNode("span", { class: "block mt-2 space-y-1" }, [
                        createTextVNode(" • "),
                        createVNode("strong", null, "AI-Powered Insights"),
                        createTextVNode(" - Recurring patterns and recommendations"),
                        createVNode("br"),
                        createTextVNode(" • "),
                        createVNode("strong", null, "Executive Summary"),
                        createTextVNode(" - Key metrics and trends"),
                        createVNode("br"),
                        createTextVNode(" • "),
                        createVNode("strong", null, "Detailed Analysis"),
                        createTextVNode(" - By category, account, and manager"),
                        createVNode("br"),
                        createTextVNode(" • "),
                        createVNode("strong", null, "Custom Time Periods"),
                        createTextVNode(" - Analyze any date range you want ")
                      ])
                    ])
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AppCard, { class: "mb-8" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50"${_scopeId}><div class="flex items-center justify-between"${_scopeId}><h3 class="text-lg font-bold text-white"${_scopeId}>📁 Recent Reports</h3><span class="text-sm text-white"${_scopeId}>${ssrInterpolate(unref(recentReports).length)} report${ssrInterpolate(unref(recentReports).length !== 1 ? "s" : "")} generated </span></div></div><div class="p-6"${_scopeId}>`);
            if (unref(recentReports).length === 0) {
              _push2(`<div class="text-center py-12"${_scopeId}><svg class="mx-auto h-12 w-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"${_scopeId}></path></svg><h3 class="mt-2 text-sm font-medium text-white"${_scopeId}>No reports yet</h3><p class="mt-1 text-sm text-white"${_scopeId}>Get started by generating your first unified report.</p><div class="mt-6"${_scopeId}><button class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"${_scopeId}><svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"${_scopeId}></path></svg> Generate Report </button></div></div>`);
            } else {
              _push2(`<div class="space-y-4"${_scopeId}><!--[-->`);
              ssrRenderList(unref(recentReports), (report) => {
                _push2(`<div class="group relative flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer"${_scopeId}><div class="flex items-center space-x-4 flex-1"${_scopeId}><div class="flex-shrink-0"${_scopeId}><div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg"${_scopeId}><svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"${_scopeId}></path></svg></div></div><div class="flex-1"${_scopeId}><h4 class="text-base font-bold text-white group-hover:text-blue-400 transition-colors"${_scopeId}>${ssrInterpolate(report.title)}</h4><p class="text-sm text-white mt-1"${_scopeId}>${ssrInterpolate(report.dateRange)} • ${ssrInterpolate(report.feedbackCount)} feedback items </p><p class="text-xs text-white mt-1"${_scopeId}> Generated ${ssrInterpolate(formatDate(report.generatedAt))}</p></div></div><div class="flex items-center space-x-3"${_scopeId}><div class="hidden sm:flex items-center space-x-4 mr-4"${_scopeId}><div class="text-center"${_scopeId}><div class="text-sm font-bold text-green-600 dark:text-green-400"${_scopeId}>${ssrInterpolate(report.stats.positive)}%</div><div class="text-xs text-white"${_scopeId}>Positive</div></div><div class="text-center"${_scopeId}><div class="text-sm font-bold text-red-600 dark:text-red-400"${_scopeId}>${ssrInterpolate(report.stats.negative)}%</div><div class="text-xs text-white"${_scopeId}>Negative</div></div>`);
                if (report.hasAIInsights) {
                  _push2(`<div class="text-center"${_scopeId}><div class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"${_scopeId}></path></svg> AI Insights </div></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><button class="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Download Report"${_scopeId}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"${_scopeId}></path></svg></button><button class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete Report"${_scopeId}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"${_scopeId}></path></svg></button></div></div>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50" }, [
                createVNode("div", { class: "flex items-center justify-between" }, [
                  createVNode("h3", { class: "text-lg font-bold text-white" }, "📁 Recent Reports"),
                  createVNode("span", { class: "text-sm text-white" }, toDisplayString(unref(recentReports).length) + " report" + toDisplayString(unref(recentReports).length !== 1 ? "s" : "") + " generated ", 1)
                ])
              ]),
              createVNode("div", { class: "p-6" }, [
                unref(recentReports).length === 0 ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "text-center py-12"
                }, [
                  (openBlock(), createBlock("svg", {
                    class: "mx-auto h-12 w-12 text-white/50",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    })
                  ])),
                  createVNode("h3", { class: "mt-2 text-sm font-medium text-white" }, "No reports yet"),
                  createVNode("p", { class: "mt-1 text-sm text-white" }, "Get started by generating your first unified report."),
                  createVNode("div", { class: "mt-6" }, [
                    createVNode("button", {
                      onClick: ($event) => showReportModal.value = true,
                      class: "inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    }, [
                      (openBlock(), createBlock("svg", {
                        class: "-ml-1 mr-2 h-5 w-5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M12 4v16m8-8H4"
                        })
                      ])),
                      createTextVNode(" Generate Report ")
                    ], 8, ["onClick"])
                  ])
                ])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "space-y-4"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(recentReports), (report) => {
                    return openBlock(), createBlock("div", {
                      key: report.id,
                      class: "group relative flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer",
                      onClick: ($event) => viewReport(report)
                    }, [
                      createVNode("div", { class: "flex items-center space-x-4 flex-1" }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          createVNode("div", { class: "w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg" }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-6 h-6 text-white",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor"
                            }, [
                              createVNode("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": "2",
                                d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              })
                            ]))
                          ])
                        ]),
                        createVNode("div", { class: "flex-1" }, [
                          createVNode("h4", { class: "text-base font-bold text-white group-hover:text-blue-400 transition-colors" }, toDisplayString(report.title), 1),
                          createVNode("p", { class: "text-sm text-white mt-1" }, toDisplayString(report.dateRange) + " • " + toDisplayString(report.feedbackCount) + " feedback items ", 1),
                          createVNode("p", { class: "text-xs text-white mt-1" }, " Generated " + toDisplayString(formatDate(report.generatedAt)), 1)
                        ])
                      ]),
                      createVNode("div", { class: "flex items-center space-x-3" }, [
                        createVNode("div", { class: "hidden sm:flex items-center space-x-4 mr-4" }, [
                          createVNode("div", { class: "text-center" }, [
                            createVNode("div", { class: "text-sm font-bold text-green-600 dark:text-green-400" }, toDisplayString(report.stats.positive) + "%", 1),
                            createVNode("div", { class: "text-xs text-white" }, "Positive")
                          ]),
                          createVNode("div", { class: "text-center" }, [
                            createVNode("div", { class: "text-sm font-bold text-red-600 dark:text-red-400" }, toDisplayString(report.stats.negative) + "%", 1),
                            createVNode("div", { class: "text-xs text-white" }, "Negative")
                          ]),
                          report.hasAIInsights ? (openBlock(), createBlock("div", {
                            key: 0,
                            class: "text-center"
                          }, [
                            createVNode("div", { class: "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300" }, [
                              (openBlock(), createBlock("svg", {
                                class: "w-3 h-3 mr-1",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24"
                              }, [
                                createVNode("path", {
                                  "stroke-linecap": "round",
                                  "stroke-linejoin": "round",
                                  "stroke-width": "2",
                                  d: "M13 10V3L4 14h7v7l9-11h-7z"
                                })
                              ])),
                              createTextVNode(" AI Insights ")
                            ])
                          ])) : createCommentVNode("", true)
                        ]),
                        createVNode("button", {
                          onClick: withModifiers(($event) => downloadReport(report), ["stop"]),
                          class: "p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors",
                          title: "Download Report"
                        }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            })
                          ]))
                        ], 8, ["onClick"]),
                        createVNode("button", {
                          onClick: withModifiers(($event) => deleteReport(report.id), ["stop"]),
                          class: "p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors",
                          title: "Delete Report"
                        }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            })
                          ]))
                        ], 8, ["onClick"])
                      ])
                    ], 8, ["onClick"]);
                  }), 128))
                ]))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</main>`);
      if (unref(showReportModal)) {
        _push(`<div class="fixed inset-0 z-50 overflow-y-auto"><div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"><div class="fixed inset-0 transition-opacity bg-black/75"></div><span class="hidden sm:inline-block sm:align-middle sm:h-screen">​</span><div class="inline-block align-bottom bg-ontop-navy-dark rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-white/10"><div class="bg-gradient-ontop-hero px-6 py-4"><div class="flex items-center justify-between"><div><h3 class="text-xl font-bold text-white">Generate Unified Report</h3><p class="text-sm text-white mt-1">Select time period and options</p></div><button class="text-white/80 hover:text-white transition-colors"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div></div><div class="px-6 py-6 space-y-6"><div><label class="block text-sm font-medium text-white/80 mb-2"> Report Title </label><input${ssrRenderAttr("value", unref(reportConfig).title)} type="text" placeholder="e.g., Weekly Executive Report" class="w-full border border-white/20 bg-white/10 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 placeholder-white/50"></div><div><label class="block text-sm font-medium text-white/80 mb-2"> Time Period </label><select class="w-full border border-white/20 bg-white/10 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500"><option value="today"${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).period) ? ssrLooseContain(unref(reportConfig).period, "today") : ssrLooseEqual(unref(reportConfig).period, "today")) ? " selected" : ""}>Today</option><option value="yesterday"${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).period) ? ssrLooseContain(unref(reportConfig).period, "yesterday") : ssrLooseEqual(unref(reportConfig).period, "yesterday")) ? " selected" : ""}>Yesterday</option><option value="this-week"${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).period) ? ssrLooseContain(unref(reportConfig).period, "this-week") : ssrLooseEqual(unref(reportConfig).period, "this-week")) ? " selected" : ""}>This Week</option><option value="last-week"${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).period) ? ssrLooseContain(unref(reportConfig).period, "last-week") : ssrLooseEqual(unref(reportConfig).period, "last-week")) ? " selected" : ""}>Last Week</option><option value="this-month"${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).period) ? ssrLooseContain(unref(reportConfig).period, "this-month") : ssrLooseEqual(unref(reportConfig).period, "this-month")) ? " selected" : ""}>This Month</option><option value="last-month"${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).period) ? ssrLooseContain(unref(reportConfig).period, "last-month") : ssrLooseEqual(unref(reportConfig).period, "last-month")) ? " selected" : ""}>Last Month</option><option value="last-30-days"${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).period) ? ssrLooseContain(unref(reportConfig).period, "last-30-days") : ssrLooseEqual(unref(reportConfig).period, "last-30-days")) ? " selected" : ""}>Last 30 Days</option><option value="last-90-days"${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).period) ? ssrLooseContain(unref(reportConfig).period, "last-90-days") : ssrLooseEqual(unref(reportConfig).period, "last-90-days")) ? " selected" : ""}>Last 90 Days</option><option value="custom"${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).period) ? ssrLooseContain(unref(reportConfig).period, "custom") : ssrLooseEqual(unref(reportConfig).period, "custom")) ? " selected" : ""}>Custom Range</option></select></div>`);
        if (unref(reportConfig).period === "custom") {
          _push(`<div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-white/80 mb-2"> Start Date </label><input${ssrRenderAttr("value", unref(reportConfig).startDate)} type="date" class="w-full border border-white/20 bg-white/10 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500"></div><div><label class="block text-sm font-medium text-white/80 mb-2"> End Date </label><input${ssrRenderAttr("value", unref(reportConfig).endDate)} type="date" class="w-full border border-white/20 bg-white/10 text-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500"></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="space-y-3"><label class="block text-sm font-medium text-white/80 mb-2"> Report Options </label><label class="flex items-center space-x-3 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).includeAI) ? ssrLooseContain(unref(reportConfig).includeAI, null) : unref(reportConfig).includeAI) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-ontop-coral-500 border-white/20 bg-white/10 rounded focus:ring-ontop-coral-500"><div class="flex-1"><span class="text-sm font-medium text-white"> Include AI-Powered Insights </span><p class="text-xs text-white/60"> Recurring patterns, recommendations, and trends </p></div></label><label class="flex items-center space-x-3 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).includeManager) ? ssrLooseContain(unref(reportConfig).includeManager, null) : unref(reportConfig).includeManager) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-ontop-coral-500 border-white/20 bg-white/10 rounded focus:ring-ontop-coral-500"><div class="flex-1"><span class="text-sm font-medium text-white"> Include Manager Performance </span><p class="text-xs text-white/60"> Breakdown by account manager </p></div></label><label class="flex items-center space-x-3 cursor-pointer"><input${ssrIncludeBooleanAttr(Array.isArray(unref(reportConfig).includeAccounts) ? ssrLooseContain(unref(reportConfig).includeAccounts, null) : unref(reportConfig).includeAccounts) ? " checked" : ""} type="checkbox" class="w-4 h-4 text-ontop-coral-500 border-white/20 bg-white/10 rounded focus:ring-ontop-coral-500"><div class="flex-1"><span class="text-sm font-medium text-white"> Include Top Accounts Analysis </span><p class="text-xs text-white/60"> Most active accounts and their sentiment </p></div></label></div><div class="bg-white/5 border border-white/10 rounded-lg p-4"><div class="flex items-start"><svg class="w-5 h-5 text-white mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><div class="flex-1"><p class="text-sm text-white font-medium"> Report will analyze feedback from ${ssrInterpolate(getDateRangePreview())}</p>`);
        if (unref(reportConfig).includeAI) {
          _push(`<p class="text-xs text-white mt-1"> AI analysis may take 10-20 seconds </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div><div class="bg-white/5 px-6 py-4 flex justify-end space-x-3"><button class="px-4 py-2 border border-white/10 rounded-md text-sm font-medium text-white hover:bg-white/5 transition-colors"> Cancel </button><button${ssrIncludeBooleanAttr(unref(generating)) ? " disabled" : ""} class="px-6 py-2 bg-gradient-cta hover:bg-gradient-cta-hover text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center">`);
        if (!unref(generating)) {
          _push(`<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`);
        } else {
          _push(`<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>`);
        }
        _push(` ${ssrInterpolate(unref(generating) ? "Generating..." : "Generate Report")}</button></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showReportDisplay)) {
        _push(ssrRenderComponent(_component_ReportDisplayModal, {
          reportHTML: unref(currentReportHTML),
          onClose: ($event) => showReportDisplay.value = false
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reports.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reports-ClJaHZAL.mjs.map
