import { defineComponent, ref, resolveComponent, mergeProps, withCtx, createTextVNode, createVNode, createBlock, openBlock, unref, Fragment, renderList, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "analytics",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Advanced Analytics - Ontop Feedback Analytics",
      meta: [
        { name: "description", content: "Advanced analytics and insights for customer feedback data" }
      ]
    });
    const topPerformingAccounts = ref([
      { name: "Gallant Luxury Service", satisfaction: 98, feedback_count: 45 },
      { name: "Somerville YMCA", satisfaction: 95, feedback_count: 32 },
      { name: "Kirafin.ai", satisfaction: 92, feedback_count: 28 },
      { name: "Pagos Asap", satisfaction: 89, feedback_count: 23 }
    ]);
    const riskAccounts = ref([
      { name: "NUBIRAL COL S.A.S", risk_score: 75, risk_reason: "Declining sentiment" },
      { name: "Tech Solutions Inc", risk_score: 68, risk_reason: "Low response rate" },
      { name: "Global Services Ltd", risk_score: 62, risk_reason: "Negative feedback spike" }
    ]);
    const trendingTopics = ref([
      { name: "Platform Usability", mentions: 234, trend: "up", change: 12 },
      { name: "Payment Processing", mentions: 189, trend: "up", change: 8 },
      { name: "Customer Support", mentions: 156, trend: "down", change: -5 },
      { name: "Integration Issues", mentions: 98, trend: "up", change: 15 }
    ]);
    const aiInsights = ref([
      {
        id: 1,
        type: "positive",
        title: "Positive Sentiment Spike",
        description: "Customer satisfaction increased by 15% after recent platform updates",
        confidence: 92
      },
      {
        id: 2,
        type: "warning",
        title: "Topic Shift Detected",
        description: 'Increasing mentions of "integration challenges" - worth monitoring',
        confidence: 87
      },
      {
        id: 3,
        type: "alert",
        title: "Account Risk Alert",
        description: "NUBIRAL COL S.A.S showing declining engagement patterns",
        confidence: 94
      }
    ]);
    const recommendations = ref([
      {
        id: 1,
        priority: "high",
        title: "Proactive Account Management",
        description: "Reach out to at-risk accounts within 48 hours",
        impact: "Reduce churn by 25%"
      },
      {
        id: 2,
        priority: "medium",
        title: "Feature Enhancement",
        description: "Address top integration pain points mentioned in feedback",
        impact: "Improve satisfaction by 10%"
      },
      {
        id: 3,
        priority: "low",
        title: "Documentation Update",
        description: "Create guides for frequently asked questions",
        impact: "Reduce support tickets by 15%"
      }
    ]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppButton = resolveComponent("AppButton");
      const _component_AppCard = resolveComponent("AppCard");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-transparent" }, _attrs))}><header class="bg-white/5 backdrop-blur-xl border-b border-white/10"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center py-6"><div><h1 class="text-3xl font-bold text-white"> Advanced Analytics </h1><p class="mt-2 text-white/80"> Deep insights and trend analysis </p></div><div class="flex space-x-3"><select class="bg-white/10 text-white placeholder-gray-300 border border-white/20 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ontop-pink-400"><option>Last 30 days</option><option>Last 90 days</option><option>Last 6 months</option><option>Last year</option></select>`);
      _push(ssrRenderComponent(_component_AppButton, {
        variant: "primary",
        size: "md"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Export Report`);
          } else {
            return [
              createTextVNode("Export Report")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></header><main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">`);
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><div class="flex items-center"${_scopeId}><div class="flex-shrink-0"${_scopeId}><div class="w-8 h-8 bg-ontop-purple-600 rounded-md flex items-center justify-center"${_scopeId}><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"${_scopeId}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1"${_scopeId}><dl${_scopeId}><dt class="text-sm font-medium text-white truncate"${_scopeId}>Avg Sentiment Score</dt><dd class="flex items-baseline"${_scopeId}><div class="text-2xl font-semibold text-white"${_scopeId}>7.2</div><div class="ml-2 text-sm font-medium text-green-400"${_scopeId}>/10</div></dd></dl></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("div", { class: "flex items-center" }, [
                  createVNode("div", { class: "flex-shrink-0" }, [
                    createVNode("div", { class: "w-8 h-8 bg-ontop-purple-600 rounded-md flex items-center justify-center" }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-5 h-5 text-white",
                        fill: "currentColor",
                        viewBox: "0 0 20 20"
                      }, [
                        createVNode("path", { d: "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" })
                      ]))
                    ])
                  ]),
                  createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                    createVNode("dl", null, [
                      createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Avg Sentiment Score"),
                      createVNode("dd", { class: "flex items-baseline" }, [
                        createVNode("div", { class: "text-2xl font-semibold text-white" }, "7.2"),
                        createVNode("div", { class: "ml-2 text-sm font-medium text-green-400" }, "/10")
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
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><div class="flex items-center"${_scopeId}><div class="flex-shrink-0"${_scopeId}><div class="w-8 h-8 bg-ontop-purple-700 rounded-md flex items-center justify-center"${_scopeId}><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"${_scopeId}><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1"${_scopeId}><dl${_scopeId}><dt class="text-sm font-medium text-white truncate"${_scopeId}>Response Rate</dt><dd class="flex items-baseline"${_scopeId}><div class="text-2xl font-semibold text-white"${_scopeId}>84%</div><div class="ml-2 text-sm font-medium text-green-400"${_scopeId}>+2.1%</div></dd></dl></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("div", { class: "flex items-center" }, [
                  createVNode("div", { class: "flex-shrink-0" }, [
                    createVNode("div", { class: "w-8 h-8 bg-ontop-purple-700 rounded-md flex items-center justify-center" }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-5 h-5 text-white",
                        fill: "currentColor",
                        viewBox: "0 0 20 20"
                      }, [
                        createVNode("path", {
                          "fill-rule": "evenodd",
                          d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                          "clip-rule": "evenodd"
                        })
                      ]))
                    ])
                  ]),
                  createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                    createVNode("dl", null, [
                      createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Response Rate"),
                      createVNode("dd", { class: "flex items-baseline" }, [
                        createVNode("div", { class: "text-2xl font-semibold text-white" }, "84%"),
                        createVNode("div", { class: "ml-2 text-sm font-medium text-green-400" }, "+2.1%")
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
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><div class="flex items-center"${_scopeId}><div class="flex-shrink-0"${_scopeId}><div class="w-8 h-8 bg-ontop-pink-500 rounded-md flex items-center justify-center"${_scopeId}><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"${_scopeId}><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1"${_scopeId}><dl${_scopeId}><dt class="text-sm font-medium text-white truncate"${_scopeId}>Account Satisfaction</dt><dd class="flex items-baseline"${_scopeId}><div class="text-2xl font-semibold text-white"${_scopeId}>92%</div><div class="ml-2 text-sm font-medium text-green-400"${_scopeId}>+5.2%</div></dd></dl></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("div", { class: "flex items-center" }, [
                  createVNode("div", { class: "flex-shrink-0" }, [
                    createVNode("div", { class: "w-8 h-8 bg-ontop-pink-500 rounded-md flex items-center justify-center" }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-5 h-5 text-white",
                        fill: "currentColor",
                        viewBox: "0 0 20 20"
                      }, [
                        createVNode("path", {
                          "fill-rule": "evenodd",
                          d: "M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z",
                          "clip-rule": "evenodd"
                        })
                      ]))
                    ])
                  ]),
                  createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                    createVNode("dl", null, [
                      createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Account Satisfaction"),
                      createVNode("dd", { class: "flex items-baseline" }, [
                        createVNode("div", { class: "text-2xl font-semibold text-white" }, "92%"),
                        createVNode("div", { class: "ml-2 text-sm font-medium text-green-400" }, "+5.2%")
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
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><div class="flex items-center"${_scopeId}><div class="flex-shrink-0"${_scopeId}><div class="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center"${_scopeId}><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"${_scopeId}><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1"${_scopeId}><dl${_scopeId}><dt class="text-sm font-medium text-white truncate"${_scopeId}>At-Risk Accounts</dt><dd class="flex items-baseline"${_scopeId}><div class="text-2xl font-semibold text-white"${_scopeId}>3</div><div class="ml-2 text-sm font-medium text-red-400"${_scopeId}>+1</div></dd></dl></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("div", { class: "flex items-center" }, [
                  createVNode("div", { class: "flex-shrink-0" }, [
                    createVNode("div", { class: "w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center" }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-5 h-5 text-white",
                        fill: "currentColor",
                        viewBox: "0 0 20 20"
                      }, [
                        createVNode("path", {
                          "fill-rule": "evenodd",
                          d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
                          "clip-rule": "evenodd"
                        })
                      ]))
                    ])
                  ]),
                  createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                    createVNode("dl", null, [
                      createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "At-Risk Accounts"),
                      createVNode("dd", { class: "flex items-baseline" }, [
                        createVNode("div", { class: "text-2xl font-semibold text-white" }, "3"),
                        createVNode("div", { class: "ml-2 text-sm font-medium text-red-400" }, "+1")
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
      _push(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">`);
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><h3 class="text-lg font-medium text-white mb-4"${_scopeId}>Sentiment Trends</h3><div class="h-64 flex items-center justify-center text-white/50"${_scopeId}><div class="text-center"${_scopeId}><svg class="mx-auto h-12 w-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"${_scopeId}></path></svg><h3 class="mt-2 text-sm font-medium text-white"${_scopeId}>Time Series Analysis</h3><p class="mt-1 text-sm text-white/70"${_scopeId}>Sentiment evolution over time</p></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Sentiment Trends"),
                createVNode("div", { class: "h-64 flex items-center justify-center text-white/50" }, [
                  createVNode("div", { class: "text-center" }, [
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
                        d: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      })
                    ])),
                    createVNode("h3", { class: "mt-2 text-sm font-medium text-white" }, "Time Series Analysis"),
                    createVNode("p", { class: "mt-1 text-sm text-white/70" }, "Sentiment evolution over time")
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><h3 class="text-lg font-medium text-white mb-4"${_scopeId}>Topic Distribution</h3><div class="h-64 flex items-center justify-center text-white/50"${_scopeId}><div class="text-center"${_scopeId}><svg class="mx-auto h-12 w-12 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"${_scopeId}></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"${_scopeId}></path></svg><h3 class="mt-2 text-sm font-medium text-white"${_scopeId}>Topic Modeling</h3><p class="mt-1 text-sm text-white/70"${_scopeId}>Key themes and categories</p></div></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Topic Distribution"),
                createVNode("div", { class: "h-64 flex items-center justify-center text-white/50" }, [
                  createVNode("div", { class: "text-center" }, [
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
                        d: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                      }),
                      createVNode("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                      })
                    ])),
                    createVNode("h3", { class: "mt-2 text-sm font-medium text-white" }, "Topic Modeling"),
                    createVNode("p", { class: "mt-1 text-sm text-white/70" }, "Key themes and categories")
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">`);
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><h3 class="text-lg font-medium text-white mb-4"${_scopeId}>Top Performing Accounts</h3><div class="space-y-4"${_scopeId}><!--[-->`);
            ssrRenderList(unref(topPerformingAccounts), (account) => {
              _push2(`<div class="flex items-center justify-between"${_scopeId}><div class="flex items-center space-x-3"${_scopeId}><div class="flex-shrink-0 h-8 w-8 bg-white/10 rounded-full flex items-center justify-center"${_scopeId}><span class="text-xs font-medium text-white"${_scopeId}>${ssrInterpolate(account.name.charAt(0))}</span></div><div${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>${ssrInterpolate(account.name)}</p><p class="text-xs text-white"${_scopeId}>${ssrInterpolate(account.feedback_count)} feedback</p></div></div><div class="text-right"${_scopeId}><p class="text-sm font-medium text-green-400"${_scopeId}>${ssrInterpolate(account.satisfaction)}%</p><p class="text-xs text-white"${_scopeId}>satisfaction</p></div></div>`);
            });
            _push2(`<!--]--></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Top Performing Accounts"),
                createVNode("div", { class: "space-y-4" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(topPerformingAccounts), (account) => {
                    return openBlock(), createBlock("div", {
                      key: account.name,
                      class: "flex items-center justify-between"
                    }, [
                      createVNode("div", { class: "flex items-center space-x-3" }, [
                        createVNode("div", { class: "flex-shrink-0 h-8 w-8 bg-white/10 rounded-full flex items-center justify-center" }, [
                          createVNode("span", { class: "text-xs font-medium text-white" }, toDisplayString(account.name.charAt(0)), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("p", { class: "text-sm font-medium text-white" }, toDisplayString(account.name), 1),
                          createVNode("p", { class: "text-xs text-white" }, toDisplayString(account.feedback_count) + " feedback", 1)
                        ])
                      ]),
                      createVNode("div", { class: "text-right" }, [
                        createVNode("p", { class: "text-sm font-medium text-green-400" }, toDisplayString(account.satisfaction) + "%", 1),
                        createVNode("p", { class: "text-xs text-white" }, "satisfaction")
                      ])
                    ]);
                  }), 128))
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><h3 class="text-lg font-medium text-white mb-4"${_scopeId}>At-Risk Accounts</h3><div class="space-y-4"${_scopeId}><!--[-->`);
            ssrRenderList(unref(riskAccounts), (account) => {
              _push2(`<div class="flex items-center justify-between"${_scopeId}><div class="flex items-center space-x-3"${_scopeId}><div class="flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center"${_scopeId}><span class="text-xs font-medium text-red-800"${_scopeId}>${ssrInterpolate(account.name.charAt(0))}</span></div><div${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>${ssrInterpolate(account.name)}</p><p class="text-xs text-white/60"${_scopeId}>${ssrInterpolate(account.risk_reason)}</p></div></div><div class="text-right"${_scopeId}><p class="text-sm font-medium text-red-600"${_scopeId}>${ssrInterpolate(account.risk_score)}%</p><p class="text-xs text-white"${_scopeId}>risk</p></div></div>`);
            });
            _push2(`<!--]--></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "At-Risk Accounts"),
                createVNode("div", { class: "space-y-4" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(riskAccounts), (account) => {
                    return openBlock(), createBlock("div", {
                      key: account.name,
                      class: "flex items-center justify-between"
                    }, [
                      createVNode("div", { class: "flex items-center space-x-3" }, [
                        createVNode("div", { class: "flex-shrink-0 h-8 w-8 bg-red-100 rounded-full flex items-center justify-center" }, [
                          createVNode("span", { class: "text-xs font-medium text-red-800" }, toDisplayString(account.name.charAt(0)), 1)
                        ]),
                        createVNode("div", null, [
                          createVNode("p", { class: "text-sm font-medium text-white" }, toDisplayString(account.name), 1),
                          createVNode("p", { class: "text-xs text-white/60" }, toDisplayString(account.risk_reason), 1)
                        ])
                      ]),
                      createVNode("div", { class: "text-right" }, [
                        createVNode("p", { class: "text-sm font-medium text-red-600" }, toDisplayString(account.risk_score) + "%", 1),
                        createVNode("p", { class: "text-xs text-white" }, "risk")
                      ])
                    ]);
                  }), 128))
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><h3 class="text-lg font-medium text-white mb-4"${_scopeId}>Trending Topics</h3><div class="space-y-4"${_scopeId}><!--[-->`);
            ssrRenderList(unref(trendingTopics), (topic) => {
              _push2(`<div class="flex items-center justify-between"${_scopeId}><div${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>${ssrInterpolate(topic.name)}</p><p class="text-xs text-white"${_scopeId}>${ssrInterpolate(topic.mentions)} mentions</p></div><div class="flex items-center space-x-2"${_scopeId}><div class="flex items-center"${_scopeId}>`);
              if (topic.trend === "up") {
                _push2(`<svg class="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"${_scopeId}><path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd"${_scopeId}></path></svg>`);
              } else {
                _push2(`<svg class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"${_scopeId}><path fill-rule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clip-rule="evenodd"${_scopeId}></path></svg>`);
              }
              _push2(`<span class="${ssrRenderClass([topic.trend === "up" ? "text-green-600" : "text-red-600", "text-xs font-medium"])}"${_scopeId}>${ssrInterpolate(topic.change)}% </span></div></div></div>`);
            });
            _push2(`<!--]--></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Trending Topics"),
                createVNode("div", { class: "space-y-4" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(trendingTopics), (topic) => {
                    return openBlock(), createBlock("div", {
                      key: topic.name,
                      class: "flex items-center justify-between"
                    }, [
                      createVNode("div", null, [
                        createVNode("p", { class: "text-sm font-medium text-white" }, toDisplayString(topic.name), 1),
                        createVNode("p", { class: "text-xs text-white" }, toDisplayString(topic.mentions) + " mentions", 1)
                      ]),
                      createVNode("div", { class: "flex items-center space-x-2" }, [
                        createVNode("div", { class: "flex items-center" }, [
                          topic.trend === "up" ? (openBlock(), createBlock("svg", {
                            key: 0,
                            class: "h-4 w-4 text-green-500",
                            fill: "currentColor",
                            viewBox: "0 0 20 20"
                          }, [
                            createVNode("path", {
                              "fill-rule": "evenodd",
                              d: "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z",
                              "clip-rule": "evenodd"
                            })
                          ])) : (openBlock(), createBlock("svg", {
                            key: 1,
                            class: "h-4 w-4 text-red-500",
                            fill: "currentColor",
                            viewBox: "0 0 20 20"
                          }, [
                            createVNode("path", {
                              "fill-rule": "evenodd",
                              d: "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z",
                              "clip-rule": "evenodd"
                            })
                          ])),
                          createVNode("span", {
                            class: ["text-xs font-medium", topic.trend === "up" ? "text-green-600" : "text-red-600"]
                          }, toDisplayString(topic.change) + "% ", 3)
                        ])
                      ])
                    ]);
                  }), 128))
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6">`);
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><h3 class="text-lg font-medium text-white mb-4"${_scopeId}>AI-Powered Insights</h3><div class="space-y-4"${_scopeId}><!--[-->`);
            ssrRenderList(unref(aiInsights), (insight) => {
              _push2(`<div class="${ssrRenderClass([{
                "border-green-400": insight.type === "positive",
                "border-yellow-400": insight.type === "warning",
                "border-red-400": insight.type === "alert"
              }, "border-l-4 pl-4 py-2"])}"${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>${ssrInterpolate(insight.title)}</p><p class="text-xs text-white/80 mt-1"${_scopeId}>${ssrInterpolate(insight.description)}</p><p class="text-xs text-white/60 mt-2"${_scopeId}>Confidence: ${ssrInterpolate(insight.confidence)}%</p></div>`);
            });
            _push2(`<!--]--></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "AI-Powered Insights"),
                createVNode("div", { class: "space-y-4" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(aiInsights), (insight) => {
                    return openBlock(), createBlock("div", {
                      key: insight.id,
                      class: ["border-l-4 pl-4 py-2", {
                        "border-green-400": insight.type === "positive",
                        "border-yellow-400": insight.type === "warning",
                        "border-red-400": insight.type === "alert"
                      }]
                    }, [
                      createVNode("p", { class: "text-sm font-medium text-white" }, toDisplayString(insight.title), 1),
                      createVNode("p", { class: "text-xs text-white/80 mt-1" }, toDisplayString(insight.description), 1),
                      createVNode("p", { class: "text-xs text-white/60 mt-2" }, "Confidence: " + toDisplayString(insight.confidence) + "%", 1)
                    ], 2);
                  }), 128))
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AppCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="p-6"${_scopeId}><h3 class="text-lg font-medium text-white mb-4"${_scopeId}>Recommended Actions</h3><div class="space-y-4"${_scopeId}><!--[-->`);
            ssrRenderList(unref(recommendations), (recommendation) => {
              _push2(`<div class="flex items-start space-x-3"${_scopeId}><div class="flex-shrink-0"${_scopeId}><div class="${ssrRenderClass([{
                "bg-red-100": recommendation.priority === "high",
                "bg-yellow-100": recommendation.priority === "medium",
                "bg-green-100": recommendation.priority === "low"
              }, "w-6 h-6 rounded-full flex items-center justify-center"])}"${_scopeId}><div class="${ssrRenderClass([{
                "bg-red-500": recommendation.priority === "high",
                "bg-yellow-500": recommendation.priority === "medium",
                "bg-green-500": recommendation.priority === "low"
              }, "w-2 h-2 rounded-full"])}"${_scopeId}></div></div></div><div class="flex-1"${_scopeId}><p class="text-sm font-medium text-white"${_scopeId}>${ssrInterpolate(recommendation.title)}</p><p class="text-xs text-white/80 mt-1"${_scopeId}>${ssrInterpolate(recommendation.description)}</p><p class="text-xs text-white/60 mt-2"${_scopeId}>Expected impact: ${ssrInterpolate(recommendation.impact)}</p></div></div>`);
            });
            _push2(`<!--]--></div></div>`);
          } else {
            return [
              createVNode("div", { class: "p-6" }, [
                createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Recommended Actions"),
                createVNode("div", { class: "space-y-4" }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(recommendations), (recommendation) => {
                    return openBlock(), createBlock("div", {
                      key: recommendation.id,
                      class: "flex items-start space-x-3"
                    }, [
                      createVNode("div", { class: "flex-shrink-0" }, [
                        createVNode("div", {
                          class: ["w-6 h-6 rounded-full flex items-center justify-center", {
                            "bg-red-100": recommendation.priority === "high",
                            "bg-yellow-100": recommendation.priority === "medium",
                            "bg-green-100": recommendation.priority === "low"
                          }]
                        }, [
                          createVNode("div", {
                            class: ["w-2 h-2 rounded-full", {
                              "bg-red-500": recommendation.priority === "high",
                              "bg-yellow-500": recommendation.priority === "medium",
                              "bg-green-500": recommendation.priority === "low"
                            }]
                          }, null, 2)
                        ], 2)
                      ]),
                      createVNode("div", { class: "flex-1" }, [
                        createVNode("p", { class: "text-sm font-medium text-white" }, toDisplayString(recommendation.title), 1),
                        createVNode("p", { class: "text-xs text-white/80 mt-1" }, toDisplayString(recommendation.description), 1),
                        createVNode("p", { class: "text-xs text-white/60 mt-2" }, "Expected impact: " + toDisplayString(recommendation.impact), 1)
                      ])
                    ]);
                  }), 128))
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></main></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/analytics.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=analytics-CHYEHwCL.mjs.map
