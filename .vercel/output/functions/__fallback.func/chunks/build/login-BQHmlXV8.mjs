import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Login - Ontop Feedback Analytics",
      meta: [
        { name: "description", content: "Secure login to access Ontop feedback analytics dashboard" }
      ]
    });
    const password = ref("");
    const loading = ref(false);
    const error = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" }, _attrs))}><div class="max-w-md w-full space-y-8"><div><div class="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-ontop-hero"><svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div><h2 class="mt-6 text-center text-3xl font-extrabold text-white"> Ontop Feedback Analytics </h2><p class="mt-2 text-center text-sm text-white/70"> Enter password to access the dashboard </p></div><form class="mt-8 space-y-6"><div class="rounded-md shadow-sm -space-y-px"><div><label for="password" class="sr-only">Password</label><input id="password"${ssrRenderAttr("value", unref(password))} name="password" type="password" required class="appearance-none rounded-lg relative block w-full px-3 py-3 border border-white/10 bg-white/5 placeholder-white text-white focus:outline-none focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 focus:z-10 sm:text-sm" placeholder="Enter password"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}></div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-md bg-red-50 p-4"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></div><div class="ml-3"><p class="text-sm text-red-800">${ssrInterpolate(unref(error))}</p></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div><button type="submit"${ssrIncludeBooleanAttr(unref(loading) || !unref(password)) ? " disabled" : ""} class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-cta hover:bg-gradient-cta-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ontop-coral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"><span class="absolute left-0 inset-y-0 flex items-center pl-3">`);
      if (!unref(loading)) {
        _push(`<svg class="h-5 w-5 text-white/70 group-hover:text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>`);
      } else {
        _push(`<svg class="animate-spin h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
      }
      _push(`</span> ${ssrInterpolate(unref(loading) ? "Signing in..." : "Sign in")}</button></div><div class="text-center"><p class="text-xs text-white"> Secure access to Ontop&#39;s feedback analytics dashboard </p></div></form></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-BQHmlXV8.mjs.map
