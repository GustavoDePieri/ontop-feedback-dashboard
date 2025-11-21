import { _ as __nuxt_component_0 } from './nuxt-link-DirVq4_Y.mjs';
import { ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
import { u as useHead } from './composables-BNSvOOTx.mjs';
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

const _sfc_main = {
  __name: "test",
  __ssrInlineRender: true,
  setup(__props) {
    const testing = ref(false);
    const fetching = ref(false);
    const testingDiio = ref(false);
    const testResult = ref(null);
    const dataResult = ref(null);
    const diioResult = ref(null);
    useHead({
      title: "Debug Page - Ontop Feedback Analytics"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 p-8" }, _attrs))}><div class="max-w-4xl mx-auto"><h1 class="text-3xl font-bold text-gray-900 mb-8">🔧 Debug Dashboard</h1><div class="bg-white rounded-lg shadow p-6 mb-6"><h2 class="text-xl font-semibold mb-4">API Connection Test</h2><div class="space-y-4"><button${ssrIncludeBooleanAttr(unref(testing)) ? " disabled" : ""} class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">${ssrInterpolate(unref(testing) ? "Testing..." : "Test Google Sheets Connection")}</button>`);
      if (unref(testResult)) {
        _push(`<div class="${ssrRenderClass([{
          "bg-green-50 border border-green-200": unref(testResult).success,
          "bg-red-50 border border-red-200": !unref(testResult).success
        }, "p-4 rounded-lg"])}"><p class="${ssrRenderClass([{
          "text-green-800": unref(testResult).success,
          "text-red-800": !unref(testResult).success
        }, "font-medium"])}">${ssrInterpolate(unref(testResult).message)}</p>`);
        if (unref(testResult).details) {
          _push(`<pre class="mt-2 text-xs text-gray-600 overflow-auto">${ssrInterpolate(JSON.stringify(unref(testResult).details, null, 2))}</pre>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="bg-white rounded-lg shadow p-6 mb-6"><h2 class="text-xl font-semibold mb-4">Data Fetch Test</h2><div class="space-y-4"><button${ssrIncludeBooleanAttr(unref(fetching)) ? " disabled" : ""} class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">${ssrInterpolate(unref(fetching) ? "Fetching..." : "Fetch Feedback Data")}</button>`);
      if (unref(dataResult)) {
        _push(`<div class="${ssrRenderClass([{
          "bg-green-50 border border-green-200": unref(dataResult).success,
          "bg-red-50 border border-red-200": !unref(dataResult).success
        }, "p-4 rounded-lg"])}"><p class="${ssrRenderClass([{
          "text-green-800": unref(dataResult).success,
          "text-red-800": !unref(dataResult).success
        }, "font-medium"])}">${ssrInterpolate(unref(dataResult).message)}</p>`);
        if (unref(dataResult).data && unref(dataResult).data.length > 0) {
          _push(`<div class="mt-4"><p class="text-sm text-gray-600">Found ${ssrInterpolate(unref(dataResult).data.length)} feedback items:</p><div class="mt-2 max-h-40 overflow-auto"><!--[-->`);
          ssrRenderList(unref(dataResult).data.slice(0, 3), (item) => {
            _push(`<div class="text-xs bg-gray-50 p-2 rounded mb-2"><strong>${ssrInterpolate(item.accountName)}</strong>: ${ssrInterpolate(item.feedback.substring(0, 100))}... </div>`);
          });
          _push(`<!--]--></div></div>`);
        } else if (unref(dataResult).error) {
          _push(`<pre class="mt-2 text-xs text-red-600 overflow-auto">${ssrInterpolate(unref(dataResult).error)}</pre>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="bg-white rounded-lg shadow p-6 mb-6"><h2 class="text-xl font-semibold mb-4">🎙️ DIIO Transcript API Test</h2><div class="space-y-4"><button${ssrIncludeBooleanAttr(unref(testingDiio)) ? " disabled" : ""} class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">${ssrInterpolate(unref(testingDiio) ? "Testing..." : "Test DIIO Transcript Access")}</button>`);
      if (unref(diioResult)) {
        _push(`<div class="${ssrRenderClass([{
          "bg-green-50 border border-green-200": unref(diioResult).success,
          "bg-yellow-50 border border-yellow-200": !unref(diioResult).success && unref(diioResult).summary?.authenticationWorks,
          "bg-red-50 border border-red-200": !unref(diioResult).success && !unref(diioResult).summary?.authenticationWorks
        }, "p-4 rounded-lg"])}"><p class="${ssrRenderClass([{
          "text-green-800": unref(diioResult).success,
          "text-yellow-800": !unref(diioResult).success && unref(diioResult).summary?.authenticationWorks,
          "text-red-800": !unref(diioResult).success && !unref(diioResult).summary?.authenticationWorks
        }, "font-medium mb-2"])}">${ssrInterpolate(unref(diioResult).message)}</p>`);
        if (unref(diioResult).summary) {
          _push(`<div class="mt-3 mb-3 p-3 bg-white rounded border"><div class="grid grid-cols-2 gap-2 text-sm"><div><strong>Authentication:</strong><span class="${ssrRenderClass(unref(diioResult).summary.authenticationWorks ? "text-green-600" : "text-red-600")}">${ssrInterpolate(unref(diioResult).summary.authenticationWorks ? "✅ Working" : "❌ Failed")}</span></div><div><strong>Transcript Access:</strong><span class="${ssrRenderClass(unref(diioResult).summary.transcriptAccessWorks ? "text-green-600" : "text-red-600")}">${ssrInterpolate(unref(diioResult).summary.transcriptAccessWorks ? "✅ Working" : "❌ Failed")}</span></div><div><strong>Available Transcripts:</strong><span class="text-blue-600">${ssrInterpolate(unref(diioResult).summary.availableTranscripts)}</span></div><div><strong>Steps Passed:</strong><span class="text-blue-600">${ssrInterpolate(unref(diioResult).summary.successfulSteps)}/${ssrInterpolate(unref(diioResult).summary.totalSteps)}</span></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(diioResult).results && unref(diioResult).results.length > 0) {
          _push(`<div class="mt-4 space-y-2"><p class="text-sm font-semibold text-gray-700">Test Results:</p><!--[-->`);
          ssrRenderList(unref(diioResult).results, (result, index) => {
            _push(`<div class="${ssrRenderClass([{
              "bg-green-50 border-green-200": result.success,
              "bg-red-50 border-red-200": !result.success
            }, "p-3 rounded border text-sm"])}"><div class="flex items-start justify-between"><div class="flex-1"><strong class="text-gray-800">${ssrInterpolate(result.step)}</strong><p class="text-gray-600 mt-1">${ssrInterpolate(result.message)}</p>`);
            if (result.error) {
              _push(`<p class="text-red-600 mt-1 text-xs">Error: ${ssrInterpolate(result.error)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><span class="ml-2 text-lg">${ssrInterpolate(result.success ? "✅" : "❌")}</span></div>`);
            if (result.details) {
              _push(`<pre class="mt-2 text-xs text-gray-500 overflow-auto bg-white p-2 rounded border">${ssrInterpolate(JSON.stringify(result.details, null, 2))}</pre>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else if (unref(diioResult).error) {
          _push(`<pre class="mt-2 text-xs text-red-600 overflow-auto">${ssrInterpolate(unref(diioResult).error)}</pre>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="mt-6">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Go to Dashboard `);
          } else {
            return [
              createTextVNode(" Go to Dashboard ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=test-DgQ9sOMm.mjs.map
