import { u as useAIRecommendations, _ as __nuxt_component_0 } from './useAIRecommendations-DEFGeQJx.mjs';
import { defineComponent, ref, reactive, computed, watch, resolveComponent, mergeProps, unref, withCtx, createVNode, createBlock, openBlock, toDisplayString, createTextVNode, Fragment, renderList, createCommentVNode, readonly, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderStyle, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrRenderComponent } from 'vue/server-renderer';
import { u as useHead } from './composables-BNSvOOTx.mjs';
import { u as useSupabase } from './useSupabase-OiP577xr.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import '@supabase/supabase-js';

const useDarkMode = () => {
  const isDarkMode = ref(false);
  const initializeDarkMode = () => {
  };
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
  };
  watch(isDarkMode, () => {
  });
  const watchSystemTheme = () => {
  };
  return {
    isDarkMode: readonly(isDarkMode),
    toggleDarkMode,
    initializeDarkMode,
    watchSystemTheme
  };
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Dashboard - Ontop Feedback Analytics",
      meta: [
        { name: "description", content: "Real-time feedback analytics dashboard powered by Salesforce data" }
      ]
    });
    const feedbackData = ref([]);
    const loading = ref(false);
    const error = ref("");
    const lastUpdated = ref(null);
    const { isDarkMode } = useDarkMode();
    ref(false);
    const showReportDisplay = ref(false);
    const currentReportData = ref(null);
    const savedReports = ref([]);
    const savedReportsLoading = ref(false);
    const { getSavedReports } = useSupabase();
    const selectedSentiment = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const activeTab = ref("overview");
    const tabs = [
      { id: "overview", label: "Overview", icon: "📊" },
      { id: "trends", label: "Trends & Analytics", icon: "📈" },
      { id: "feedback", label: "Feedback List", icon: "📝" },
      { id: "saved-reports", label: "Saved Reports", icon: "💾" },
      { id: "call-transcripts", label: "Call Transcripts", icon: "🎙️" }
    ];
    const showFilters = ref(false);
    const filters = reactive({
      accountManager: "",
      datePeriod: "",
      startDate: "",
      endDate: "",
      feedbackDirectedTo: "",
      category: "",
      platformClientId: ""
    });
    const calendarDate = ref(/* @__PURE__ */ new Date());
    const selectedDate = ref(null);
    useAIRecommendations();
    const aiSegmentType = ref("all");
    const aiSegmentValue = ref("");
    ref("");
    const generatingAIReport = ref(false);
    const showAIReportDisplay = ref(false);
    const currentAIReportHTML = ref("");
    const aiFilters = reactive({
      accountManager: "",
      datePeriod: "",
      feedbackDirectedTo: "",
      category: "",
      platformClientId: "",
      includeTranscripts: false
    });
    const hasAIFilters = computed(() => {
      return aiFilters.accountManager || aiFilters.datePeriod || aiFilters.feedbackDirectedTo || aiFilters.category || aiFilters.platformClientId;
    });
    const uniqueAccountManagers = computed(() => {
      const managerCounts = /* @__PURE__ */ new Map();
      feedbackData.value.forEach((item) => {
        const manager = item.accountOwner || "Unassigned";
        managerCounts.set(manager, (managerCounts.get(manager) || 0) + 1);
      });
      return Array.from(managerCounts.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([manager, count]) => ({ name: manager, count }));
    });
    const uniqueFeedbackDirections = computed(() => {
      const directionCounts = /* @__PURE__ */ new Map();
      feedbackData.value.forEach((item) => {
        const direction = item.feedbackDirectedTo || "Unspecified";
        directionCounts.set(direction, (directionCounts.get(direction) || 0) + 1);
      });
      return Array.from(directionCounts.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([direction, count]) => ({ name: direction, count }));
    });
    const uniqueCategories = computed(() => {
      const categoryCounts = /* @__PURE__ */ new Map();
      feedbackData.value.forEach((item) => {
        const category = item.categoryFormulaText || item.subcategory || "Uncategorized";
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      });
      return Array.from(categoryCounts.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([category, count]) => ({ name: category, count }));
    });
    const hasActiveFilters = computed(() => {
      return filters.accountManager || filters.datePeriod || filters.feedbackDirectedTo || filters.category || filters.platformClientId;
    });
    const activeFilterCount = computed(() => {
      let count = 0;
      if (filters.accountManager) count++;
      if (filters.datePeriod) count++;
      if (filters.feedbackDirectedTo) count++;
      if (filters.category) count++;
      if (filters.platformClientId) count++;
      return count;
    });
    const filteredFeedbackData = computed(() => {
      let filtered = feedbackData.value;
      if (filters.accountManager) {
        filtered = filtered.filter((item) => {
          const manager = item.accountOwner || "Unassigned";
          return manager === filters.accountManager;
        });
      }
      if (filters.datePeriod) {
        const now = /* @__PURE__ */ new Date();
        let startDate, endDate;
        switch (filters.datePeriod) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
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
            endDate.setHours(23, 59, 59, 999);
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
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
          case "last-month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            break;
          case "last-30-days":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "last-90-days":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 90);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "last-180-days":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 180);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "this-year":
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "custom":
            if (filters.startDate) {
              startDate = new Date(filters.startDate);
              startDate.setHours(0, 0, 0, 0);
            }
            if (filters.endDate) {
              endDate = new Date(filters.endDate);
              endDate.setHours(23, 59, 59, 999);
            }
            break;
        }
        if (startDate || endDate) {
          filtered = filtered.filter((item) => {
            const itemDate = new Date(item.createdDate);
            if (startDate && endDate) {
              return itemDate >= startDate && itemDate <= endDate;
            } else if (startDate) {
              return itemDate >= startDate;
            } else if (endDate) {
              return itemDate <= endDate;
            }
            return true;
          });
        }
      }
      if (filters.feedbackDirectedTo) {
        filtered = filtered.filter((item) => {
          const direction = item.feedbackDirectedTo || "Unspecified";
          return direction === filters.feedbackDirectedTo;
        });
      }
      if (filters.category) {
        filtered = filtered.filter((item) => {
          const category = item.categoryFormulaText || item.subcategory || "Uncategorized";
          return category === filters.category;
        });
      }
      if (filters.platformClientId) {
        const searchTerm = filters.platformClientId.toLowerCase();
        filtered = filtered.filter((item) => {
          return item.platformClientId.toLowerCase().includes(searchTerm);
        });
      }
      return filtered;
    });
    const sentimentSummary = computed(() => {
      const data = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      if (!data.length) {
        return { positive: 0, neutral: 0, negative: 0, totalItems: 0 };
      }
      const positive = data.filter((item) => item.sentiment === "Positive").length;
      const neutral = data.filter((item) => item.sentiment === "Neutral").length;
      const negative = data.filter((item) => item.sentiment === "Negative").length;
      return {
        positive,
        neutral,
        negative,
        totalItems: data.length
      };
    });
    const sentimentPercentages = computed(() => {
      const total = feedbackData.value.length;
      if (total === 0) return { positive: 0, neutral: 0, negative: 0 };
      return {
        positive: Math.round(sentimentSummary.value.positive / total * 100),
        neutral: Math.round(sentimentSummary.value.neutral / total * 100),
        negative: Math.round(sentimentSummary.value.negative / total * 100)
      };
    });
    computed(() => {
      const total = filteredFeedbackData.value.length;
      if (total === 0) return 0;
      const positive = filteredFeedbackData.value.filter((item) => item.sentiment === "Positive").length;
      return Math.round(positive / total * 100);
    });
    const weeklyGrowth = computed(() => {
      const thisWeek = thisWeekFeedback.value;
      const lastWeek = lastWeekFeedback.value;
      const positiveThisWeek = thisWeek.filter((item) => item.sentiment === "Positive").length;
      const positiveLastWeek = lastWeek.filter((item) => item.sentiment === "Positive").length;
      if (positiveLastWeek === 0) {
        return positiveThisWeek > 0 ? 100 : 0;
      }
      return Math.round((positiveThisWeek - positiveLastWeek) / positiveLastWeek * 100);
    });
    const topKeywords = computed(() => {
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      if (!sourceData.length) return [];
      const wordCount = /* @__PURE__ */ new Map();
      const stopWords = /* @__PURE__ */ new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them"]);
      sourceData.forEach((item) => {
        const words = item.feedback.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((word) => word.length > 3 && !stopWords.has(word));
        words.forEach((word) => {
          wordCount.set(word, (wordCount.get(word) || 0) + 1);
        });
      });
      const sortedWords = Array.from(wordCount.entries()).sort(([, a], [, b]) => b - a).slice(0, 8).map(([word, count]) => ({
        word,
        count,
        percentage: Math.min(100, count / sourceData.length * 100 * 5)
      }));
      return sortedWords;
    });
    const topAccounts = computed(() => {
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      if (!sourceData.length) return [];
      const accountCount = /* @__PURE__ */ new Map();
      sourceData.forEach((item) => {
        const name = item.accountName;
        accountCount.set(name, (accountCount.get(name) || 0) + 1);
      });
      return Array.from(accountCount.entries()).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, count]) => ({ name, count }));
    });
    const dayHeaders = computed(() => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    const currentCalendarMonth = computed(() => {
      return calendarDate.value.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      });
    });
    const feedbackByDate = computed(() => {
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      const dateMap = /* @__PURE__ */ new Map();
      sourceData.forEach((item) => {
        const date = new Date(item.createdDate);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {
            feedback: [],
            sentimentCounts: { positive: 0, neutral: 0, negative: 0 }
          });
        }
        const dayData = dateMap.get(dateKey);
        dayData.feedback.push(item);
        if (item.sentiment === "Positive") {
          dayData.sentimentCounts.positive++;
        } else if (item.sentiment === "Neutral") {
          dayData.sentimentCounts.neutral++;
        } else if (item.sentiment === "Negative") {
          dayData.sentimentCounts.negative++;
        }
      });
      return dateMap;
    });
    const calendarDays = computed(() => {
      const year = calendarDate.value.getFullYear();
      const month = calendarDate.value.getMonth();
      const today = /* @__PURE__ */ new Date();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(firstDay.getDate() - firstDay.getDay());
      const endDate = new Date(lastDay);
      endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
      const days = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        const dayData = feedbackByDate.value.get(dateKey);
        const feedbackCount = dayData ? dayData.feedback.length : 0;
        let dominantSentiment = "neutral";
        if (dayData && feedbackCount > 0) {
          const { positive, negative, neutral } = dayData.sentimentCounts;
          if (positive > negative && positive > neutral) {
            dominantSentiment = "positive";
          } else if (negative > positive && negative > neutral) {
            dominantSentiment = "negative";
          } else {
            dominantSentiment = "neutral";
          }
        }
        days.push({
          date: new Date(currentDate),
          inCurrentMonth: currentDate.getMonth() === month,
          isToday: currentDate.toDateString() === today.toDateString(),
          isSelected: selectedDate.value && currentDate.toDateString() === selectedDate.value.toDateString(),
          feedbackCount,
          dominantSentiment,
          sentimentCounts: dayData ? dayData.sentimentCounts : { positive: 0, neutral: 0, negative: 0 }
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return days;
    });
    const selectedDateFeedback = computed(() => {
      if (!selectedDate.value) return [];
      const dateKey = `${selectedDate.value.getFullYear()}-${selectedDate.value.getMonth()}-${selectedDate.value.getDate()}`;
      const dayData = feedbackByDate.value.get(dateKey);
      return dayData ? dayData.feedback : [];
    });
    const currentWeekRange = computed(() => {
      const now = /* @__PURE__ */ new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const formatDate2 = (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return `${formatDate2(startOfWeek)} - ${formatDate2(endOfWeek)}, ${now.getFullYear()}`;
    });
    const thisWeekFeedback = computed(() => {
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      if (!sourceData.length) return [];
      const now = /* @__PURE__ */ new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return sourceData.filter((item) => {
        const itemDate = new Date(item.createdDate);
        return itemDate >= startOfWeek;
      });
    });
    const lastWeekFeedback = computed(() => {
      if (!feedbackData.value.length) return [];
      const now = /* @__PURE__ */ new Date();
      const startOfThisWeek = new Date(now);
      startOfThisWeek.setDate(now.getDate() - now.getDay());
      startOfThisWeek.setHours(0, 0, 0, 0);
      const startOfLastWeek = new Date(startOfThisWeek);
      startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
      return feedbackData.value.filter((item) => {
        const itemDate = new Date(item.createdDate);
        return itemDate >= startOfLastWeek && itemDate < startOfThisWeek;
      });
    });
    const weeklyStats = computed(() => {
      const thisWeek = thisWeekFeedback.value;
      const lastWeek = lastWeekFeedback.value;
      const totalFeedback = thisWeek.length;
      const lastWeekTotal = lastWeek.length;
      const positiveCount = thisWeek.filter((item) => item.sentiment === "Positive").length;
      const positivePercentage2 = totalFeedback > 0 ? Math.round(positiveCount / totalFeedback * 100) : 0;
      let totalGrowth = 0;
      if (lastWeekTotal > 0) {
        totalGrowth = Math.round((totalFeedback - lastWeekTotal) / lastWeekTotal * 100);
      } else if (totalFeedback > 0) {
        totalGrowth = 100;
      }
      const dayCount = /* @__PURE__ */ new Map();
      thisWeek.forEach((item) => {
        const day = new Date(item.createdDate).toLocaleDateString("en-US", { weekday: "long" });
        dayCount.set(day, (dayCount.get(day) || 0) + 1);
      });
      const mostActiveDay = Array.from(dayCount.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] || "No activity";
      const weeklyAccountCount = /* @__PURE__ */ new Map();
      thisWeek.forEach((item) => {
        weeklyAccountCount.set(item.accountName, (weeklyAccountCount.get(item.accountName) || 0) + 1);
      });
      const topAccount = Array.from(weeklyAccountCount.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] || "No feedback";
      return {
        totalFeedback,
        lastWeekTotal,
        positiveCount,
        positivePercentage: positivePercentage2,
        totalGrowth,
        mostActiveDay,
        topAccount
      };
    });
    const accountManagerStats = computed(() => {
      if (!thisWeekFeedback.value.length) return [];
      const thisWeekManagerCount = /* @__PURE__ */ new Map();
      const lastWeekManagerCount = /* @__PURE__ */ new Map();
      const managerAccounts = /* @__PURE__ */ new Map();
      thisWeekFeedback.value.forEach((item) => {
        const manager = item.accountOwner || "Unassigned";
        thisWeekManagerCount.set(manager, (thisWeekManagerCount.get(manager) || 0) + 1);
        if (!managerAccounts.has(manager)) {
          managerAccounts.set(manager, /* @__PURE__ */ new Set());
        }
        managerAccounts.get(manager).add(item.accountName);
      });
      lastWeekFeedback.value.forEach((item) => {
        const manager = item.accountOwner || "Unassigned";
        lastWeekManagerCount.set(manager, (lastWeekManagerCount.get(manager) || 0) + 1);
      });
      const maxCount = Math.max(...thisWeekManagerCount.values(), 1);
      return Array.from(thisWeekManagerCount.entries()).sort(([, a], [, b]) => b - a).slice(0, 6).map(([name, feedbackCount]) => {
        const lastWeekCount = lastWeekManagerCount.get(name) || 0;
        let weeklyGrowth2 = 0;
        if (lastWeekCount > 0) {
          weeklyGrowth2 = Math.round((feedbackCount - lastWeekCount) / lastWeekCount * 100);
        } else if (feedbackCount > 0) {
          weeklyGrowth2 = 100;
        }
        return {
          name: name || "Unassigned",
          feedbackCount,
          accounts: managerAccounts.get(name)?.size || 0,
          percentage: feedbackCount / maxCount * 100,
          weeklyGrowth: weeklyGrowth2
        };
      });
    });
    const weeklyTimeline = computed(() => {
      const now = /* @__PURE__ */ new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const timeline = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dayFeedback = feedbackData.value.filter((item) => {
          const itemDate = new Date(item.createdDate);
          return itemDate.toDateString() === date.toDateString();
        });
        timeline.push({
          day: days[i],
          count: dayFeedback.length,
          percentage: 0,
          isToday: date.toDateString() === now.toDateString()
        });
      }
      const maxCount = Math.max(...timeline.map((d) => d.count), 1);
      timeline.forEach((day) => {
        day.percentage = day.count / maxCount * 100;
      });
      return timeline;
    });
    const weeklyInsights = computed(() => {
      const thisWeek = thisWeekFeedback.value;
      const lastWeek = lastWeekFeedback.value;
      const positiveCount = thisWeek.filter((item) => item.sentiment === "Positive").length;
      const totalCount = thisWeek.length;
      const lastWeekCount = lastWeek.length;
      const positiveRate = totalCount > 0 ? Math.round(positiveCount / totalCount * 100) : 0;
      const wins = [];
      const actions = [];
      if (totalCount === 0) {
        if (lastWeekCount === 0) {
          actions.push("No feedback received this week or last week");
          actions.push("Consider reaching out to clients for feedback");
          actions.push("Review feedback collection processes");
        } else {
          actions.push(`Feedback dropped from ${lastWeekCount} last week to 0 this week`);
          actions.push("Urgent: Investigate why feedback collection stopped");
          actions.push("Contact account managers about client engagement");
        }
        wins.push("Opportunity to improve feedback collection strategy");
        return { wins: wins.slice(0, 4), actions: actions.slice(0, 4) };
      }
      if (positiveRate > 80) {
        wins.push(`Excellent sentiment this week: ${positiveRate}% positive feedback`);
      }
      if (totalCount > lastWeekCount && lastWeekCount > 0) {
        wins.push(`Feedback increased by ${totalCount - lastWeekCount} items vs last week`);
      }
      if (totalCount >= 10) {
        wins.push(`Good engagement: ${totalCount} feedback items collected this week`);
      }
      const topManager = accountManagerStats.value[0];
      if (topManager && topManager.feedbackCount > 0) {
        wins.push(`${topManager.name} leading with ${topManager.feedbackCount} feedback entries this week`);
      }
      if (totalCount < lastWeekCount && lastWeekCount > 0) {
        actions.push(`Feedback decreased from ${lastWeekCount} to ${totalCount} this week`);
      }
      if (positiveRate < 70 && totalCount > 0) {
        actions.push(`Address sentiment concerns - only ${positiveRate}% positive feedback`);
      }
      const negativeItems = thisWeek.filter((item) => item.sentiment === "Negative");
      if (negativeItems.length > 0) {
        actions.push(`Follow up on ${negativeItems.length} negative feedback items`);
      }
      if (accountManagerStats.value.length === 0) {
        actions.push("No account manager activity detected this week");
      }
      if (wins.length === 0) {
        wins.push(`Collected ${totalCount} feedback items this week`);
        if (positiveRate >= 50) {
          wins.push(`${positiveRate}% positive sentiment maintained`);
        }
      }
      if (actions.length === 0) {
        actions.push("Continue monitoring sentiment trends");
        actions.push("Maintain current engagement levels");
      }
      return { wins: wins.slice(0, 4), actions: actions.slice(0, 4) };
    });
    const recentFeedback = computed(() => {
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      return sourceData.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).slice(0, 5);
    });
    const todaysFeedback = computed(() => {
      if (!feedbackData.value.length) return [];
      const today = /* @__PURE__ */ new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDay = today.getDate();
      const todaysItems = feedbackData.value.filter((item) => {
        const itemDate = new Date(item.createdDate);
        const itemYear = itemDate.getFullYear();
        const itemMonth = itemDate.getMonth();
        const itemDay = itemDate.getDate();
        return itemYear === todayYear && itemMonth === todayMonth && itemDay === todayDay;
      });
      return todaysItems.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    });
    const filteredFeedback = computed(() => {
      if (!selectedSentiment.value) return [];
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      return sourceData.filter((item) => item.sentiment === selectedSentiment.value).sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
    });
    const totalPages = computed(() => {
      return Math.ceil(filteredFeedback.value.length / itemsPerPage.value);
    });
    const paginatedFeedback = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredFeedback.value.slice(start, end);
    });
    const visiblePages = computed(() => {
      const total = totalPages.value;
      const current = currentPage.value;
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i);
      }
      if (current - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }
      rangeWithDots.push(...range);
      if (current + delta < total - 1) {
        rangeWithDots.push("...", total);
      } else {
        rangeWithDots.push(total);
      }
      return rangeWithDots.filter((page) => page !== "..." && page <= total);
    });
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const showFeedbackBySentiment = (sentiment) => {
      selectedSentiment.value = sentiment;
      currentPage.value = 1;
      activeTab.value = "feedback";
      nextTick(() => {
        const element = (void 0).querySelector("[data-sentiment-filter]");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    };
    const clearFilter = () => {
      selectedSentiment.value = null;
      currentPage.value = 1;
    };
    const loadSavedReports = async () => {
      savedReportsLoading.value = true;
      try {
        const { data, error: error2 } = await getSavedReports();
        if (error2) {
          console.error("Error loading reports:", error2);
          return;
        }
        savedReports.value = data || [];
      } catch (error2) {
        console.error("Error loading reports:", error2);
      } finally {
        savedReportsLoading.value = false;
      }
    };
    const getAIFilteredData = () => {
      let filtered = feedbackData.value;
      if (aiFilters.accountManager) {
        filtered = filtered.filter((item) => {
          const manager = item.accountOwner || "Unassigned";
          return manager === aiFilters.accountManager;
        });
      }
      if (aiFilters.datePeriod) {
        const now = /* @__PURE__ */ new Date();
        let startDate, endDate;
        switch (aiFilters.datePeriod) {
          case "today":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
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
            endDate.setHours(23, 59, 59, 999);
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
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
          case "last-month":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            break;
          case "last-30-days":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "last-90-days":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 90);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "last-180-days":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 180);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
          case "this-year":
            startDate = new Date(now.getFullYear(), 0, 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(now);
            endDate.setHours(23, 59, 59, 999);
            break;
        }
        if (startDate || endDate) {
          filtered = filtered.filter((item) => {
            const itemDate = new Date(item.createdDate);
            if (startDate && endDate) {
              return itemDate >= startDate && itemDate <= endDate;
            } else if (startDate) {
              return itemDate >= startDate;
            } else if (endDate) {
              return itemDate <= endDate;
            }
            return true;
          });
        }
      }
      if (aiFilters.feedbackDirectedTo) {
        filtered = filtered.filter((item) => {
          const direction = item.feedbackDirectedTo || "Unspecified";
          return direction === aiFilters.feedbackDirectedTo;
        });
      }
      if (aiFilters.category) {
        filtered = filtered.filter((item) => {
          const category = item.categoryFormulaText || item.subcategory || "Uncategorized";
          return category === aiFilters.category;
        });
      }
      if (aiFilters.platformClientId) {
        const searchTerm = aiFilters.platformClientId.toLowerCase();
        filtered = filtered.filter((item) => {
          return item.platformClientId.toLowerCase().includes(searchTerm);
        });
      }
      return filtered;
    };
    const getDatePeriodLabel = (period) => {
      const labels = {
        "today": "Today",
        "yesterday": "Yesterday",
        "this-week": "This Week",
        "last-week": "Last Week",
        "this-month": "This Month",
        "last-month": "Last Month",
        "last-30-days": "Last 30 Days",
        "last-90-days": "Last 90 Days",
        "last-180-days": "Last 180 Days",
        "this-year": "This Year",
        "custom": "Custom Range"
      };
      return labels[period] || period;
    };
    const previousMonth = () => {
      const newDate = new Date(calendarDate.value);
      newDate.setMonth(newDate.getMonth() - 1);
      calendarDate.value = newDate;
    };
    const nextMonth = () => {
      const newDate = new Date(calendarDate.value);
      newDate.setMonth(newDate.getMonth() + 1);
      calendarDate.value = newDate;
    };
    const selectCalendarDay = (date) => {
      selectedDate.value = new Date(date);
      nextTick(() => {
        const element = (void 0).querySelector("[data-selected-day-feedback]");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    };
    const clearSelectedDate = () => {
      selectedDate.value = null;
    };
    const formatSelectedDate = (date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    };
    const formatTime = (date) => {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const copyFeedback = async (feedback) => {
      const textToCopy = `Feedback: ${feedback.feedback}
Account: ${feedback.accountName}
Manager: ${feedback.accountOwner || "Unassigned"}
Client ID: ${feedback.platformClientId}
Date: ${formatDate(feedback.createdDate)}
Sentiment: ${feedback.sentiment}`;
      try {
        await (void 0).clipboard.writeText(textToCopy);
        console.log("Feedback copied to clipboard");
      } catch (err) {
        console.error("Failed to copy: ", err);
        const textArea = (void 0).createElement("textarea");
        textArea.value = textToCopy;
        (void 0).body.appendChild(textArea);
        textArea.select();
        (void 0).execCommand("copy");
        (void 0).body.removeChild(textArea);
      }
    };
    const getDominantSentiment = (sentiments) => {
      const { positive, neutral, negative } = sentiments;
      if (positive >= neutral && positive >= negative) return "Positive";
      if (negative >= neutral) return "Negative";
      return "Neutral";
    };
    computed(() => {
      if (aiSegmentType.value === "all") return true;
      return aiSegmentType.value && aiSegmentValue.value;
    });
    const topSubcategories = computed(() => {
      const subcategoryCount = /* @__PURE__ */ new Map();
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      sourceData.forEach((item) => {
        const subcategory = item.subcategory || "Uncategorized";
        subcategoryCount.set(subcategory, (subcategoryCount.get(subcategory) || 0) + 1);
      });
      const total = sourceData.length || 1;
      return Array.from(subcategoryCount.entries()).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round(count / total * 100)
      })).sort((a, b) => b.count - a.count).slice(0, 10);
    });
    const topCategoryFormulas = computed(() => {
      const categoryCount = /* @__PURE__ */ new Map();
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      sourceData.forEach((item) => {
        const category = item.categoryFormulaText || "Unclassified";
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      });
      const total = sourceData.length || 1;
      return Array.from(categoryCount.entries()).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round(count / total * 100)
      })).sort((a, b) => b.count - a.count).slice(0, 10);
    });
    const feedbackDirectedToAnalytics = computed(() => {
      const directedToCount = /* @__PURE__ */ new Map();
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      sourceData.forEach((item) => {
        const directedTo = item.feedbackDirectedTo || "Unspecified";
        if (!directedToCount.has(directedTo)) {
          directedToCount.set(directedTo, {
            total: 0,
            positive: 0,
            neutral: 0,
            negative: 0
          });
        }
        const stats = directedToCount.get(directedTo);
        stats.total++;
        if (item.sentiment === "Positive") stats.positive++;
        else if (item.sentiment === "Neutral") stats.neutral++;
        else if (item.sentiment === "Negative") stats.negative++;
      });
      const total = sourceData.length || 1;
      return Array.from(directedToCount.entries()).map(([name, stats]) => ({
        name,
        ...stats,
        percentage: Math.round(stats.total / total * 100),
        positiveRate: Math.round(stats.positive / (stats.total || 1) * 100)
      })).sort((a, b) => b.total - a.total);
    });
    const feedbackTrendsData = computed(() => {
      const sourceData = hasActiveFilters.value ? filteredFeedbackData.value : feedbackData.value;
      if (!sourceData.length) return [];
      const thirtyDaysAgo = /* @__PURE__ */ new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentData = sourceData.filter((item) => {
        const itemDate = new Date(item.createdDate);
        return itemDate >= thirtyDaysAgo;
      });
      const groupedByDate = recentData.reduce((acc, item) => {
        const date = new Date(item.createdDate).toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = { positive: 0, neutral: 0, negative: 0 };
        }
        if (item.sentiment === "Positive") acc[date].positive++;
        else if (item.sentiment === "Neutral") acc[date].neutral++;
        else acc[date].negative++;
        return acc;
      }, {});
      return Object.entries(groupedByDate).map(([date, sentiments]) => ({
        date,
        ...sentiments
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    const hasFinancialData = computed(() => {
      return feedbackData.value.some((item) => item.realMrrLastMonth || item.lastInvoicedTpv);
    });
    const totalMrr = computed(() => {
      const uniqueAccounts = /* @__PURE__ */ new Map();
      feedbackData.value.forEach((item) => {
        if (item.realMrrLastMonth && item.accountName) {
          uniqueAccounts.set(item.accountName, item.realMrrLastMonth);
        }
      });
      return Array.from(uniqueAccounts.values()).reduce((sum, mrr) => sum + mrr, 0);
    });
    const totalTpv = computed(() => {
      const uniqueAccounts = /* @__PURE__ */ new Map();
      feedbackData.value.forEach((item) => {
        if (item.lastInvoicedTpv && item.accountName) {
          uniqueAccounts.set(item.accountName, item.lastInvoicedTpv);
        }
      });
      return Array.from(uniqueAccounts.values()).reduce((sum, tpv) => sum + tpv, 0);
    });
    const avgMrrPerAccount = computed(() => {
      const accountsWithMrr = /* @__PURE__ */ new Set();
      feedbackData.value.forEach((item) => {
        if (item.realMrrLastMonth && item.accountName) {
          accountsWithMrr.add(item.accountName);
        }
      });
      return accountsWithMrr.size > 0 ? Math.round(totalMrr.value / accountsWithMrr.size) : 0;
    });
    const highValueAccounts = computed(() => {
      const accountMrr = /* @__PURE__ */ new Map();
      feedbackData.value.forEach((item) => {
        if (item.realMrrLastMonth && item.accountName) {
          accountMrr.set(item.accountName, item.realMrrLastMonth);
        }
      });
      const avgMrr = avgMrrPerAccount.value;
      return Array.from(accountMrr.values()).filter((mrr) => mrr > avgMrr).length;
    });
    const topRevenueAccounts = computed(() => {
      const accountStats = /* @__PURE__ */ new Map();
      feedbackData.value.forEach((item) => {
        if (!item.accountName) return;
        if (!accountStats.has(item.accountName)) {
          accountStats.set(item.accountName, {
            name: item.accountName,
            owner: item.accountOwner || "Unassigned",
            mrr: item.realMrrLastMonth || 0,
            tpv: item.lastInvoicedTpv || 0,
            feedbackCount: 0,
            sentiments: { positive: 0, neutral: 0, negative: 0 }
          });
        }
        const account = accountStats.get(item.accountName);
        account.feedbackCount++;
        if (item.sentiment) {
          account.sentiments[item.sentiment.toLowerCase()]++;
        }
      });
      return Array.from(accountStats.values()).filter((account) => account.mrr > 0 || account.tpv > 0).map((account) => ({
        ...account,
        dominantSentiment: getDominantSentiment(account.sentiments)
      })).sort((a, b) => b.mrr + b.tpv - (a.mrr + a.tpv)).slice(0, 10);
    });
    watch(activeTab, (newTab) => {
      if (newTab === "saved-reports") {
        loadSavedReports();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ReportDisplayModal = __nuxt_component_0;
      const _component_AppCard = resolveComponent("AppCard");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gradient-dark transition-all duration-500" }, _attrs))} data-v-9fe621d0><header class="bg-ontop-navy-dark relative overflow-hidden border-b border-white/5" data-v-9fe621d0><div class="absolute inset-0 opacity-10" data-v-9fe621d0><div class="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob" data-v-9fe621d0></div><div class="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" data-v-9fe621d0></div><div class="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000" data-v-9fe621d0></div></div><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" data-v-9fe621d0><div class="flex justify-between items-center py-6" data-v-9fe621d0><div class="flex items-center space-x-4" data-v-9fe621d0><div class="bg-gradient-ontop-hero rounded-xl p-3 shadow-xl" data-v-9fe621d0><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" data-v-9fe621d0></path></svg></div><div data-v-9fe621d0><h1 class="text-2xl font-bold text-white" data-v-9fe621d0> Feedback Analytics </h1><p class="mt-0.5 text-white/70 text-sm" data-v-9fe621d0> Real-time Customer Intelligence </p></div></div><div class="flex items-center space-x-3" data-v-9fe621d0><button${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="bg-gradient-cta hover:bg-gradient-cta-hover text-white font-semibold py-2.5 px-5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed" data-v-9fe621d0><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" data-v-9fe621d0></path></svg><span data-v-9fe621d0>${ssrInterpolate(unref(loading) ? "Loading..." : "Refresh")}</span></button><div class="border-l border-white/10 h-8" data-v-9fe621d0></div><button class="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200" title="Toggle dark mode" data-v-9fe621d0>`);
      if (!unref(isDarkMode)) {
        _push(`<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" data-v-9fe621d0></path></svg>`);
      } else {
        _push(`<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" data-v-9fe621d0></path></svg>`);
      }
      _push(`</button><button class="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200" title="Test connection" data-v-9fe621d0><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" data-v-9fe621d0></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" data-v-9fe621d0></path></svg></button><button class="p-2.5 text-white/60 hover:text-ontop-coral-500 hover:bg-white/10 rounded-lg transition-all duration-200" title="Logout" data-v-9fe621d0><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" data-v-9fe621d0></path></svg></button></div></div></div></header><div class="bg-ontop-navy-light/50 backdrop-blur-xl border-b border-white/5" data-v-9fe621d0><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4" data-v-9fe621d0><div class="flex items-center justify-between" data-v-9fe621d0><button class="flex items-center space-x-3 hover:bg-white/5 rounded-lg px-3 py-2 transition-all duration-200" data-v-9fe621d0><div class="p-2 bg-gradient-ontop-hero rounded-lg shadow-lg" data-v-9fe621d0><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" data-v-9fe621d0></path></svg></div><div class="flex items-center space-x-2" data-v-9fe621d0><h2 class="text-lg font-bold text-white" data-v-9fe621d0>Advanced Filters</h2>`);
      if (unref(activeFilterCount) > 0) {
        _push(`<span class="bg-gradient-cta text-white text-xs font-bold px-2 py-1 rounded-full" data-v-9fe621d0>${ssrInterpolate(unref(activeFilterCount))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<svg class="${ssrRenderClass([{ "rotate-180": unref(showFilters) }, "w-5 h-5 text-white transition-transform duration-200"])}" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-9fe621d0></path></svg></div></button>`);
      if (unref(hasActiveFilters)) {
        _push(`<button class="text-sm font-semibold text-white bg-gradient-cta hover:bg-gradient-cta-hover px-4 py-2 rounded-lg transition-all duration-200" data-v-9fe621d0> ✕ Clear All </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="overflow-hidden" style="${ssrRenderStyle(unref(showFilters) ? null : { display: "none" })}" data-v-9fe621d0><div class="pt-6 pb-2" data-v-9fe621d0><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-v-9fe621d0><div data-v-9fe621d0><label class="block text-sm font-medium text-white/80 mb-2" data-v-9fe621d0>Account Manager</label><select class="w-full border border-white/10 bg-ontop-navy-dark text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" data-v-9fe621d0><option value="" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).accountManager) ? ssrLooseContain(unref(filters).accountManager, "") : ssrLooseEqual(unref(filters).accountManager, "")) ? " selected" : ""}>All Managers</option><!--[-->`);
      ssrRenderList(unref(uniqueAccountManagers), (manager) => {
        _push(`<option${ssrRenderAttr("value", manager.name)} data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).accountManager) ? ssrLooseContain(unref(filters).accountManager, manager.name) : ssrLooseEqual(unref(filters).accountManager, manager.name)) ? " selected" : ""}>${ssrInterpolate(manager.name)} (${ssrInterpolate(manager.count)} feedback${ssrInterpolate(manager.count !== 1 ? "s" : "")}) </option>`);
      });
      _push(`<!--]--></select></div><div data-v-9fe621d0><label class="block text-sm font-medium text-white/80 mb-2" data-v-9fe621d0>Date Period</label><select class="w-full border border-white/10 bg-ontop-navy-dark text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" data-v-9fe621d0><option value="" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "") : ssrLooseEqual(unref(filters).datePeriod, "")) ? " selected" : ""}>All Time</option><option value="today" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "today") : ssrLooseEqual(unref(filters).datePeriod, "today")) ? " selected" : ""}>Today</option><option value="yesterday" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "yesterday") : ssrLooseEqual(unref(filters).datePeriod, "yesterday")) ? " selected" : ""}>Yesterday</option><option value="this-week" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "this-week") : ssrLooseEqual(unref(filters).datePeriod, "this-week")) ? " selected" : ""}>This Week</option><option value="last-week" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "last-week") : ssrLooseEqual(unref(filters).datePeriod, "last-week")) ? " selected" : ""}>Last Week</option><option value="this-month" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "this-month") : ssrLooseEqual(unref(filters).datePeriod, "this-month")) ? " selected" : ""}>This Month</option><option value="last-month" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "last-month") : ssrLooseEqual(unref(filters).datePeriod, "last-month")) ? " selected" : ""}>Last Month</option><option value="last-30-days" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "last-30-days") : ssrLooseEqual(unref(filters).datePeriod, "last-30-days")) ? " selected" : ""}>Last 30 Days</option><option value="last-90-days" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "last-90-days") : ssrLooseEqual(unref(filters).datePeriod, "last-90-days")) ? " selected" : ""}>Last 90 Days</option><option value="last-180-days" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "last-180-days") : ssrLooseEqual(unref(filters).datePeriod, "last-180-days")) ? " selected" : ""}>Last 180 Days</option><option value="this-year" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "this-year") : ssrLooseEqual(unref(filters).datePeriod, "this-year")) ? " selected" : ""}>This Year</option><option value="custom" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).datePeriod) ? ssrLooseContain(unref(filters).datePeriod, "custom") : ssrLooseEqual(unref(filters).datePeriod, "custom")) ? " selected" : ""}>Custom Range</option></select></div>`);
      if (unref(filters).datePeriod === "custom") {
        _push(`<div class="md:col-span-2 lg:col-span-2" data-v-9fe621d0><label class="block text-sm font-medium text-white/80 mb-2" data-v-9fe621d0>Custom Date Range</label><div class="grid grid-cols-2 gap-2" data-v-9fe621d0><input${ssrRenderAttr("value", unref(filters).startDate)} type="date" class="border border-white/10 bg-white/5 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" placeholder="Start Date" data-v-9fe621d0><input${ssrRenderAttr("value", unref(filters).endDate)} type="date" class="border border-white/10 bg-white/5 text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" placeholder="End Date" data-v-9fe621d0></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div data-v-9fe621d0><label class="block text-sm font-medium text-white/80 mb-2" data-v-9fe621d0>Feedback Directed To</label><select class="w-full border border-white/10 bg-ontop-navy-dark text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" data-v-9fe621d0><option value="" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).feedbackDirectedTo) ? ssrLooseContain(unref(filters).feedbackDirectedTo, "") : ssrLooseEqual(unref(filters).feedbackDirectedTo, "")) ? " selected" : ""}>All Teams</option><!--[-->`);
      ssrRenderList(unref(uniqueFeedbackDirections), (team) => {
        _push(`<option${ssrRenderAttr("value", team.name)} data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).feedbackDirectedTo) ? ssrLooseContain(unref(filters).feedbackDirectedTo, team.name) : ssrLooseEqual(unref(filters).feedbackDirectedTo, team.name)) ? " selected" : ""}>${ssrInterpolate(team.name)} (${ssrInterpolate(team.count)} feedback${ssrInterpolate(team.count !== 1 ? "s" : "")}) </option>`);
      });
      _push(`<!--]--></select></div><div data-v-9fe621d0><label class="block text-sm font-medium text-white/80 mb-2" data-v-9fe621d0>Category</label><select class="w-full border border-white/10 bg-ontop-navy-dark text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" data-v-9fe621d0><option value="" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).category) ? ssrLooseContain(unref(filters).category, "") : ssrLooseEqual(unref(filters).category, "")) ? " selected" : ""}>All Categories</option><!--[-->`);
      ssrRenderList(unref(uniqueCategories), (cat) => {
        _push(`<option${ssrRenderAttr("value", cat.name)} data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(filters).category) ? ssrLooseContain(unref(filters).category, cat.name) : ssrLooseEqual(unref(filters).category, cat.name)) ? " selected" : ""}>${ssrInterpolate(cat.name)} (${ssrInterpolate(cat.count)} feedback${ssrInterpolate(cat.count !== 1 ? "s" : "")}) </option>`);
      });
      _push(`<!--]--></select></div><div class="${ssrRenderClass(unref(filters).datePeriod === "custom" ? "" : "md:col-span-2")}" data-v-9fe621d0><label class="block text-sm font-medium text-white/80 mb-2" data-v-9fe621d0>Platform Client ID</label><div class="relative" data-v-9fe621d0><input${ssrRenderAttr("value", unref(filters).platformClientId)} type="text" placeholder="Search by Platform Client ID..." class="w-full border border-white/10 bg-white/5 text-white placeholder-white/40 rounded-lg px-3 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" data-v-9fe621d0><div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" data-v-9fe621d0><svg class="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-9fe621d0></path></svg></div></div></div></div>`);
      if (unref(hasActiveFilters)) {
        _push(`<div class="mt-4 flex flex-wrap gap-2" data-v-9fe621d0><span class="text-sm text-white/70" data-v-9fe621d0>Active filters:</span>`);
        if (unref(filters).accountManager) {
          _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" data-v-9fe621d0> Manager: ${ssrInterpolate(unref(filters).accountManager)} <button class="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100" data-v-9fe621d0>×</button></span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(filters).datePeriod) {
          _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" data-v-9fe621d0> Period: ${ssrInterpolate(getDatePeriodLabel(unref(filters).datePeriod))} <button class="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100" data-v-9fe621d0>×</button></span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(filters).feedbackDirectedTo) {
          _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200" data-v-9fe621d0> Directed To: ${ssrInterpolate(unref(filters).feedbackDirectedTo)} <button class="ml-1 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100" data-v-9fe621d0>×</button></span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(filters).category) {
          _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200" data-v-9fe621d0> Category: ${ssrInterpolate(unref(filters).category)} <button class="ml-1 text-orange-600 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-100" data-v-9fe621d0>×</button></span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(filters).platformClientId) {
          _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200" data-v-9fe621d0> Client ID: ${ssrInterpolate(unref(filters).platformClientId)} <button class="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100" data-v-9fe621d0>×</button></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(hasActiveFilters)) {
        _push(`<div class="mt-3 text-sm text-white" data-v-9fe621d0> Showing ${ssrInterpolate(unref(filteredFeedbackData).length)} of ${ssrInterpolate(unref(feedbackData).length)} feedback items </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div><main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 transition-colors duration-300" data-v-9fe621d0><div class="${ssrRenderClass([{
        "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800": unref(loading),
        "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800": unref(error),
        "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800": !unref(loading) && !unref(error) && unref(feedbackData).length > 0,
        "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800": !unref(loading) && !unref(error) && unref(feedbackData).length === 0
      }, "mb-6 p-4 rounded-lg transition-colors duration-200"])}" data-v-9fe621d0>`);
      if (unref(loading)) {
        _push(`<div class="text-blue-800 dark:text-blue-200" data-v-9fe621d0> 🔄 Loading feedback data... </div>`);
      } else if (unref(error)) {
        _push(`<div class="text-red-800 dark:text-red-200" data-v-9fe621d0> ❌ Error: ${ssrInterpolate(unref(error))}</div>`);
      } else if (unref(feedbackData).length > 0) {
        _push(`<div class="text-green-800 dark:text-green-200" data-v-9fe621d0> ✅ Successfully loaded ${ssrInterpolate(unref(feedbackData).length)} feedback items `);
        if (unref(hasActiveFilters)) {
          _push(`<span class="block text-sm mt-1" data-v-9fe621d0> 📊 ${ssrInterpolate(unref(filteredFeedbackData).length)} items match current filters </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="text-yellow-800 dark:text-yellow-200" data-v-9fe621d0> ⚠️ No feedback data found. Click &quot;Test Connection&quot; to check your Google Sheets connection. </div>`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_ReportDisplayModal, {
        "is-open": unref(showReportDisplay),
        "report-data": unref(currentReportData),
        onClose: ($event) => showReportDisplay.value = false
      }, null, _parent));
      if (unref(feedbackData).length > 0) {
        _push(`<div class="mb-6" data-v-9fe621d0><button class="w-full flex items-center justify-center p-6 bg-gradient-ontop-hero hover:shadow-glow rounded-xl transition-all duration-200 group" data-v-9fe621d0><div class="w-14 h-14 bg-white/20 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform" data-v-9fe621d0><svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" data-v-9fe621d0></path></svg></div><div class="text-left" data-v-9fe621d0><div class="text-2xl font-bold text-white mb-1" data-v-9fe621d0> 🤖 Generate AI Report </div><div class="text-white/80 text-sm" data-v-9fe621d0> Configure filters and get AI-powered insights </div></div><svg class="w-6 h-6 text-white ml-auto opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" data-v-9fe621d0></path></svg></button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(feedbackData).length > 0) {
        _push(`<div class="mb-6" data-v-9fe621d0><div class="border-b border-white/10" data-v-9fe621d0><nav class="flex space-x-1" aria-label="Tabs" data-v-9fe621d0><!--[-->`);
        ssrRenderList(tabs, (tab) => {
          _push(`<button class="${ssrRenderClass([
            "px-6 py-3 text-sm font-semibold rounded-t-lg transition-all duration-200",
            unref(activeTab) === tab.id ? "bg-gradient-ontop-hero text-white shadow-lg" : "text-white/70 hover:text-white hover:bg-white/5"
          ])}" data-v-9fe621d0><span class="flex items-center space-x-2" data-v-9fe621d0><span data-v-9fe621d0>${ssrInterpolate(tab.icon)}</span><span data-v-9fe621d0>${ssrInterpolate(tab.label)}</span></span></button>`);
        });
        _push(`<!--]--></nav></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(feedbackData).length > 0) {
        _push(`<div data-v-9fe621d0><div style="${ssrRenderStyle(unref(activeTab) === "overview" ? null : { display: "none" })}" data-v-9fe621d0>`);
        if (unref(feedbackData).length > 0) {
          _push(`<div class="mb-8" data-v-9fe621d0><div class="mb-6" data-v-9fe621d0><h2 class="text-2xl font-bold text-white" data-v-9fe621d0>Executive Summary</h2><p class="text-white text-sm mt-1" data-v-9fe621d0>Key performance indicators and business metrics</p></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6" data-v-9fe621d0>`);
          _push(ssrRenderComponent(_component_AppCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" data-v-9fe621d0${_scopeId}><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" data-v-9fe621d0${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1" data-v-9fe621d0${_scopeId}><dl data-v-9fe621d0${_scopeId}><dt class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>Total Feedback</dt><dd class="flex items-baseline" data-v-9fe621d0${_scopeId}><div class="text-2xl font-semibold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(feedbackData).length)}</div><div class="ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400" data-v-9fe621d0${_scopeId}><svg class="self-center flex-shrink-0 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20" data-v-9fe621d0${_scopeId}><path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" data-v-9fe621d0${_scopeId}></path></svg><span class="sr-only" data-v-9fe621d0${_scopeId}>Increased by</span> ${ssrInterpolate(unref(weeklyGrowth))}% </div></dd></dl></div></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("div", { class: "flex items-center" }, [
                      createVNode("div", { class: "flex-shrink-0" }, [
                        createVNode("div", { class: "w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center" }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5 text-white",
                            fill: "currentColor",
                            viewBox: "0 0 20 20"
                          }, [
                            createVNode("path", {
                              "fill-rule": "evenodd",
                              d: "M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z",
                              "clip-rule": "evenodd"
                            })
                          ]))
                        ])
                      ]),
                      createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                        createVNode("dl", null, [
                          createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Total Feedback"),
                          createVNode("dd", { class: "flex items-baseline" }, [
                            createVNode("div", { class: "text-2xl font-semibold text-white" }, toDisplayString(unref(feedbackData).length), 1),
                            createVNode("div", { class: "ml-2 flex items-baseline text-sm font-semibold text-green-600 dark:text-green-400" }, [
                              (openBlock(), createBlock("svg", {
                                class: "self-center flex-shrink-0 h-3 w-3 text-green-500",
                                fill: "currentColor",
                                viewBox: "0 0 20 20"
                              }, [
                                createVNode("path", {
                                  "fill-rule": "evenodd",
                                  d: "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z",
                                  "clip-rule": "evenodd"
                                })
                              ])),
                              createVNode("span", { class: "sr-only" }, "Increased by"),
                              createTextVNode(" " + toDisplayString(unref(weeklyGrowth)) + "% ", 1)
                            ])
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
          _push(ssrRenderComponent(_component_AppCard, {
            hover: true,
            class: "cursor-pointer transition-transform hover:scale-105",
            onClick: ($event) => showFeedbackBySentiment("Positive")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" data-v-9fe621d0${_scopeId}><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clip-rule="evenodd" data-v-9fe621d0${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1" data-v-9fe621d0${_scopeId}><dl data-v-9fe621d0${_scopeId}><dt class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>Positive Sentiment</dt><dd class="flex items-baseline" data-v-9fe621d0${_scopeId}><div class="text-2xl font-semibold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentSummary).positive)}</div><div class="ml-2 text-sm font-medium text-white" data-v-9fe621d0${_scopeId}> (${ssrInterpolate(unref(sentimentPercentages).positive)}%) </div></dd></dl></div></div><div class="mt-2" data-v-9fe621d0${_scopeId}><p class="text-xs text-green-600 font-medium" data-v-9fe621d0${_scopeId}>Click to view all positive feedback</p></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("div", { class: "flex items-center" }, [
                      createVNode("div", { class: "flex-shrink-0" }, [
                        createVNode("div", { class: "w-8 h-8 bg-green-500 rounded-md flex items-center justify-center" }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5 text-white",
                            fill: "currentColor",
                            viewBox: "0 0 20 20"
                          }, [
                            createVNode("path", {
                              "fill-rule": "evenodd",
                              d: "M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z",
                              "clip-rule": "evenodd"
                            })
                          ]))
                        ])
                      ]),
                      createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                        createVNode("dl", null, [
                          createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Positive Sentiment"),
                          createVNode("dd", { class: "flex items-baseline" }, [
                            createVNode("div", { class: "text-2xl font-semibold text-white" }, toDisplayString(unref(sentimentSummary).positive), 1),
                            createVNode("div", { class: "ml-2 text-sm font-medium text-white" }, " (" + toDisplayString(unref(sentimentPercentages).positive) + "%) ", 1)
                          ])
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "mt-2" }, [
                      createVNode("p", { class: "text-xs text-green-600 font-medium" }, "Click to view all positive feedback")
                    ])
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_AppCard, {
            hover: true,
            class: "cursor-pointer transition-transform hover:scale-105",
            onClick: ($event) => showFeedbackBySentiment("Neutral")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" data-v-9fe621d0${_scopeId}><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-5 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" data-v-9fe621d0${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1" data-v-9fe621d0${_scopeId}><dl data-v-9fe621d0${_scopeId}><dt class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>Neutral Sentiment</dt><dd class="flex items-baseline" data-v-9fe621d0${_scopeId}><div class="text-2xl font-semibold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentSummary).neutral)}</div><div class="ml-2 text-sm font-medium text-white" data-v-9fe621d0${_scopeId}> (${ssrInterpolate(unref(sentimentPercentages).neutral)}%) </div></dd></dl></div></div><div class="mt-2" data-v-9fe621d0${_scopeId}><p class="text-xs text-yellow-600 font-medium" data-v-9fe621d0${_scopeId}>Click to view all neutral feedback</p></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("div", { class: "flex items-center" }, [
                      createVNode("div", { class: "flex-shrink-0" }, [
                        createVNode("div", { class: "w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center" }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5 text-white",
                            fill: "currentColor",
                            viewBox: "0 0 20 20"
                          }, [
                            createVNode("path", {
                              "fill-rule": "evenodd",
                              d: "M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-5 5a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z",
                              "clip-rule": "evenodd"
                            })
                          ]))
                        ])
                      ]),
                      createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                        createVNode("dl", null, [
                          createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Neutral Sentiment"),
                          createVNode("dd", { class: "flex items-baseline" }, [
                            createVNode("div", { class: "text-2xl font-semibold text-white" }, toDisplayString(unref(sentimentSummary).neutral), 1),
                            createVNode("div", { class: "ml-2 text-sm font-medium text-white" }, " (" + toDisplayString(unref(sentimentPercentages).neutral) + "%) ", 1)
                          ])
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "mt-2" }, [
                      createVNode("p", { class: "text-xs text-yellow-600 font-medium" }, "Click to view all neutral feedback")
                    ])
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_AppCard, {
            hover: true,
            class: "cursor-pointer transition-transform hover:scale-105",
            onClick: ($event) => showFeedbackBySentiment("Negative")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" data-v-9fe621d0${_scopeId}><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 1.414 3 3 0 004.242 0 1 1 0 001.415-1.414 5 5 0 00-7.072 0z" clip-rule="evenodd" data-v-9fe621d0${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1" data-v-9fe621d0${_scopeId}><dl data-v-9fe621d0${_scopeId}><dt class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>Negative Sentiment</dt><dd class="flex items-baseline" data-v-9fe621d0${_scopeId}><div class="text-2xl font-semibold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentSummary).negative)}</div><div class="ml-2 text-sm font-medium text-white" data-v-9fe621d0${_scopeId}> (${ssrInterpolate(unref(sentimentPercentages).negative)}%) </div></dd></dl></div></div><div class="mt-2" data-v-9fe621d0${_scopeId}><p class="text-xs text-red-600 font-medium" data-v-9fe621d0${_scopeId}>Click to view all negative feedback</p></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("div", { class: "flex items-center" }, [
                      createVNode("div", { class: "flex-shrink-0" }, [
                        createVNode("div", { class: "w-8 h-8 bg-red-500 rounded-md flex items-center justify-center" }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-5 h-5 text-white",
                            fill: "currentColor",
                            viewBox: "0 0 20 20"
                          }, [
                            createVNode("path", {
                              "fill-rule": "evenodd",
                              d: "M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 1.414 3 3 0 004.242 0 1 1 0 001.415-1.414 5 5 0 00-7.072 0z",
                              "clip-rule": "evenodd"
                            })
                          ]))
                        ])
                      ]),
                      createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                        createVNode("dl", null, [
                          createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Negative Sentiment"),
                          createVNode("dd", { class: "flex items-baseline" }, [
                            createVNode("div", { class: "text-2xl font-semibold text-white" }, toDisplayString(unref(sentimentSummary).negative), 1),
                            createVNode("div", { class: "ml-2 text-sm font-medium text-white" }, " (" + toDisplayString(unref(sentimentPercentages).negative) + "%) ", 1)
                          ])
                        ])
                      ])
                    ]),
                    createVNode("div", { class: "mt-2" }, [
                      createVNode("p", { class: "text-xs text-red-600 font-medium" }, "Click to view all negative feedback")
                    ])
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
          if (unref(feedbackData).length > 0) {
            _push(`<div class="mb-8" data-v-9fe621d0>`);
            _push(ssrRenderComponent(_component_AppCard, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center justify-between mb-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white" data-v-9fe621d0${_scopeId}>Feedback Calendar</h3><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><button class="p-2 text-white/70 hover:text-white rounded-md hover:bg-white/10 transition-colors" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" data-v-9fe621d0${_scopeId}></path></svg></button><h4 class="text-lg font-semibold text-white min-w-[140px] text-center" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(currentCalendarMonth))}</h4><button class="p-2 text-white/70 hover:text-white rounded-md hover:bg-white/10 transition-colors" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-9fe621d0${_scopeId}></path></svg></button></div></div><div class="grid grid-cols-7 gap-1" data-v-9fe621d0${_scopeId}><!--[-->`);
                  ssrRenderList(unref(dayHeaders), (day) => {
                    _push2(`<div class="p-3 text-center text-sm font-medium text-white border-b border-gray-200 dark:border-slate-700" data-v-9fe621d0${_scopeId}>${ssrInterpolate(day)}</div>`);
                  });
                  _push2(`<!--]--><!--[-->`);
                  ssrRenderList(unref(calendarDays), (day, index2) => {
                    _push2(`<div class="${ssrRenderClass([{
                      "bg-white/5 text-white/30": !day.inCurrentMonth,
                      "bg-white dark:bg-slate-800 text-white hover:bg-gray-50 dark:hover:bg-slate-700": day.inCurrentMonth && day.feedbackCount === 0,
                      "bg-green-500/20 text-green-300 hover:bg-green-500/30 cursor-pointer ring-1 ring-green-500": day.feedbackCount > 0 && day.dominantSentiment === "positive",
                      "bg-red-500/20 text-red-300 hover:bg-red-500/30 cursor-pointer ring-1 ring-red-500": day.feedbackCount > 0 && day.dominantSentiment === "negative",
                      "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 cursor-pointer ring-1 ring-yellow-500": day.feedbackCount > 0 && day.dominantSentiment === "neutral",
                      "bg-blue-600 text-white": day.isSelected,
                      "ring-2 ring-blue-500": day.isToday && !day.isSelected
                    }, "relative p-2 h-16 border border-gray-100 dark:border-slate-700 transition-all duration-200"])}" data-v-9fe621d0${_scopeId}>`);
                    if (day.date) {
                      _push2(`<div class="flex flex-col h-full" data-v-9fe621d0${_scopeId}><span class="text-sm font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(day.date.getDate())}</span>`);
                      if (day.feedbackCount > 0) {
                        _push2(`<div class="flex-1 flex items-end justify-center" data-v-9fe621d0${_scopeId}><div class="flex items-center space-x-1" data-v-9fe621d0${_scopeId}><div class="w-2 h-2 rounded-full bg-current opacity-60" data-v-9fe621d0${_scopeId}></div><span class="text-xs font-medium" data-v-9fe621d0${_scopeId}>${ssrInterpolate(day.feedbackCount)}</span></div></div>`);
                      } else {
                        _push2(`<!---->`);
                      }
                      _push2(`</div>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</div>`);
                  });
                  _push2(`<!--]--></div><div class="mt-4 flex items-center justify-center flex-wrap gap-4 text-sm text-white" data-v-9fe621d0${_scopeId}><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><div class="w-3 h-3 rounded bg-green-500" data-v-9fe621d0${_scopeId}></div><span data-v-9fe621d0${_scopeId}>Positive feedback</span></div><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><div class="w-3 h-3 rounded bg-yellow-500" data-v-9fe621d0${_scopeId}></div><span data-v-9fe621d0${_scopeId}>Neutral feedback</span></div><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><div class="w-3 h-3 rounded bg-red-500" data-v-9fe621d0${_scopeId}></div><span data-v-9fe621d0${_scopeId}>Negative feedback</span></div><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><div class="w-3 h-3 rounded border-2 border-blue-500" data-v-9fe621d0${_scopeId}></div><span data-v-9fe621d0${_scopeId}>Today</span></div><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><div class="w-3 h-3 rounded bg-gray-200" data-v-9fe621d0${_scopeId}></div><span data-v-9fe621d0${_scopeId}>No feedback</span></div></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "p-6" }, [
                      createVNode("div", { class: "flex items-center justify-between mb-6" }, [
                        createVNode("h3", { class: "text-lg font-medium text-white" }, "Feedback Calendar"),
                        createVNode("div", { class: "flex items-center space-x-2" }, [
                          createVNode("button", {
                            onClick: previousMonth,
                            class: "p-2 text-white/70 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                          }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-5 h-5",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor"
                            }, [
                              createVNode("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": "2",
                                d: "M15 19l-7-7 7-7"
                              })
                            ]))
                          ]),
                          createVNode("h4", { class: "text-lg font-semibold text-white min-w-[140px] text-center" }, toDisplayString(unref(currentCalendarMonth)), 1),
                          createVNode("button", {
                            onClick: nextMonth,
                            class: "p-2 text-white/70 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                          }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-5 h-5",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor"
                            }, [
                              createVNode("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": "2",
                                d: "M9 5l7 7-7 7"
                              })
                            ]))
                          ])
                        ])
                      ]),
                      createVNode("div", { class: "grid grid-cols-7 gap-1" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(dayHeaders), (day) => {
                          return openBlock(), createBlock("div", {
                            key: day,
                            class: "p-3 text-center text-sm font-medium text-white border-b border-gray-200 dark:border-slate-700"
                          }, toDisplayString(day), 1);
                        }), 128)),
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(calendarDays), (day, index2) => {
                          return openBlock(), createBlock("div", {
                            key: index2,
                            onClick: ($event) => day.date && day.feedbackCount > 0 ? selectCalendarDay(day.date) : null,
                            class: ["relative p-2 h-16 border border-gray-100 dark:border-slate-700 transition-all duration-200", {
                              "bg-white/5 text-white/30": !day.inCurrentMonth,
                              "bg-white dark:bg-slate-800 text-white hover:bg-gray-50 dark:hover:bg-slate-700": day.inCurrentMonth && day.feedbackCount === 0,
                              "bg-green-500/20 text-green-300 hover:bg-green-500/30 cursor-pointer ring-1 ring-green-500": day.feedbackCount > 0 && day.dominantSentiment === "positive",
                              "bg-red-500/20 text-red-300 hover:bg-red-500/30 cursor-pointer ring-1 ring-red-500": day.feedbackCount > 0 && day.dominantSentiment === "negative",
                              "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 cursor-pointer ring-1 ring-yellow-500": day.feedbackCount > 0 && day.dominantSentiment === "neutral",
                              "bg-blue-600 text-white": day.isSelected,
                              "ring-2 ring-blue-500": day.isToday && !day.isSelected
                            }]
                          }, [
                            day.date ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "flex flex-col h-full"
                            }, [
                              createVNode("span", { class: "text-sm font-medium text-white" }, toDisplayString(day.date.getDate()), 1),
                              day.feedbackCount > 0 ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "flex-1 flex items-end justify-center"
                              }, [
                                createVNode("div", { class: "flex items-center space-x-1" }, [
                                  createVNode("div", { class: "w-2 h-2 rounded-full bg-current opacity-60" }),
                                  createVNode("span", { class: "text-xs font-medium" }, toDisplayString(day.feedbackCount), 1)
                                ])
                              ])) : createCommentVNode("", true)
                            ])) : createCommentVNode("", true)
                          ], 10, ["onClick"]);
                        }), 128))
                      ]),
                      createVNode("div", { class: "mt-4 flex items-center justify-center flex-wrap gap-4 text-sm text-white" }, [
                        createVNode("div", { class: "flex items-center space-x-2" }, [
                          createVNode("div", { class: "w-3 h-3 rounded bg-green-500" }),
                          createVNode("span", null, "Positive feedback")
                        ]),
                        createVNode("div", { class: "flex items-center space-x-2" }, [
                          createVNode("div", { class: "w-3 h-3 rounded bg-yellow-500" }),
                          createVNode("span", null, "Neutral feedback")
                        ]),
                        createVNode("div", { class: "flex items-center space-x-2" }, [
                          createVNode("div", { class: "w-3 h-3 rounded bg-red-500" }),
                          createVNode("span", null, "Negative feedback")
                        ]),
                        createVNode("div", { class: "flex items-center space-x-2" }, [
                          createVNode("div", { class: "w-3 h-3 rounded border-2 border-blue-500" }),
                          createVNode("span", null, "Today")
                        ]),
                        createVNode("div", { class: "flex items-center space-x-2" }, [
                          createVNode("div", { class: "w-3 h-3 rounded bg-gray-200" }),
                          createVNode("span", null, "No feedback")
                        ])
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(selectedDate) && unref(selectedDateFeedback).length > 0) {
            _push(`<div class="mb-8" data-selected-day-feedback data-v-9fe621d0>`);
            _push(ssrRenderComponent(_component_AppCard, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700" data-v-9fe621d0${_scopeId}><div class="flex items-center justify-between" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white" data-v-9fe621d0${_scopeId}> Feedback for ${ssrInterpolate(formatSelectedDate(unref(selectedDate)))} <span class="ml-2 text-sm text-white" data-v-9fe621d0${_scopeId}>(${ssrInterpolate(unref(selectedDateFeedback).length)} items)</span></h3><button class="text-sm text-white hover:text-white dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 px-3 py-1 rounded-md transition-colors" data-v-9fe621d0${_scopeId}> Clear Selection </button></div></div><div class="p-6" data-v-9fe621d0${_scopeId}><div class="grid gap-4" data-v-9fe621d0${_scopeId}><!--[-->`);
                  ssrRenderList(unref(selectedDateFeedback), (item) => {
                    _push2(`<div class="${ssrRenderClass([{
                      "border-green-500/50": item.sentiment === "Positive",
                      "border-yellow-500/50": item.sentiment === "Neutral",
                      "border-red-500/50": item.sentiment === "Negative"
                    }, "border rounded-lg p-4 hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm"])}" data-v-9fe621d0${_scopeId}><div class="flex items-start justify-between" data-v-9fe621d0${_scopeId}><div class="flex-1" data-v-9fe621d0${_scopeId}><p class="text-sm text-white leading-relaxed" data-v-9fe621d0${_scopeId}>${ssrInterpolate(item.feedback)}</p><div class="flex items-center space-x-4 mt-3 text-xs text-white" data-v-9fe621d0${_scopeId}><span class="flex items-center" data-v-9fe621d0${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" data-v-9fe621d0${_scopeId}></path></svg> ${ssrInterpolate(item.accountName)}</span><span class="flex items-center" data-v-9fe621d0${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" data-v-9fe621d0${_scopeId}></path></svg> ${ssrInterpolate(item.accountOwner || "Unassigned")}</span><span class="flex items-center" data-v-9fe621d0${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-v-9fe621d0${_scopeId}></path></svg> ${ssrInterpolate(formatTime(item.createdDate))}</span><span class="flex items-center" data-v-9fe621d0${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" data-v-9fe621d0${_scopeId}></path></svg> ${ssrInterpolate(item.platformClientId)}</span>`);
                    if (item.feedbackDirectedTo) {
                      _push2(`<span class="flex items-center" data-v-9fe621d0${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-9fe621d0${_scopeId}></path></svg> Directed to: ${ssrInterpolate(item.feedbackDirectedTo)}</span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</div></div><div class="ml-4 flex-shrink-0 flex items-center space-x-2" data-v-9fe621d0${_scopeId}><button class="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Copy feedback" data-v-9fe621d0${_scopeId}><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-9fe621d0${_scopeId}></path></svg></button><span class="${ssrRenderClass([{
                      "bg-green-100 text-green-800": item.sentiment === "Positive",
                      "bg-yellow-100 text-yellow-800": item.sentiment === "Neutral",
                      "bg-red-100 text-red-800": item.sentiment === "Negative"
                    }, "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"])}" data-v-9fe621d0${_scopeId}>${ssrInterpolate(item.sentiment)}</span></div></div></div>`);
                  });
                  _push2(`<!--]--></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "px-6 py-4 border-b border-gray-200 dark:border-slate-700" }, [
                      createVNode("div", { class: "flex items-center justify-between" }, [
                        createVNode("h3", { class: "text-lg font-medium text-white" }, [
                          createTextVNode(" Feedback for " + toDisplayString(formatSelectedDate(unref(selectedDate))) + " ", 1),
                          createVNode("span", { class: "ml-2 text-sm text-white" }, "(" + toDisplayString(unref(selectedDateFeedback).length) + " items)", 1)
                        ]),
                        createVNode("button", {
                          onClick: clearSelectedDate,
                          class: "text-sm text-white hover:text-white dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 px-3 py-1 rounded-md transition-colors"
                        }, " Clear Selection ")
                      ])
                    ]),
                    createVNode("div", { class: "p-6" }, [
                      createVNode("div", { class: "grid gap-4" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(selectedDateFeedback), (item) => {
                          return openBlock(), createBlock("div", {
                            key: item.id,
                            class: ["border rounded-lg p-4 hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm", {
                              "border-green-500/50": item.sentiment === "Positive",
                              "border-yellow-500/50": item.sentiment === "Neutral",
                              "border-red-500/50": item.sentiment === "Negative"
                            }]
                          }, [
                            createVNode("div", { class: "flex items-start justify-between" }, [
                              createVNode("div", { class: "flex-1" }, [
                                createVNode("p", { class: "text-sm text-white leading-relaxed" }, toDisplayString(item.feedback), 1),
                                createVNode("div", { class: "flex items-center space-x-4 mt-3 text-xs text-white" }, [
                                  createVNode("span", { class: "flex items-center" }, [
                                    (openBlock(), createBlock("svg", {
                                      class: "w-3 h-3 mr-1",
                                      fill: "none",
                                      viewBox: "0 0 24 24",
                                      stroke: "currentColor"
                                    }, [
                                      createVNode("path", {
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                        "stroke-width": "2",
                                        d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                                      })
                                    ])),
                                    createTextVNode(" " + toDisplayString(item.accountName), 1)
                                  ]),
                                  createVNode("span", { class: "flex items-center" }, [
                                    (openBlock(), createBlock("svg", {
                                      class: "w-3 h-3 mr-1",
                                      fill: "none",
                                      viewBox: "0 0 24 24",
                                      stroke: "currentColor"
                                    }, [
                                      createVNode("path", {
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                        "stroke-width": "2",
                                        d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      })
                                    ])),
                                    createTextVNode(" " + toDisplayString(item.accountOwner || "Unassigned"), 1)
                                  ]),
                                  createVNode("span", { class: "flex items-center" }, [
                                    (openBlock(), createBlock("svg", {
                                      class: "w-3 h-3 mr-1",
                                      fill: "none",
                                      viewBox: "0 0 24 24",
                                      stroke: "currentColor"
                                    }, [
                                      createVNode("path", {
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                        "stroke-width": "2",
                                        d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      })
                                    ])),
                                    createTextVNode(" " + toDisplayString(formatTime(item.createdDate)), 1)
                                  ]),
                                  createVNode("span", { class: "flex items-center" }, [
                                    (openBlock(), createBlock("svg", {
                                      class: "w-3 h-3 mr-1",
                                      fill: "none",
                                      viewBox: "0 0 24 24",
                                      stroke: "currentColor"
                                    }, [
                                      createVNode("path", {
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                        "stroke-width": "2",
                                        d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                      })
                                    ])),
                                    createTextVNode(" " + toDisplayString(item.platformClientId), 1)
                                  ]),
                                  item.feedbackDirectedTo ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "flex items-center"
                                  }, [
                                    (openBlock(), createBlock("svg", {
                                      class: "w-3 h-3 mr-1",
                                      fill: "none",
                                      viewBox: "0 0 24 24",
                                      stroke: "currentColor"
                                    }, [
                                      createVNode("path", {
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                        "stroke-width": "2",
                                        d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                      })
                                    ])),
                                    createTextVNode(" Directed to: " + toDisplayString(item.feedbackDirectedTo), 1)
                                  ])) : createCommentVNode("", true)
                                ])
                              ]),
                              createVNode("div", { class: "ml-4 flex-shrink-0 flex items-center space-x-2" }, [
                                createVNode("button", {
                                  onClick: ($event) => copyFeedback(item),
                                  class: "p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors",
                                  title: "Copy feedback"
                                }, [
                                  (openBlock(), createBlock("svg", {
                                    class: "w-4 h-4",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor"
                                  }, [
                                    createVNode("path", {
                                      "stroke-linecap": "round",
                                      "stroke-linejoin": "round",
                                      "stroke-width": "2",
                                      d: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    })
                                  ]))
                                ], 8, ["onClick"]),
                                createVNode("span", {
                                  class: ["inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", {
                                    "bg-green-100 text-green-800": item.sentiment === "Positive",
                                    "bg-yellow-100 text-yellow-800": item.sentiment === "Neutral",
                                    "bg-red-100 text-red-800": item.sentiment === "Negative"
                                  }]
                                }, toDisplayString(item.sentiment), 3)
                              ])
                            ])
                          ], 2);
                        }), 128))
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(hasFinancialData)) {
            _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-v-9fe621d0>`);
            _push(ssrRenderComponent(_component_AppCard, null, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" data-v-9fe621d0${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1" data-v-9fe621d0${_scopeId}><dl data-v-9fe621d0${_scopeId}><dt class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>Total MRR</dt><dd class="flex items-baseline" data-v-9fe621d0${_scopeId}><div class="text-2xl font-semibold text-white" data-v-9fe621d0${_scopeId}>$${ssrInterpolate(unref(totalMrr).toLocaleString())}</div></dd></dl></div></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "p-6" }, [
                      createVNode("div", { class: "flex items-center" }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          createVNode("div", { class: "w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center justify-center" }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-5 h-5 text-green-600 dark:text-green-400",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor"
                            }, [
                              createVNode("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": "2",
                                d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                              })
                            ]))
                          ])
                        ]),
                        createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                          createVNode("dl", null, [
                            createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Total MRR"),
                            createVNode("dd", { class: "flex items-baseline" }, [
                              createVNode("div", { class: "text-2xl font-semibold text-white" }, "$" + toDisplayString(unref(totalMrr).toLocaleString()), 1)
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
                  _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" data-v-9fe621d0${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1" data-v-9fe621d0${_scopeId}><dl data-v-9fe621d0${_scopeId}><dt class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>Total TPV</dt><dd class="flex items-baseline" data-v-9fe621d0${_scopeId}><div class="text-2xl font-semibold text-white" data-v-9fe621d0${_scopeId}>$${ssrInterpolate(unref(totalTpv).toLocaleString())}</div></dd></dl></div></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "p-6" }, [
                      createVNode("div", { class: "flex items-center" }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          createVNode("div", { class: "w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-md flex items-center justify-center" }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-5 h-5 text-blue-600 dark:text-blue-400",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor"
                            }, [
                              createVNode("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": "2",
                                d: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              })
                            ]))
                          ])
                        ]),
                        createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                          createVNode("dl", null, [
                            createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Total TPV"),
                            createVNode("dd", { class: "flex items-baseline" }, [
                              createVNode("div", { class: "text-2xl font-semibold text-white" }, "$" + toDisplayString(unref(totalTpv).toLocaleString()), 1)
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
                  _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" data-v-9fe621d0${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1" data-v-9fe621d0${_scopeId}><dl data-v-9fe621d0${_scopeId}><dt class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>Avg MRR/Account</dt><dd class="flex items-baseline" data-v-9fe621d0${_scopeId}><div class="text-2xl font-semibold text-white" data-v-9fe621d0${_scopeId}>$${ssrInterpolate(unref(avgMrrPerAccount).toLocaleString())}</div></dd></dl></div></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "p-6" }, [
                      createVNode("div", { class: "flex items-center" }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          createVNode("div", { class: "w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-md flex items-center justify-center" }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-5 h-5 text-purple-600 dark:text-purple-400",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor"
                            }, [
                              createVNode("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": "2",
                                d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                              })
                            ]))
                          ])
                        ]),
                        createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                          createVNode("dl", null, [
                            createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "Avg MRR/Account"),
                            createVNode("dd", { class: "flex items-baseline" }, [
                              createVNode("div", { class: "text-2xl font-semibold text-white" }, "$" + toDisplayString(unref(avgMrrPerAccount).toLocaleString()), 1)
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
                  _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-md flex items-center justify-center" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" data-v-9fe621d0${_scopeId}></path></svg></div></div><div class="ml-5 w-0 flex-1" data-v-9fe621d0${_scopeId}><dl data-v-9fe621d0${_scopeId}><dt class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>High-Value Accounts</dt><dd class="flex items-baseline" data-v-9fe621d0${_scopeId}><div class="text-2xl font-semibold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(highValueAccounts))}</div><div class="ml-2 text-sm text-white" data-v-9fe621d0${_scopeId}>accounts</div></dd></dl></div></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "p-6" }, [
                      createVNode("div", { class: "flex items-center" }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          createVNode("div", { class: "w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-md flex items-center justify-center" }, [
                            (openBlock(), createBlock("svg", {
                              class: "w-5 h-5 text-amber-600 dark:text-amber-400",
                              fill: "none",
                              viewBox: "0 0 24 24",
                              stroke: "currentColor"
                            }, [
                              createVNode("path", {
                                "stroke-linecap": "round",
                                "stroke-linejoin": "round",
                                "stroke-width": "2",
                                d: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              })
                            ]))
                          ])
                        ]),
                        createVNode("div", { class: "ml-5 w-0 flex-1" }, [
                          createVNode("dl", null, [
                            createVNode("dt", { class: "text-sm font-medium text-white truncate" }, "High-Value Accounts"),
                            createVNode("dd", { class: "flex items-baseline" }, [
                              createVNode("div", { class: "text-2xl font-semibold text-white" }, toDisplayString(unref(highValueAccounts)), 1),
                              createVNode("div", { class: "ml-2 text-sm text-white" }, "accounts")
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
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(feedbackData).length > 0) {
          _push(`<div class="mb-8" data-v-9fe621d0><div class="mb-6" data-v-9fe621d0><h2 class="text-2xl font-bold text-white" data-v-9fe621d0>Analytics &amp; Categorization</h2><p class="text-white text-sm mt-1" data-v-9fe621d0>Detailed breakdown of feedback patterns and assignments</p></div><div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8" data-v-9fe621d0>`);
          _push(ssrRenderComponent(_component_AppCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4 flex items-center" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" data-v-9fe621d0${_scopeId}></path></svg></div> Sentiment Distribution </h3>`);
                if (unref(sentimentSummary).totalItems > 0) {
                  _push2(`<div data-v-9fe621d0${_scopeId}><div class="space-y-4" data-v-9fe621d0${_scopeId}><div class="flex items-center group" data-v-9fe621d0${_scopeId}><div class="w-20 text-sm font-medium text-white dark:text-slate-300" data-v-9fe621d0${_scopeId}>Positive</div><div class="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 mx-3 overflow-hidden" data-v-9fe621d0${_scopeId}><div class="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out hover:bg-green-600" style="${ssrRenderStyle({ width: unref(sentimentPercentages).positive + "%" })}" data-v-9fe621d0${_scopeId}><span class="text-white text-xs font-medium" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentSummary).positive)}</span></div></div><div class="w-12 text-sm text-white dark:text-slate-400 group-hover:text-green-600 transition-colors" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentPercentages).positive)}%</div></div><div class="flex items-center group" data-v-9fe621d0${_scopeId}><div class="w-20 text-sm font-medium text-white dark:text-slate-300" data-v-9fe621d0${_scopeId}>Neutral</div><div class="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 mx-3 overflow-hidden" data-v-9fe621d0${_scopeId}><div class="bg-yellow-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out hover:bg-yellow-600" style="${ssrRenderStyle({ width: unref(sentimentPercentages).neutral + "%" })}" data-v-9fe621d0${_scopeId}><span class="text-white text-xs font-medium" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentSummary).neutral)}</span></div></div><div class="w-12 text-sm text-white dark:text-slate-400 group-hover:text-yellow-600 transition-colors" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentPercentages).neutral)}%</div></div><div class="flex items-center group" data-v-9fe621d0${_scopeId}><div class="w-20 text-sm font-medium text-white dark:text-slate-300" data-v-9fe621d0${_scopeId}>Negative</div><div class="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 mx-3 overflow-hidden" data-v-9fe621d0${_scopeId}><div class="bg-red-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out hover:bg-red-600" style="${ssrRenderStyle({ width: Math.max(unref(sentimentPercentages).negative, 5) + "%" })}" data-v-9fe621d0${_scopeId}><span class="text-white text-xs font-medium" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentSummary).negative)}</span></div></div><div class="w-12 text-sm text-white dark:text-slate-400 group-hover:text-red-600 transition-colors" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentPercentages).negative)}%</div></div><div class="text-center pt-2 border-t border-gray-200 dark:border-slate-600" data-v-9fe621d0${_scopeId}><span class="text-lg font-bold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(sentimentSummary).totalItems)}</span><span class="text-sm text-white ml-1" data-v-9fe621d0${_scopeId}>Total Feedback</span></div></div></div>`);
                } else {
                  _push2(`<div class="text-center py-8 text-white" data-v-9fe621d0${_scopeId}><svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" data-v-9fe621d0${_scopeId}></path></svg><p class="text-sm" data-v-9fe621d0${_scopeId}>No sentiment data available</p></div>`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white mb-4 flex items-center" }, [
                      createVNode("div", { class: "w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3" }, [
                        (openBlock(), createBlock("svg", {
                          class: "w-5 h-5 text-white",
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
                      ]),
                      createTextVNode(" Sentiment Distribution ")
                    ]),
                    unref(sentimentSummary).totalItems > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                      createVNode("div", { class: "space-y-4" }, [
                        createVNode("div", { class: "flex items-center group" }, [
                          createVNode("div", { class: "w-20 text-sm font-medium text-white dark:text-slate-300" }, "Positive"),
                          createVNode("div", { class: "flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 mx-3 overflow-hidden" }, [
                            createVNode("div", {
                              class: "bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out hover:bg-green-600",
                              style: { width: unref(sentimentPercentages).positive + "%" }
                            }, [
                              createVNode("span", { class: "text-white text-xs font-medium" }, toDisplayString(unref(sentimentSummary).positive), 1)
                            ], 4)
                          ]),
                          createVNode("div", { class: "w-12 text-sm text-white dark:text-slate-400 group-hover:text-green-600 transition-colors" }, toDisplayString(unref(sentimentPercentages).positive) + "%", 1)
                        ]),
                        createVNode("div", { class: "flex items-center group" }, [
                          createVNode("div", { class: "w-20 text-sm font-medium text-white dark:text-slate-300" }, "Neutral"),
                          createVNode("div", { class: "flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 mx-3 overflow-hidden" }, [
                            createVNode("div", {
                              class: "bg-yellow-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out hover:bg-yellow-600",
                              style: { width: unref(sentimentPercentages).neutral + "%" }
                            }, [
                              createVNode("span", { class: "text-white text-xs font-medium" }, toDisplayString(unref(sentimentSummary).neutral), 1)
                            ], 4)
                          ]),
                          createVNode("div", { class: "w-12 text-sm text-white dark:text-slate-400 group-hover:text-yellow-600 transition-colors" }, toDisplayString(unref(sentimentPercentages).neutral) + "%", 1)
                        ]),
                        createVNode("div", { class: "flex items-center group" }, [
                          createVNode("div", { class: "w-20 text-sm font-medium text-white dark:text-slate-300" }, "Negative"),
                          createVNode("div", { class: "flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-6 mx-3 overflow-hidden" }, [
                            createVNode("div", {
                              class: "bg-red-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all duration-1000 ease-out hover:bg-red-600",
                              style: { width: Math.max(unref(sentimentPercentages).negative, 5) + "%" }
                            }, [
                              createVNode("span", { class: "text-white text-xs font-medium" }, toDisplayString(unref(sentimentSummary).negative), 1)
                            ], 4)
                          ]),
                          createVNode("div", { class: "w-12 text-sm text-white dark:text-slate-400 group-hover:text-red-600 transition-colors" }, toDisplayString(unref(sentimentPercentages).negative) + "%", 1)
                        ]),
                        createVNode("div", { class: "text-center pt-2 border-t border-gray-200 dark:border-slate-600" }, [
                          createVNode("span", { class: "text-lg font-bold text-white" }, toDisplayString(unref(sentimentSummary).totalItems), 1),
                          createVNode("span", { class: "text-sm text-white ml-1" }, "Total Feedback")
                        ])
                      ])
                    ])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "text-center py-8 text-white"
                    }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-12 h-12 mx-auto mb-4",
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
                      ])),
                      createVNode("p", { class: "text-sm" }, "No sentiment data available")
                    ]))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_AppCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4 flex items-center" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" data-v-9fe621d0${_scopeId}></path></svg></div> Feedback Trends (Last 30 Days) </h3>`);
                if (unref(feedbackTrendsData).length > 0) {
                  _push2(`<div data-v-9fe621d0${_scopeId}><div class="space-y-4" data-v-9fe621d0${_scopeId}><div class="grid grid-cols-3 gap-4 text-center" data-v-9fe621d0${_scopeId}><div class="bg-green-500/10 p-3 rounded-lg hover:bg-green-500/20 transition-colors duration-200 cursor-pointer" data-v-9fe621d0${_scopeId}><div class="text-lg font-bold text-green-600 dark:text-green-400" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(feedbackTrendsData).reduce((sum, day) => sum + day.positive, 0))}</div><div class="text-xs text-green-600 dark:text-green-400" data-v-9fe621d0${_scopeId}>Positive</div></div><div class="bg-yellow-500/10 p-3 rounded-lg hover:bg-yellow-500/20 transition-colors duration-200 cursor-pointer" data-v-9fe621d0${_scopeId}><div class="text-lg font-bold text-yellow-600 dark:text-yellow-400" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(feedbackTrendsData).reduce((sum, day) => sum + day.neutral, 0))}</div><div class="text-xs text-yellow-600 dark:text-yellow-400" data-v-9fe621d0${_scopeId}>Neutral</div></div><div class="bg-red-500/10 p-3 rounded-lg hover:bg-red-500/20 transition-colors duration-200 cursor-pointer" data-v-9fe621d0${_scopeId}><div class="text-lg font-bold text-red-600 dark:text-red-400" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(feedbackTrendsData).reduce((sum, day) => sum + day.negative, 0))}</div><div class="text-xs text-red-600 dark:text-red-400" data-v-9fe621d0${_scopeId}>Negative</div></div></div><div class="text-center" data-v-9fe621d0${_scopeId}><div class="text-sm text-white dark:text-slate-400 mb-2" data-v-9fe621d0${_scopeId}>Last 7 Days Activity</div><div class="flex justify-center space-x-1" data-v-9fe621d0${_scopeId}><!--[-->`);
                  ssrRenderList(unref(feedbackTrendsData).slice(-7), (day, index2) => {
                    _push2(`<div class="${ssrRenderClass([{
                      "bg-green-500 text-white hover:bg-green-600": day.positive > day.neutral && day.positive > day.negative,
                      "bg-yellow-500 text-white hover:bg-yellow-600": day.neutral > day.positive && day.neutral > day.negative,
                      "bg-red-500 text-white hover:bg-red-600": day.negative > day.positive && day.negative > day.neutral,
                      "bg-gray-300 dark:bg-slate-600 text-white hover:bg-gray-400 dark:hover:bg-slate-500": day.positive === 0 && day.neutral === 0 && day.negative === 0
                    }, "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transform hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"])}"${ssrRenderAttr("title", `${new Date(day.date).toLocaleDateString()}: +${day.positive} ~${day.neutral} -${day.negative}`)} data-v-9fe621d0${_scopeId}>${ssrInterpolate(day.positive + day.neutral + day.negative)}</div>`);
                  });
                  _push2(`<!--]--></div></div></div></div>`);
                } else {
                  _push2(`<div class="text-center py-8 text-white" data-v-9fe621d0${_scopeId}><svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" data-v-9fe621d0${_scopeId}></path></svg><p class="text-sm" data-v-9fe621d0${_scopeId}>No trend data available</p></div>`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white mb-4 flex items-center" }, [
                      createVNode("div", { class: "w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3" }, [
                        (openBlock(), createBlock("svg", {
                          class: "w-5 h-5 text-white",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          })
                        ]))
                      ]),
                      createTextVNode(" Feedback Trends (Last 30 Days) ")
                    ]),
                    unref(feedbackTrendsData).length > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                      createVNode("div", { class: "space-y-4" }, [
                        createVNode("div", { class: "grid grid-cols-3 gap-4 text-center" }, [
                          createVNode("div", { class: "bg-green-500/10 p-3 rounded-lg hover:bg-green-500/20 transition-colors duration-200 cursor-pointer" }, [
                            createVNode("div", { class: "text-lg font-bold text-green-600 dark:text-green-400" }, toDisplayString(unref(feedbackTrendsData).reduce((sum, day) => sum + day.positive, 0)), 1),
                            createVNode("div", { class: "text-xs text-green-600 dark:text-green-400" }, "Positive")
                          ]),
                          createVNode("div", { class: "bg-yellow-500/10 p-3 rounded-lg hover:bg-yellow-500/20 transition-colors duration-200 cursor-pointer" }, [
                            createVNode("div", { class: "text-lg font-bold text-yellow-600 dark:text-yellow-400" }, toDisplayString(unref(feedbackTrendsData).reduce((sum, day) => sum + day.neutral, 0)), 1),
                            createVNode("div", { class: "text-xs text-yellow-600 dark:text-yellow-400" }, "Neutral")
                          ]),
                          createVNode("div", { class: "bg-red-500/10 p-3 rounded-lg hover:bg-red-500/20 transition-colors duration-200 cursor-pointer" }, [
                            createVNode("div", { class: "text-lg font-bold text-red-600 dark:text-red-400" }, toDisplayString(unref(feedbackTrendsData).reduce((sum, day) => sum + day.negative, 0)), 1),
                            createVNode("div", { class: "text-xs text-red-600 dark:text-red-400" }, "Negative")
                          ])
                        ]),
                        createVNode("div", { class: "text-center" }, [
                          createVNode("div", { class: "text-sm text-white dark:text-slate-400 mb-2" }, "Last 7 Days Activity"),
                          createVNode("div", { class: "flex justify-center space-x-1" }, [
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(feedbackTrendsData).slice(-7), (day, index2) => {
                              return openBlock(), createBlock("div", {
                                key: index2,
                                class: ["w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer transform hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md", {
                                  "bg-green-500 text-white hover:bg-green-600": day.positive > day.neutral && day.positive > day.negative,
                                  "bg-yellow-500 text-white hover:bg-yellow-600": day.neutral > day.positive && day.neutral > day.negative,
                                  "bg-red-500 text-white hover:bg-red-600": day.negative > day.positive && day.negative > day.neutral,
                                  "bg-gray-300 dark:bg-slate-600 text-white hover:bg-gray-400 dark:hover:bg-slate-500": day.positive === 0 && day.neutral === 0 && day.negative === 0
                                }],
                                title: `${new Date(day.date).toLocaleDateString()}: +${day.positive} ~${day.neutral} -${day.negative}`
                              }, toDisplayString(day.positive + day.neutral + day.negative), 11, ["title"]);
                            }), 128))
                          ])
                        ])
                      ])
                    ])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "text-center py-8 text-white"
                    }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-12 h-12 mx-auto mb-4",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        })
                      ])),
                      createVNode("p", { class: "text-sm" }, "No trend data available")
                    ]))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_AppCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4 flex items-center" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" data-v-9fe621d0${_scopeId}></path></svg></div> Feedback Subcategories </h3>`);
                if (unref(topSubcategories).length > 0) {
                  _push2(`<div data-v-9fe621d0${_scopeId}><div class="space-y-2 max-h-64 overflow-y-auto" data-v-9fe621d0${_scopeId}><!--[-->`);
                  ssrRenderList(unref(topSubcategories).slice(0, 8), (subcategory, index2) => {
                    _push2(`<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="w-3 h-3 rounded-full mr-3" style="${ssrRenderStyle({ backgroundColor: ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#84CC16", "#F97316"][index2 % 8] })}" data-v-9fe621d0${_scopeId}></div><span class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>${ssrInterpolate(subcategory.name || "Uncategorized")}</span></div><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><span class="text-sm font-bold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(subcategory.count)}</span><span class="text-xs text-white" data-v-9fe621d0${_scopeId}>(${ssrInterpolate(subcategory.percentage)}%)</span></div></div>`);
                  });
                  _push2(`<!--]--></div></div>`);
                } else {
                  _push2(`<div class="text-center py-8 text-white" data-v-9fe621d0${_scopeId}><svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" data-v-9fe621d0${_scopeId}></path></svg><p class="text-sm" data-v-9fe621d0${_scopeId}>No subcategory data available</p></div>`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white mb-4 flex items-center" }, [
                      createVNode("div", { class: "w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3" }, [
                        (openBlock(), createBlock("svg", {
                          class: "w-5 h-5 text-white",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          })
                        ]))
                      ]),
                      createTextVNode(" Feedback Subcategories ")
                    ]),
                    unref(topSubcategories).length > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                      createVNode("div", { class: "space-y-2 max-h-64 overflow-y-auto" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(topSubcategories).slice(0, 8), (subcategory, index2) => {
                          return openBlock(), createBlock("div", {
                            key: subcategory.name,
                            class: "flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                          }, [
                            createVNode("div", { class: "flex items-center" }, [
                              createVNode("div", {
                                class: "w-3 h-3 rounded-full mr-3",
                                style: { backgroundColor: ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#84CC16", "#F97316"][index2 % 8] }
                              }, null, 4),
                              createVNode("span", { class: "text-sm font-medium text-white truncate" }, toDisplayString(subcategory.name || "Uncategorized"), 1)
                            ]),
                            createVNode("div", { class: "flex items-center space-x-2" }, [
                              createVNode("span", { class: "text-sm font-bold text-white" }, toDisplayString(subcategory.count), 1),
                              createVNode("span", { class: "text-xs text-white" }, "(" + toDisplayString(subcategory.percentage) + "%)", 1)
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "text-center py-8 text-white"
                    }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-12 h-12 mx-auto mb-4",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        })
                      ])),
                      createVNode("p", { class: "text-sm" }, "No subcategory data available")
                    ]))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_AppCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4 flex items-center" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14m-14 0a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2" data-v-9fe621d0${_scopeId}></path></svg></div> Category Classifications </h3>`);
                if (unref(topCategoryFormulas).length > 0) {
                  _push2(`<div data-v-9fe621d0${_scopeId}><div class="space-y-2 max-h-64 overflow-y-auto" data-v-9fe621d0${_scopeId}><!--[-->`);
                  ssrRenderList(unref(topCategoryFormulas).slice(0, 6), (category, index2) => {
                    _push2(`<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="w-3 h-3 rounded-full mr-3" style="${ssrRenderStyle({ backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"][index2 % 6] })}" data-v-9fe621d0${_scopeId}></div><span class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>${ssrInterpolate(category.name || "Unclassified")}</span></div><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><span class="text-sm font-bold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(category.count)}</span><span class="text-xs text-white" data-v-9fe621d0${_scopeId}>(${ssrInterpolate(category.percentage)}%)</span></div></div>`);
                  });
                  _push2(`<!--]--></div></div>`);
                } else {
                  _push2(`<div class="text-center py-8 text-white" data-v-9fe621d0${_scopeId}><svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14m-14 0a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2" data-v-9fe621d0${_scopeId}></path></svg><p class="text-sm" data-v-9fe621d0${_scopeId}>No category data available</p></div>`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white mb-4 flex items-center" }, [
                      createVNode("div", { class: "w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3" }, [
                        (openBlock(), createBlock("svg", {
                          class: "w-5 h-5 text-white",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14m-14 0a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2"
                          })
                        ]))
                      ]),
                      createTextVNode(" Category Classifications ")
                    ]),
                    unref(topCategoryFormulas).length > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                      createVNode("div", { class: "space-y-2 max-h-64 overflow-y-auto" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(topCategoryFormulas).slice(0, 6), (category, index2) => {
                          return openBlock(), createBlock("div", {
                            key: category.name,
                            class: "flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                          }, [
                            createVNode("div", { class: "flex items-center" }, [
                              createVNode("div", {
                                class: "w-3 h-3 rounded-full mr-3",
                                style: { backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"][index2 % 6] }
                              }, null, 4),
                              createVNode("span", { class: "text-sm font-medium text-white truncate" }, toDisplayString(category.name || "Unclassified"), 1)
                            ]),
                            createVNode("div", { class: "flex items-center space-x-2" }, [
                              createVNode("span", { class: "text-sm font-bold text-white" }, toDisplayString(category.count), 1),
                              createVNode("span", { class: "text-xs text-white" }, "(" + toDisplayString(category.percentage) + "%)", 1)
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "text-center py-8 text-white"
                    }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-12 h-12 mx-auto mb-4",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 00-2 2v2a2 2 0 002 2m0 0h14m-14 0a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2"
                        })
                      ])),
                      createVNode("p", { class: "text-sm" }, "No category data available")
                    ]))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_AppCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4 flex items-center" data-v-9fe621d0${_scopeId}><div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3" data-v-9fe621d0${_scopeId}><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 115.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" data-v-9fe621d0${_scopeId}></path></svg></div> Feedback Directed To </h3>`);
                if (unref(feedbackDirectedToAnalytics).length > 0) {
                  _push2(`<div data-v-9fe621d0${_scopeId}><div class="space-y-2 max-h-64 overflow-y-auto" data-v-9fe621d0${_scopeId}><!--[-->`);
                  ssrRenderList(unref(feedbackDirectedToAnalytics).slice(0, 6), (item, index2) => {
                    _push2(`<div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><div class="w-3 h-3 rounded-full mr-3" style="${ssrRenderStyle({ backgroundColor: ["#6366F1", "#EC4899", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6"][index2 % 6] })}" data-v-9fe621d0${_scopeId}></div><span class="text-sm font-medium text-white truncate" data-v-9fe621d0${_scopeId}>${ssrInterpolate(item.name || "Unspecified")}</span></div><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><span class="text-sm font-bold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(item.total)}</span><span class="text-xs text-white" data-v-9fe621d0${_scopeId}>(${ssrInterpolate(item.percentage)}%)</span><span class="${ssrRenderClass([{
                      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400": item.positiveRate >= 70,
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400": item.positiveRate >= 50 && item.positiveRate < 70,
                      "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400": item.positiveRate < 50
                    }, "text-xs px-2 py-1 rounded-full"])}" data-v-9fe621d0${_scopeId}>${ssrInterpolate(item.positiveRate)}% + </span></div></div>`);
                  });
                  _push2(`<!--]--></div></div>`);
                } else {
                  _push2(`<div class="text-center py-8 text-white" data-v-9fe621d0${_scopeId}><svg class="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 115.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" data-v-9fe621d0${_scopeId}></path></svg><p class="text-sm" data-v-9fe621d0${_scopeId}>No feedback direction data available</p></div>`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white mb-4 flex items-center" }, [
                      createVNode("div", { class: "w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3" }, [
                        (openBlock(), createBlock("svg", {
                          class: "w-5 h-5 text-white",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor"
                        }, [
                          createVNode("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 115.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          })
                        ]))
                      ]),
                      createTextVNode(" Feedback Directed To ")
                    ]),
                    unref(feedbackDirectedToAnalytics).length > 0 ? (openBlock(), createBlock("div", { key: 0 }, [
                      createVNode("div", { class: "space-y-2 max-h-64 overflow-y-auto" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(feedbackDirectedToAnalytics).slice(0, 6), (item, index2) => {
                          return openBlock(), createBlock("div", {
                            key: item.name,
                            class: "flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                          }, [
                            createVNode("div", { class: "flex items-center" }, [
                              createVNode("div", {
                                class: "w-3 h-3 rounded-full mr-3",
                                style: { backgroundColor: ["#6366F1", "#EC4899", "#14B8A6", "#F59E0B", "#EF4444", "#8B5CF6"][index2 % 6] }
                              }, null, 4),
                              createVNode("span", { class: "text-sm font-medium text-white truncate" }, toDisplayString(item.name || "Unspecified"), 1)
                            ]),
                            createVNode("div", { class: "flex items-center space-x-2" }, [
                              createVNode("span", { class: "text-sm font-bold text-white" }, toDisplayString(item.total), 1),
                              createVNode("span", { class: "text-xs text-white" }, "(" + toDisplayString(item.percentage) + "%)", 1),
                              createVNode("span", {
                                class: ["text-xs px-2 py-1 rounded-full", {
                                  "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400": item.positiveRate >= 70,
                                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400": item.positiveRate >= 50 && item.positiveRate < 70,
                                  "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400": item.positiveRate < 50
                                }]
                              }, toDisplayString(item.positiveRate) + "% + ", 3)
                            ])
                          ]);
                        }), 128))
                      ])
                    ])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "text-center py-8 text-white"
                    }, [
                      (openBlock(), createBlock("svg", {
                        class: "w-12 h-12 mx-auto mb-4",
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 115.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        })
                      ])),
                      createVNode("p", { class: "text-sm" }, "No feedback direction data available")
                    ]))
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(hasFinancialData)) {
          _push(`<div class="mb-8" data-v-9fe621d0>`);
          _push(ssrRenderComponent(_component_AppCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4" data-v-9fe621d0${_scopeId}>Top Accounts by Revenue Impact</h3><div class="overflow-x-auto" data-v-9fe621d0${_scopeId}><table class="min-w-full" data-v-9fe621d0${_scopeId}><thead data-v-9fe621d0${_scopeId}><tr class="border-b border-gray-200 dark:border-slate-700" data-v-9fe621d0${_scopeId}><th class="text-left py-3 px-4 font-medium text-white" data-v-9fe621d0${_scopeId}>Account</th><th class="text-left py-3 px-4 font-medium text-white" data-v-9fe621d0${_scopeId}>Account Owner</th><th class="text-right py-3 px-4 font-medium text-white" data-v-9fe621d0${_scopeId}>MRR</th><th class="text-right py-3 px-4 font-medium text-white" data-v-9fe621d0${_scopeId}>TPV</th><th class="text-center py-3 px-4 font-medium text-white" data-v-9fe621d0${_scopeId}>Feedback Count</th><th class="text-center py-3 px-4 font-medium text-white" data-v-9fe621d0${_scopeId}>Sentiment</th></tr></thead><tbody class="divide-y divide-gray-200 dark:divide-slate-700" data-v-9fe621d0${_scopeId}><!--[-->`);
                ssrRenderList(unref(topRevenueAccounts), (account) => {
                  _push2(`<tr class="${ssrRenderClass({ "bg-yellow-50 dark:bg-yellow-900/10": account.name === "Gerardo Consulting CCL" })}" data-v-9fe621d0${_scopeId}><td class="py-3 px-4" data-v-9fe621d0${_scopeId}><div class="flex items-center" data-v-9fe621d0${_scopeId}><span class="text-sm font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(account.name)}</span>`);
                  if (account.name === "Gerardo Consulting CCL") {
                    _push2(`<span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200" data-v-9fe621d0${_scopeId}> Testing Account </span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></td><td class="py-3 px-4 text-sm text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(account.owner)}</td><td class="py-3 px-4 text-right text-sm font-medium text-green-600 dark:text-green-400" data-v-9fe621d0${_scopeId}>$${ssrInterpolate(account.mrr.toLocaleString())}</td><td class="py-3 px-4 text-right text-sm font-medium text-blue-600 dark:text-blue-400" data-v-9fe621d0${_scopeId}>$${ssrInterpolate(account.tpv.toLocaleString())}</td><td class="py-3 px-4 text-center text-sm text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(account.feedbackCount)}</td><td class="py-3 px-4 text-center" data-v-9fe621d0${_scopeId}><span class="${ssrRenderClass([{
                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200": account.dominantSentiment === "Positive",
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200": account.dominantSentiment === "Neutral",
                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200": account.dominantSentiment === "Negative"
                  }, "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"])}" data-v-9fe621d0${_scopeId}>${ssrInterpolate(account.dominantSentiment)}</span></td></tr>`);
                });
                _push2(`<!--]--></tbody></table></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Top Accounts by Revenue Impact"),
                    createVNode("div", { class: "overflow-x-auto" }, [
                      createVNode("table", { class: "min-w-full" }, [
                        createVNode("thead", null, [
                          createVNode("tr", { class: "border-b border-gray-200 dark:border-slate-700" }, [
                            createVNode("th", { class: "text-left py-3 px-4 font-medium text-white" }, "Account"),
                            createVNode("th", { class: "text-left py-3 px-4 font-medium text-white" }, "Account Owner"),
                            createVNode("th", { class: "text-right py-3 px-4 font-medium text-white" }, "MRR"),
                            createVNode("th", { class: "text-right py-3 px-4 font-medium text-white" }, "TPV"),
                            createVNode("th", { class: "text-center py-3 px-4 font-medium text-white" }, "Feedback Count"),
                            createVNode("th", { class: "text-center py-3 px-4 font-medium text-white" }, "Sentiment")
                          ])
                        ]),
                        createVNode("tbody", { class: "divide-y divide-gray-200 dark:divide-slate-700" }, [
                          (openBlock(true), createBlock(Fragment, null, renderList(unref(topRevenueAccounts), (account) => {
                            return openBlock(), createBlock("tr", {
                              key: account.name,
                              class: { "bg-yellow-50 dark:bg-yellow-900/10": account.name === "Gerardo Consulting CCL" }
                            }, [
                              createVNode("td", { class: "py-3 px-4" }, [
                                createVNode("div", { class: "flex items-center" }, [
                                  createVNode("span", { class: "text-sm font-medium text-white" }, toDisplayString(account.name), 1),
                                  account.name === "Gerardo Consulting CCL" ? (openBlock(), createBlock("span", {
                                    key: 0,
                                    class: "ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                  }, " Testing Account ")) : createCommentVNode("", true)
                                ])
                              ]),
                              createVNode("td", { class: "py-3 px-4 text-sm text-white" }, toDisplayString(account.owner), 1),
                              createVNode("td", { class: "py-3 px-4 text-right text-sm font-medium text-green-600 dark:text-green-400" }, "$" + toDisplayString(account.mrr.toLocaleString()), 1),
                              createVNode("td", { class: "py-3 px-4 text-right text-sm font-medium text-blue-600 dark:text-blue-400" }, "$" + toDisplayString(account.tpv.toLocaleString()), 1),
                              createVNode("td", { class: "py-3 px-4 text-center text-sm text-white" }, toDisplayString(account.feedbackCount), 1),
                              createVNode("td", { class: "py-3 px-4 text-center" }, [
                                createVNode("span", {
                                  class: ["inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", {
                                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200": account.dominantSentiment === "Positive",
                                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200": account.dominantSentiment === "Neutral",
                                    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200": account.dominantSentiment === "Negative"
                                  }]
                                }, toDisplayString(account.dominantSentiment), 3)
                              ])
                            ], 2);
                          }), 128))
                        ])
                      ])
                    ])
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div style="${ssrRenderStyle(unref(activeTab) === "trends" ? null : { display: "none" })}" data-v-9fe621d0><div class="mb-8" data-v-9fe621d0><div class="flex items-center justify-between mb-6" data-v-9fe621d0><h2 class="text-2xl font-bold text-white" data-v-9fe621d0>This Week&#39;s Overview</h2><div class="flex items-center space-x-2 text-sm text-white" data-v-9fe621d0><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-v-9fe621d0></path></svg><span data-v-9fe621d0>${ssrInterpolate(unref(currentWeekRange))}</span></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" data-v-9fe621d0>`);
        _push(ssrRenderComponent(_component_AppCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4" data-v-9fe621d0${_scopeId}>Weekly Summary</h3><div class="space-y-4" data-v-9fe621d0${_scopeId}><div class="flex items-center justify-between" data-v-9fe621d0${_scopeId}><div data-v-9fe621d0${_scopeId}><span class="text-sm text-white" data-v-9fe621d0${_scopeId}>Total Feedback This Week</span><p class="text-xs text-white" data-v-9fe621d0${_scopeId}>vs. last week (${ssrInterpolate(unref(weeklyStats).lastWeekTotal)})</p></div><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><span class="text-lg font-semibold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(weeklyStats).totalFeedback)}</span>`);
              if (unref(weeklyStats).totalGrowth !== 0) {
                _push2(`<span class="${ssrRenderClass([unref(weeklyStats).totalGrowth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800", "text-xs px-2 py-1 rounded-full"])}" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(weeklyStats).totalGrowth >= 0 ? "+" : "")}${ssrInterpolate(unref(weeklyStats).totalGrowth)}% </span>`);
              } else {
                _push2(`<span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-white" data-v-9fe621d0${_scopeId}> No change </span>`);
              }
              _push2(`</div></div><div class="flex items-center justify-between" data-v-9fe621d0${_scopeId}><span class="text-sm text-white" data-v-9fe621d0${_scopeId}>Positive Sentiment</span><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><span class="text-lg font-semibold text-green-600" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(weeklyStats).positiveCount)}</span><span class="text-xs text-white" data-v-9fe621d0${_scopeId}>(${ssrInterpolate(unref(weeklyStats).positivePercentage)}%)</span></div></div><div class="flex items-center justify-between" data-v-9fe621d0${_scopeId}><span class="text-sm text-white" data-v-9fe621d0${_scopeId}>Most Active Day</span><span class="text-sm font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(weeklyStats).mostActiveDay)}</span></div><div class="flex items-center justify-between" data-v-9fe621d0${_scopeId}><span class="text-sm text-white" data-v-9fe621d0${_scopeId}>Top Account This Week</span><span class="text-sm font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(weeklyStats).topAccount)}</span></div></div></div>`);
            } else {
              return [
                createVNode("div", { class: "p-6" }, [
                  createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Weekly Summary"),
                  createVNode("div", { class: "space-y-4" }, [
                    createVNode("div", { class: "flex items-center justify-between" }, [
                      createVNode("div", null, [
                        createVNode("span", { class: "text-sm text-white" }, "Total Feedback This Week"),
                        createVNode("p", { class: "text-xs text-white" }, "vs. last week (" + toDisplayString(unref(weeklyStats).lastWeekTotal) + ")", 1)
                      ]),
                      createVNode("div", { class: "flex items-center space-x-2" }, [
                        createVNode("span", { class: "text-lg font-semibold text-white" }, toDisplayString(unref(weeklyStats).totalFeedback), 1),
                        unref(weeklyStats).totalGrowth !== 0 ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: ["text-xs px-2 py-1 rounded-full", unref(weeklyStats).totalGrowth >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"]
                        }, toDisplayString(unref(weeklyStats).totalGrowth >= 0 ? "+" : "") + toDisplayString(unref(weeklyStats).totalGrowth) + "% ", 3)) : (openBlock(), createBlock("span", {
                          key: 1,
                          class: "text-xs px-2 py-1 rounded-full bg-gray-100 text-white"
                        }, " No change "))
                      ])
                    ]),
                    createVNode("div", { class: "flex items-center justify-between" }, [
                      createVNode("span", { class: "text-sm text-white" }, "Positive Sentiment"),
                      createVNode("div", { class: "flex items-center space-x-2" }, [
                        createVNode("span", { class: "text-lg font-semibold text-green-600" }, toDisplayString(unref(weeklyStats).positiveCount), 1),
                        createVNode("span", { class: "text-xs text-white" }, "(" + toDisplayString(unref(weeklyStats).positivePercentage) + "%)", 1)
                      ])
                    ]),
                    createVNode("div", { class: "flex items-center justify-between" }, [
                      createVNode("span", { class: "text-sm text-white" }, "Most Active Day"),
                      createVNode("span", { class: "text-sm font-medium text-white" }, toDisplayString(unref(weeklyStats).mostActiveDay), 1)
                    ]),
                    createVNode("div", { class: "flex items-center justify-between" }, [
                      createVNode("span", { class: "text-sm text-white" }, "Top Account This Week"),
                      createVNode("span", { class: "text-sm font-medium text-white" }, toDisplayString(unref(weeklyStats).topAccount), 1)
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
              _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4" data-v-9fe621d0${_scopeId}>Account Manager Activity</h3><div class="space-y-4" data-v-9fe621d0${_scopeId}><!--[-->`);
              ssrRenderList(unref(accountManagerStats), (manager) => {
                _push2(`<div class="flex items-center justify-between" data-v-9fe621d0${_scopeId}><div class="flex items-center space-x-3" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center" data-v-9fe621d0${_scopeId}><span class="text-xs font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(manager.name.split(" ").map((n) => n[0]).join(""))}</span></div><div data-v-9fe621d0${_scopeId}><p class="text-sm font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(manager.name)}</p><p class="text-xs text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(manager.accounts)} accounts</p></div></div><div class="text-right" data-v-9fe621d0${_scopeId}><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><div class="w-20 bg-gray-200 rounded-full h-2" data-v-9fe621d0${_scopeId}><div class="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style="${ssrRenderStyle({ width: `${manager.percentage}%` })}" data-v-9fe621d0${_scopeId}></div></div><span class="text-sm font-semibold text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(manager.feedbackCount)}</span></div><p class="text-xs text-white mt-1" data-v-9fe621d0${_scopeId}><span class="text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(manager.weeklyGrowth >= 0 ? "+" : "")}${ssrInterpolate(manager.weeklyGrowth)}% vs last week</span></p></div></div>`);
              });
              _push2(`<!--]--></div></div>`);
            } else {
              return [
                createVNode("div", { class: "p-6" }, [
                  createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Account Manager Activity"),
                  createVNode("div", { class: "space-y-4" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(accountManagerStats), (manager) => {
                      return openBlock(), createBlock("div", {
                        key: manager.name,
                        class: "flex items-center justify-between"
                      }, [
                        createVNode("div", { class: "flex items-center space-x-3" }, [
                          createVNode("div", { class: "flex-shrink-0 h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center" }, [
                            createVNode("span", { class: "text-xs font-medium text-white" }, toDisplayString(manager.name.split(" ").map((n) => n[0]).join("")), 1)
                          ]),
                          createVNode("div", null, [
                            createVNode("p", { class: "text-sm font-medium text-white" }, toDisplayString(manager.name), 1),
                            createVNode("p", { class: "text-xs text-white" }, toDisplayString(manager.accounts) + " accounts", 1)
                          ])
                        ]),
                        createVNode("div", { class: "text-right" }, [
                          createVNode("div", { class: "flex items-center space-x-2" }, [
                            createVNode("div", { class: "w-20 bg-gray-200 rounded-full h-2" }, [
                              createVNode("div", {
                                class: "bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full",
                                style: { width: `${manager.percentage}%` }
                              }, null, 4)
                            ]),
                            createVNode("span", { class: "text-sm font-semibold text-white" }, toDisplayString(manager.feedbackCount), 1)
                          ]),
                          createVNode("p", { class: "text-xs text-white mt-1" }, [
                            createVNode("span", { class: "text-white" }, toDisplayString(manager.weeklyGrowth >= 0 ? "+" : "") + toDisplayString(manager.weeklyGrowth) + "% vs last week", 1)
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
        _push(`</div>`);
        _push(ssrRenderComponent(_component_AppCard, { class: "mb-8" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4" data-v-9fe621d0${_scopeId}>Daily Feedback This Week</h3><div class="flex items-end justify-between space-x-2 h-32" data-v-9fe621d0${_scopeId}><!--[-->`);
              ssrRenderList(unref(weeklyTimeline), (day) => {
                _push2(`<div class="flex-1 flex flex-col items-center" data-v-9fe621d0${_scopeId}><div class="w-full bg-gray-200 rounded-t-md flex-1 flex items-end" data-v-9fe621d0${_scopeId}><div class="${ssrRenderClass([day.isToday ? "bg-gradient-to-t from-blue-500 to-blue-400" : "bg-gradient-to-t from-gray-400 to-gray-300", "w-full rounded-t-md transition-all duration-500 ease-out"])}" style="${ssrRenderStyle({ height: `${day.percentage}%` })}" data-v-9fe621d0${_scopeId}></div></div><div class="mt-2 text-center" data-v-9fe621d0${_scopeId}><p class="text-xs font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(day.count)}</p><p class="text-xs text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(day.day)}</p></div></div>`);
              });
              _push2(`<!--]--></div></div>`);
            } else {
              return [
                createVNode("div", { class: "p-6" }, [
                  createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Daily Feedback This Week"),
                  createVNode("div", { class: "flex items-end justify-between space-x-2 h-32" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(weeklyTimeline), (day) => {
                      return openBlock(), createBlock("div", {
                        key: day.day,
                        class: "flex-1 flex flex-col items-center"
                      }, [
                        createVNode("div", { class: "w-full bg-gray-200 rounded-t-md flex-1 flex items-end" }, [
                          createVNode("div", {
                            class: ["w-full rounded-t-md transition-all duration-500 ease-out", day.isToday ? "bg-gradient-to-t from-blue-500 to-blue-400" : "bg-gradient-to-t from-gray-400 to-gray-300"],
                            style: { height: `${day.percentage}%` }
                          }, null, 6)
                        ]),
                        createVNode("div", { class: "mt-2 text-center" }, [
                          createVNode("p", { class: "text-xs font-medium text-white" }, toDisplayString(day.count), 1),
                          createVNode("p", { class: "text-xs text-white" }, toDisplayString(day.day), 1)
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
              _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><div class="flex items-center justify-between mb-4" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white" data-v-9fe621d0${_scopeId}>🎯 Meeting Ready - Key Points</h3><button class="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors" data-v-9fe621d0${_scopeId}> Copy for Meeting </button></div><div class="grid grid-cols-1 md:grid-cols-2 gap-6" data-v-9fe621d0${_scopeId}><div data-v-9fe621d0${_scopeId}><h4 class="text-sm font-semibold text-green-700 mb-3" data-v-9fe621d0${_scopeId}>✅ This Week&#39;s Wins</h4><ul class="space-y-2" data-v-9fe621d0${_scopeId}><!--[-->`);
              ssrRenderList(unref(weeklyInsights).wins, (win) => {
                _push2(`<li class="text-sm text-white flex items-start" data-v-9fe621d0${_scopeId}><span class="text-green-500 mr-2" data-v-9fe621d0${_scopeId}>•</span> ${ssrInterpolate(win)}</li>`);
              });
              _push2(`<!--]--></ul></div><div data-v-9fe621d0${_scopeId}><h4 class="text-sm font-semibold text-orange-700 mb-3" data-v-9fe621d0${_scopeId}>⚡ Action Items</h4><ul class="space-y-2" data-v-9fe621d0${_scopeId}><!--[-->`);
              ssrRenderList(unref(weeklyInsights).actions, (action) => {
                _push2(`<li class="text-sm text-white flex items-start" data-v-9fe621d0${_scopeId}><span class="text-orange-500 mr-2" data-v-9fe621d0${_scopeId}>•</span> ${ssrInterpolate(action)}</li>`);
              });
              _push2(`<!--]--></ul></div></div></div>`);
            } else {
              return [
                createVNode("div", { class: "p-6" }, [
                  createVNode("div", { class: "flex items-center justify-between mb-4" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white" }, "🎯 Meeting Ready - Key Points"),
                    createVNode("button", { class: "text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-100 transition-colors" }, " Copy for Meeting ")
                  ]),
                  createVNode("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-6" }, [
                    createVNode("div", null, [
                      createVNode("h4", { class: "text-sm font-semibold text-green-700 mb-3" }, "✅ This Week's Wins"),
                      createVNode("ul", { class: "space-y-2" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(weeklyInsights).wins, (win) => {
                          return openBlock(), createBlock("li", {
                            key: win,
                            class: "text-sm text-white flex items-start"
                          }, [
                            createVNode("span", { class: "text-green-500 mr-2" }, "•"),
                            createTextVNode(" " + toDisplayString(win), 1)
                          ]);
                        }), 128))
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("h4", { class: "text-sm font-semibold text-orange-700 mb-3" }, "⚡ Action Items"),
                      createVNode("ul", { class: "space-y-2" }, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(weeklyInsights).actions, (action) => {
                          return openBlock(), createBlock("li", {
                            key: action,
                            class: "text-sm text-white flex items-start"
                          }, [
                            createVNode("span", { class: "text-orange-500 mr-2" }, "•"),
                            createTextVNode(" " + toDisplayString(action), 1)
                          ]);
                        }), 128))
                      ])
                    ])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(feedbackData).length > 0) {
          _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" data-v-9fe621d0>`);
          _push(ssrRenderComponent(_component_AppCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4" data-v-9fe621d0${_scopeId}>Top Keywords</h3><div class="space-y-3" data-v-9fe621d0${_scopeId}><!--[-->`);
                ssrRenderList(unref(topKeywords), (keyword) => {
                  _push2(`<div class="flex items-center justify-between" data-v-9fe621d0${_scopeId}><span class="text-sm font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(keyword.word)}</span><div class="flex items-center space-x-2" data-v-9fe621d0${_scopeId}><div class="w-16 bg-gray-200 rounded-full h-2" data-v-9fe621d0${_scopeId}><div class="bg-blue-600 h-2 rounded-full" style="${ssrRenderStyle({ width: `${keyword.percentage}%` })}" data-v-9fe621d0${_scopeId}></div></div><span class="text-xs text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(keyword.count)}</span></div></div>`);
                });
                _push2(`<!--]--></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Top Keywords"),
                    createVNode("div", { class: "space-y-3" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(topKeywords), (keyword) => {
                        return openBlock(), createBlock("div", {
                          key: keyword.word,
                          class: "flex items-center justify-between"
                        }, [
                          createVNode("span", { class: "text-sm font-medium text-white" }, toDisplayString(keyword.word), 1),
                          createVNode("div", { class: "flex items-center space-x-2" }, [
                            createVNode("div", { class: "w-16 bg-gray-200 rounded-full h-2" }, [
                              createVNode("div", {
                                class: "bg-blue-600 h-2 rounded-full",
                                style: { width: `${keyword.percentage}%` }
                              }, null, 4)
                            ]),
                            createVNode("span", { class: "text-xs text-white" }, toDisplayString(keyword.count), 1)
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
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4" data-v-9fe621d0${_scopeId}>Most Active Accounts</h3><div class="space-y-3" data-v-9fe621d0${_scopeId}><!--[-->`);
                ssrRenderList(unref(topAccounts), (account) => {
                  _push2(`<div class="flex items-center justify-between" data-v-9fe621d0${_scopeId}><div class="flex items-center space-x-3" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center" data-v-9fe621d0${_scopeId}><span class="text-xs font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(account.name.charAt(0))}</span></div><span class="text-sm font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(account.name)}</span></div><span class="text-sm text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(account.count)} feedback</span></div>`);
                });
                _push2(`<!--]--></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Most Active Accounts"),
                    createVNode("div", { class: "space-y-3" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(topAccounts), (account) => {
                        return openBlock(), createBlock("div", {
                          key: account.name,
                          class: "flex items-center justify-between"
                        }, [
                          createVNode("div", { class: "flex items-center space-x-3" }, [
                            createVNode("div", { class: "flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center" }, [
                              createVNode("span", { class: "text-xs font-medium text-white" }, toDisplayString(account.name.charAt(0)), 1)
                            ]),
                            createVNode("span", { class: "text-sm font-medium text-white" }, toDisplayString(account.name), 1)
                          ]),
                          createVNode("span", { class: "text-sm text-white" }, toDisplayString(account.count) + " feedback", 1)
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
                _push2(`<div class="p-6" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white mb-4" data-v-9fe621d0${_scopeId}>Key Insights</h3><div class="space-y-3" data-v-9fe621d0${_scopeId}><div class="flex items-start space-x-3" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-2 h-2 bg-green-400 rounded-full mt-2" data-v-9fe621d0${_scopeId}></div></div><p class="text-sm text-white" data-v-9fe621d0${_scopeId}>Positive sentiment increased by ${ssrInterpolate(unref(weeklyGrowth))}% this week</p></div><div class="flex items-start space-x-3" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-2 h-2 bg-blue-400 rounded-full mt-2" data-v-9fe621d0${_scopeId}></div></div><p class="text-sm text-white" data-v-9fe621d0${_scopeId}>Most discussed topic: ${ssrInterpolate(unref(topKeywords)[0]?.word || "Platform usability")}</p></div><div class="flex items-start space-x-3" data-v-9fe621d0${_scopeId}><div class="flex-shrink-0" data-v-9fe621d0${_scopeId}><div class="w-2 h-2 bg-yellow-400 rounded-full mt-2" data-v-9fe621d0${_scopeId}></div></div><p class="text-sm text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(topAccounts)[0]?.name || "Top account")} is most active this period</p></div></div></div>`);
              } else {
                return [
                  createVNode("div", { class: "p-6" }, [
                    createVNode("h3", { class: "text-lg font-medium text-white mb-4" }, "Key Insights"),
                    createVNode("div", { class: "space-y-3" }, [
                      createVNode("div", { class: "flex items-start space-x-3" }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          createVNode("div", { class: "w-2 h-2 bg-green-400 rounded-full mt-2" })
                        ]),
                        createVNode("p", { class: "text-sm text-white" }, "Positive sentiment increased by " + toDisplayString(unref(weeklyGrowth)) + "% this week", 1)
                      ]),
                      createVNode("div", { class: "flex items-start space-x-3" }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          createVNode("div", { class: "w-2 h-2 bg-blue-400 rounded-full mt-2" })
                        ]),
                        createVNode("p", { class: "text-sm text-white" }, "Most discussed topic: " + toDisplayString(unref(topKeywords)[0]?.word || "Platform usability"), 1)
                      ]),
                      createVNode("div", { class: "flex items-start space-x-3" }, [
                        createVNode("div", { class: "flex-shrink-0" }, [
                          createVNode("div", { class: "w-2 h-2 bg-yellow-400 rounded-full mt-2" })
                        ]),
                        createVNode("p", { class: "text-sm text-white" }, toDisplayString(unref(topAccounts)[0]?.name || "Top account") + " is most active this period", 1)
                      ])
                    ])
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div style="${ssrRenderStyle(unref(activeTab) === "feedback" ? null : { display: "none" })}" data-v-9fe621d0>`);
        if (unref(selectedSentiment) && unref(filteredFeedback).length > 0) {
          _push(`<div class="mb-8" data-sentiment-filter data-v-9fe621d0>`);
          _push(ssrRenderComponent(_component_AppCard, null, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="px-6 py-4 border-b border-gray-200" data-v-9fe621d0${_scopeId}><div class="flex items-center justify-between" data-v-9fe621d0${_scopeId}><h3 class="text-lg font-medium text-white" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(selectedSentiment))} Feedback (${ssrInterpolate(unref(filteredFeedback).length)} items) </h3><button class="text-sm text-white hover:text-white bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors" data-v-9fe621d0${_scopeId}> Clear Filter </button></div></div><div class="p-6" data-v-9fe621d0${_scopeId}><div class="grid gap-4" data-v-9fe621d0${_scopeId}><!--[-->`);
                ssrRenderList(unref(paginatedFeedback), (item) => {
                  _push2(`<div class="${ssrRenderClass([{
                    "border-green-500/50": item.sentiment === "Positive",
                    "border-yellow-500/50": item.sentiment === "Neutral",
                    "border-red-500/50": item.sentiment === "Negative"
                  }, "border rounded-lg p-4 hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm"])}" data-v-9fe621d0${_scopeId}><div class="flex items-start justify-between" data-v-9fe621d0${_scopeId}><div class="flex-1" data-v-9fe621d0${_scopeId}><p class="text-sm text-white leading-relaxed" data-v-9fe621d0${_scopeId}>${ssrInterpolate(item.feedback)}</p><div class="flex items-center space-x-4 mt-3 text-xs text-white" data-v-9fe621d0${_scopeId}><span class="flex items-center" data-v-9fe621d0${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" data-v-9fe621d0${_scopeId}></path></svg> ${ssrInterpolate(item.accountName)}</span><span class="flex items-center" data-v-9fe621d0${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" data-v-9fe621d0${_scopeId}></path></svg> ${ssrInterpolate(item.accountOwner || "Unassigned")}</span><span class="flex items-center" data-v-9fe621d0${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" data-v-9fe621d0${_scopeId}></path></svg> ${ssrInterpolate(formatDate(item.createdDate))}</span>`);
                  if (item.feedbackDirectedTo) {
                    _push2(`<span class="flex items-center" data-v-9fe621d0${_scopeId}><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-9fe621d0${_scopeId}></path></svg> Directed to: ${ssrInterpolate(item.feedbackDirectedTo)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></div><div class="ml-4 flex-shrink-0" data-v-9fe621d0${_scopeId}><span class="${ssrRenderClass([{
                    "bg-green-100 text-green-800": item.sentiment === "Positive",
                    "bg-yellow-100 text-yellow-800": item.sentiment === "Neutral",
                    "bg-red-100 text-red-800": item.sentiment === "Negative"
                  }, "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"])}" data-v-9fe621d0${_scopeId}>${ssrInterpolate(item.sentiment)}</span></div></div></div>`);
                });
                _push2(`<!--]--></div>`);
                if (unref(filteredFeedback).length > unref(itemsPerPage)) {
                  _push2(`<div class="flex items-center justify-between border-t border-white/10 bg-white/5 backdrop-blur-sm rounded-b-lg px-4 py-4 sm:px-6 mt-6" data-v-9fe621d0${_scopeId}><div class="flex flex-1 justify-between sm:hidden" data-v-9fe621d0${_scopeId}><button${ssrIncludeBooleanAttr(unref(currentPage) === 1) ? " disabled" : ""} class="relative inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200" data-v-9fe621d0${_scopeId}><svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" data-v-9fe621d0${_scopeId}></path></svg> Previous </button><button${ssrIncludeBooleanAttr(unref(currentPage) >= unref(totalPages)) ? " disabled" : ""} class="relative ml-3 inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200" data-v-9fe621d0${_scopeId}> Next <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" data-v-9fe621d0${_scopeId}></path></svg></button></div><div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between" data-v-9fe621d0${_scopeId}><div data-v-9fe621d0${_scopeId}><p class="text-sm text-white" data-v-9fe621d0${_scopeId}> Showing <span class="font-semibold text-ontop-coral-400" data-v-9fe621d0${_scopeId}>${ssrInterpolate((unref(currentPage) - 1) * unref(itemsPerPage) + 1)}</span> to <span class="font-semibold text-ontop-coral-400" data-v-9fe621d0${_scopeId}>${ssrInterpolate(Math.min(unref(currentPage) * unref(itemsPerPage), unref(filteredFeedback).length))}</span> of <span class="font-semibold text-ontop-coral-400" data-v-9fe621d0${_scopeId}>${ssrInterpolate(unref(filteredFeedback).length)}</span> results </p></div><div data-v-9fe621d0${_scopeId}><nav class="isolate inline-flex -space-x-px rounded-lg shadow-lg" aria-label="Pagination" data-v-9fe621d0${_scopeId}><button${ssrIncludeBooleanAttr(unref(currentPage) === 1) ? " disabled" : ""} class="relative inline-flex items-center rounded-l-lg px-3 py-2 text-white bg-white/10 border border-white/20 hover:bg-white/20 focus:z-20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200" data-v-9fe621d0${_scopeId}><span class="sr-only" data-v-9fe621d0${_scopeId}>Previous</span><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-v-9fe621d0${_scopeId}><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" data-v-9fe621d0${_scopeId}></path></svg></button><!--[-->`);
                  ssrRenderList(unref(visiblePages), (page) => {
                    _push2(`<button class="${ssrRenderClass([page === unref(currentPage) ? "bg-gradient-cta text-white shadow-lg" : "text-white bg-white/10 hover:bg-white/20", "relative inline-flex items-center px-4 py-2 text-sm font-semibold border border-white/20 focus:z-20 transition-all duration-200"])}" data-v-9fe621d0${_scopeId}>${ssrInterpolate(page)}</button>`);
                  });
                  _push2(`<!--]--><button${ssrIncludeBooleanAttr(unref(currentPage) >= unref(totalPages)) ? " disabled" : ""} class="relative inline-flex items-center rounded-r-lg px-3 py-2 text-white bg-white/10 border border-white/20 hover:bg-white/20 focus:z-20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200" data-v-9fe621d0${_scopeId}><span class="sr-only" data-v-9fe621d0${_scopeId}>Next</span><svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-v-9fe621d0${_scopeId}><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" data-v-9fe621d0${_scopeId}></path></svg></button></nav></div></div></div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "px-6 py-4 border-b border-gray-200" }, [
                    createVNode("div", { class: "flex items-center justify-between" }, [
                      createVNode("h3", { class: "text-lg font-medium text-white" }, toDisplayString(unref(selectedSentiment)) + " Feedback (" + toDisplayString(unref(filteredFeedback).length) + " items) ", 1),
                      createVNode("button", {
                        onClick: clearFilter,
                        class: "text-sm text-white hover:text-white bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md transition-colors"
                      }, " Clear Filter ")
                    ])
                  ]),
                  createVNode("div", { class: "p-6" }, [
                    createVNode("div", { class: "grid gap-4" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(paginatedFeedback), (item) => {
                        return openBlock(), createBlock("div", {
                          key: item.id,
                          class: ["border rounded-lg p-4 hover:shadow-xl transition-shadow bg-white/5 backdrop-blur-sm", {
                            "border-green-500/50": item.sentiment === "Positive",
                            "border-yellow-500/50": item.sentiment === "Neutral",
                            "border-red-500/50": item.sentiment === "Negative"
                          }]
                        }, [
                          createVNode("div", { class: "flex items-start justify-between" }, [
                            createVNode("div", { class: "flex-1" }, [
                              createVNode("p", { class: "text-sm text-white leading-relaxed" }, toDisplayString(item.feedback), 1),
                              createVNode("div", { class: "flex items-center space-x-4 mt-3 text-xs text-white" }, [
                                createVNode("span", { class: "flex items-center" }, [
                                  (openBlock(), createBlock("svg", {
                                    class: "w-3 h-3 mr-1",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor"
                                  }, [
                                    createVNode("path", {
                                      "stroke-linecap": "round",
                                      "stroke-linejoin": "round",
                                      "stroke-width": "2",
                                      d: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                                    })
                                  ])),
                                  createTextVNode(" " + toDisplayString(item.accountName), 1)
                                ]),
                                createVNode("span", { class: "flex items-center" }, [
                                  (openBlock(), createBlock("svg", {
                                    class: "w-3 h-3 mr-1",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor"
                                  }, [
                                    createVNode("path", {
                                      "stroke-linecap": "round",
                                      "stroke-linejoin": "round",
                                      "stroke-width": "2",
                                      d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    })
                                  ])),
                                  createTextVNode(" " + toDisplayString(item.accountOwner || "Unassigned"), 1)
                                ]),
                                createVNode("span", { class: "flex items-center" }, [
                                  (openBlock(), createBlock("svg", {
                                    class: "w-3 h-3 mr-1",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor"
                                  }, [
                                    createVNode("path", {
                                      "stroke-linecap": "round",
                                      "stroke-linejoin": "round",
                                      "stroke-width": "2",
                                      d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    })
                                  ])),
                                  createTextVNode(" " + toDisplayString(formatDate(item.createdDate)), 1)
                                ]),
                                item.feedbackDirectedTo ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "flex items-center"
                                }, [
                                  (openBlock(), createBlock("svg", {
                                    class: "w-3 h-3 mr-1",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    stroke: "currentColor"
                                  }, [
                                    createVNode("path", {
                                      "stroke-linecap": "round",
                                      "stroke-linejoin": "round",
                                      "stroke-width": "2",
                                      d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    })
                                  ])),
                                  createTextVNode(" Directed to: " + toDisplayString(item.feedbackDirectedTo), 1)
                                ])) : createCommentVNode("", true)
                              ])
                            ]),
                            createVNode("div", { class: "ml-4 flex-shrink-0" }, [
                              createVNode("span", {
                                class: ["inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", {
                                  "bg-green-100 text-green-800": item.sentiment === "Positive",
                                  "bg-yellow-100 text-yellow-800": item.sentiment === "Neutral",
                                  "bg-red-100 text-red-800": item.sentiment === "Negative"
                                }]
                              }, toDisplayString(item.sentiment), 3)
                            ])
                          ])
                        ], 2);
                      }), 128))
                    ]),
                    unref(filteredFeedback).length > unref(itemsPerPage) ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "flex items-center justify-between border-t border-white/10 bg-white/5 backdrop-blur-sm rounded-b-lg px-4 py-4 sm:px-6 mt-6"
                    }, [
                      createVNode("div", { class: "flex flex-1 justify-between sm:hidden" }, [
                        createVNode("button", {
                          onClick: ($event) => currentPage.value--,
                          disabled: unref(currentPage) === 1,
                          class: "relative inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                        }, [
                          (openBlock(), createBlock("svg", {
                            class: "w-4 h-4 mr-2",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M15 19l-7-7 7-7"
                            })
                          ])),
                          createTextVNode(" Previous ")
                        ], 8, ["onClick", "disabled"]),
                        createVNode("button", {
                          onClick: ($event) => currentPage.value++,
                          disabled: unref(currentPage) >= unref(totalPages),
                          class: "relative ml-3 inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                        }, [
                          createTextVNode(" Next "),
                          (openBlock(), createBlock("svg", {
                            class: "w-4 h-4 ml-2",
                            fill: "none",
                            viewBox: "0 0 24 24",
                            stroke: "currentColor"
                          }, [
                            createVNode("path", {
                              "stroke-linecap": "round",
                              "stroke-linejoin": "round",
                              "stroke-width": "2",
                              d: "M9 5l7 7-7 7"
                            })
                          ]))
                        ], 8, ["onClick", "disabled"])
                      ]),
                      createVNode("div", { class: "hidden sm:flex sm:flex-1 sm:items-center sm:justify-between" }, [
                        createVNode("div", null, [
                          createVNode("p", { class: "text-sm text-white" }, [
                            createTextVNode(" Showing "),
                            createVNode("span", { class: "font-semibold text-ontop-coral-400" }, toDisplayString((unref(currentPage) - 1) * unref(itemsPerPage) + 1), 1),
                            createTextVNode(" to "),
                            createVNode("span", { class: "font-semibold text-ontop-coral-400" }, toDisplayString(Math.min(unref(currentPage) * unref(itemsPerPage), unref(filteredFeedback).length)), 1),
                            createTextVNode(" of "),
                            createVNode("span", { class: "font-semibold text-ontop-coral-400" }, toDisplayString(unref(filteredFeedback).length), 1),
                            createTextVNode(" results ")
                          ])
                        ]),
                        createVNode("div", null, [
                          createVNode("nav", {
                            class: "isolate inline-flex -space-x-px rounded-lg shadow-lg",
                            "aria-label": "Pagination"
                          }, [
                            createVNode("button", {
                              onClick: ($event) => currentPage.value--,
                              disabled: unref(currentPage) === 1,
                              class: "relative inline-flex items-center rounded-l-lg px-3 py-2 text-white bg-white/10 border border-white/20 hover:bg-white/20 focus:z-20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                            }, [
                              createVNode("span", { class: "sr-only" }, "Previous"),
                              (openBlock(), createBlock("svg", {
                                class: "h-5 w-5",
                                viewBox: "0 0 20 20",
                                fill: "currentColor",
                                "aria-hidden": "true"
                              }, [
                                createVNode("path", {
                                  "fill-rule": "evenodd",
                                  d: "M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z",
                                  "clip-rule": "evenodd"
                                })
                              ]))
                            ], 8, ["onClick", "disabled"]),
                            (openBlock(true), createBlock(Fragment, null, renderList(unref(visiblePages), (page) => {
                              return openBlock(), createBlock("button", {
                                key: page,
                                onClick: ($event) => currentPage.value = page,
                                class: [page === unref(currentPage) ? "bg-gradient-cta text-white shadow-lg" : "text-white bg-white/10 hover:bg-white/20", "relative inline-flex items-center px-4 py-2 text-sm font-semibold border border-white/20 focus:z-20 transition-all duration-200"]
                              }, toDisplayString(page), 11, ["onClick"]);
                            }), 128)),
                            createVNode("button", {
                              onClick: ($event) => currentPage.value++,
                              disabled: unref(currentPage) >= unref(totalPages),
                              class: "relative inline-flex items-center rounded-r-lg px-3 py-2 text-white bg-white/10 border border-white/20 hover:bg-white/20 focus:z-20 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                            }, [
                              createVNode("span", { class: "sr-only" }, "Next"),
                              (openBlock(), createBlock("svg", {
                                class: "h-5 w-5",
                                viewBox: "0 0 20 20",
                                fill: "currentColor",
                                "aria-hidden": "true"
                              }, [
                                createVNode("path", {
                                  "fill-rule": "evenodd",
                                  d: "M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z",
                                  "clip-rule": "evenodd"
                                })
                              ]))
                            ], 8, ["onClick", "disabled"])
                          ])
                        ])
                      ])
                    ])) : createCommentVNode("", true)
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(todaysFeedback).length > 0 && !unref(selectedSentiment) && !unref(hasActiveFilters)) {
          _push(`<div class="bg-white dark:bg-slate-800 rounded-lg shadow mb-8" data-v-9fe621d0><div class="px-6 py-4 border-b border-gray-200 dark:border-slate-600" data-v-9fe621d0><div class="flex items-center justify-between" data-v-9fe621d0><h3 class="text-lg font-medium text-white" data-v-9fe621d0>📅 Today&#39;s Feedback</h3><span class="text-sm text-white" data-v-9fe621d0>${ssrInterpolate(unref(todaysFeedback).length)} item${ssrInterpolate(unref(todaysFeedback).length !== 1 ? "s" : "")} today </span></div></div><div class="p-6 space-y-4" data-v-9fe621d0><!--[-->`);
          ssrRenderList(unref(todaysFeedback), (item) => {
            _push(`<div class="p-4 border border-blue-200 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/10" data-v-9fe621d0><div class="flex items-start justify-between mb-2" data-v-9fe621d0><div class="flex items-center space-x-2" data-v-9fe621d0><span class="text-sm font-medium text-white" data-v-9fe621d0>${ssrInterpolate(item.accountName || "Unknown Account")}</span><span class="${ssrRenderClass([{
              "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400": item.sentiment === "Positive",
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400": item.sentiment === "Neutral",
              "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400": item.sentiment === "Negative"
            }, "px-2 py-1 rounded-full text-xs font-medium"])}" data-v-9fe621d0>${ssrInterpolate(item.sentiment)}</span></div><div class="flex items-center space-x-2" data-v-9fe621d0><span class="text-xs text-white" data-v-9fe621d0>${ssrInterpolate(formatTime(item.createdDate))}</span><button class="text-white/70 hover:text-ontop-coral-400 transition-colors duration-200" title="Copy feedback" data-v-9fe621d0><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-9fe621d0></path></svg></button></div></div><p class="text-white dark:text-slate-300 text-sm" data-v-9fe621d0>${ssrInterpolate(item.feedback)}</p><div class="mt-2 flex items-center space-x-4 text-xs text-white" data-v-9fe621d0><span data-v-9fe621d0>Account Manager: ${ssrInterpolate(item.accountOwner || "Unassigned")}</span>`);
            if (item.feedbackDirectedTo) {
              _push(`<span data-v-9fe621d0>Directed to: ${ssrInterpolate(item.feedbackDirectedTo)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(feedbackData).length > 0 && !unref(selectedSentiment)) {
          _push(`<div class="bg-white dark:bg-slate-800 rounded-lg shadow" data-v-9fe621d0><div class="px-6 py-4 border-b border-gray-200" data-v-9fe621d0><h3 class="text-lg font-medium text-white" data-v-9fe621d0>Recent Feedback</h3></div><div class="p-6 space-y-4" data-v-9fe621d0><!--[-->`);
          ssrRenderList(unref(recentFeedback), (item) => {
            _push(`<div class="${ssrRenderClass([{
              "border-green-400": item.sentiment === "Positive",
              "border-yellow-400": item.sentiment === "Neutral",
              "border-red-400": item.sentiment === "Negative"
            }, "border-l-4 pl-4 py-2"])}" data-v-9fe621d0><p class="text-sm text-white" data-v-9fe621d0>${ssrInterpolate(item.feedback)}</p><div class="flex items-center justify-between mt-1" data-v-9fe621d0><p class="text-xs text-white" data-v-9fe621d0>${ssrInterpolate(item.accountName)} • ${ssrInterpolate(formatDate(item.createdDate))} • <span class="${ssrRenderClass({
              "text-green-600": item.sentiment === "Positive",
              "text-yellow-600": item.sentiment === "Neutral",
              "text-red-600": item.sentiment === "Negative"
            })}" data-v-9fe621d0>${ssrInterpolate(item.sentiment)}</span></p><button class="p-1 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors" title="Copy feedback" data-v-9fe621d0><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-9fe621d0></path></svg></button></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(lastUpdated)) {
          _push(`<div class="text-center text-sm text-white mt-6" data-v-9fe621d0> Last updated: ${ssrInterpolate(formatDate(unref(lastUpdated)))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div id="ai-report-generator" class="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-purple-300 dark:border-purple-700 scroll-mt-24" data-v-9fe621d0><div class="flex items-center justify-between mb-6" data-v-9fe621d0><div data-v-9fe621d0><h3 class="text-xl font-bold text-white flex items-center" data-v-9fe621d0><div class="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg mr-3" data-v-9fe621d0><svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-9fe621d0></path></svg></div> AI Intelligence Report Generator </h3><p class="text-white text-sm mt-1 ml-13" data-v-9fe621d0>Generate comprehensive reports with AI-powered insights</p></div></div><div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700 mb-6" data-v-9fe621d0><div class="flex items-center justify-between mb-4" data-v-9fe621d0><h4 class="text-sm font-bold text-white" data-v-9fe621d0>Smart Filters</h4>`);
        if (unref(hasAIFilters)) {
          _push(`<button class="text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-3 py-1 rounded-lg transition-all duration-200 shadow hover:shadow-lg" data-v-9fe621d0> ✕ Clear Filters </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-v-9fe621d0><div data-v-9fe621d0><label class="block text-sm font-medium text-white dark:text-slate-300 mb-2" data-v-9fe621d0>Account Manager</label><select class="w-full border border-white/10 bg-ontop-navy-dark text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" data-v-9fe621d0><option value="" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).accountManager) ? ssrLooseContain(unref(aiFilters).accountManager, "") : ssrLooseEqual(unref(aiFilters).accountManager, "")) ? " selected" : ""}>All Managers</option><!--[-->`);
        ssrRenderList(unref(uniqueAccountManagers), (manager) => {
          _push(`<option${ssrRenderAttr("value", manager.name)} data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).accountManager) ? ssrLooseContain(unref(aiFilters).accountManager, manager.name) : ssrLooseEqual(unref(aiFilters).accountManager, manager.name)) ? " selected" : ""}>${ssrInterpolate(manager.name)} (${ssrInterpolate(manager.count)}) </option>`);
        });
        _push(`<!--]--></select></div><div data-v-9fe621d0><label class="block text-sm font-medium text-white dark:text-slate-300 mb-2" data-v-9fe621d0>Date Period</label><select class="w-full border border-white/10 bg-ontop-navy-dark text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" data-v-9fe621d0><option value="" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "") : ssrLooseEqual(unref(aiFilters).datePeriod, "")) ? " selected" : ""}>All Time</option><option value="today" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "today") : ssrLooseEqual(unref(aiFilters).datePeriod, "today")) ? " selected" : ""}>Today</option><option value="yesterday" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "yesterday") : ssrLooseEqual(unref(aiFilters).datePeriod, "yesterday")) ? " selected" : ""}>Yesterday</option><option value="this-week" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "this-week") : ssrLooseEqual(unref(aiFilters).datePeriod, "this-week")) ? " selected" : ""}>This Week</option><option value="last-week" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "last-week") : ssrLooseEqual(unref(aiFilters).datePeriod, "last-week")) ? " selected" : ""}>Last Week</option><option value="this-month" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "this-month") : ssrLooseEqual(unref(aiFilters).datePeriod, "this-month")) ? " selected" : ""}>This Month</option><option value="last-month" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "last-month") : ssrLooseEqual(unref(aiFilters).datePeriod, "last-month")) ? " selected" : ""}>Last Month</option><option value="last-30-days" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "last-30-days") : ssrLooseEqual(unref(aiFilters).datePeriod, "last-30-days")) ? " selected" : ""}>Last 30 Days</option><option value="last-90-days" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "last-90-days") : ssrLooseEqual(unref(aiFilters).datePeriod, "last-90-days")) ? " selected" : ""}>Last 90 Days</option><option value="last-180-days" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "last-180-days") : ssrLooseEqual(unref(aiFilters).datePeriod, "last-180-days")) ? " selected" : ""}>Last 180 Days</option><option value="this-year" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).datePeriod) ? ssrLooseContain(unref(aiFilters).datePeriod, "this-year") : ssrLooseEqual(unref(aiFilters).datePeriod, "this-year")) ? " selected" : ""}>This Year</option></select></div><div data-v-9fe621d0><label class="block text-sm font-medium text-white dark:text-slate-300 mb-2" data-v-9fe621d0>Feedback Directed To</label><select class="w-full border border-white/10 bg-ontop-navy-dark text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" data-v-9fe621d0><option value="" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).feedbackDirectedTo) ? ssrLooseContain(unref(aiFilters).feedbackDirectedTo, "") : ssrLooseEqual(unref(aiFilters).feedbackDirectedTo, "")) ? " selected" : ""}>All Teams</option><!--[-->`);
        ssrRenderList(unref(uniqueFeedbackDirections), (team) => {
          _push(`<option${ssrRenderAttr("value", team.name)} data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).feedbackDirectedTo) ? ssrLooseContain(unref(aiFilters).feedbackDirectedTo, team.name) : ssrLooseEqual(unref(aiFilters).feedbackDirectedTo, team.name)) ? " selected" : ""}>${ssrInterpolate(team.name)} (${ssrInterpolate(team.count)}) </option>`);
        });
        _push(`<!--]--></select></div><div data-v-9fe621d0><label class="block text-sm font-medium text-white dark:text-slate-300 mb-2" data-v-9fe621d0>Category</label><select class="w-full border border-white/10 bg-ontop-navy-dark text-white rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-ontop-coral-500 focus:border-ontop-coral-500 transition-all" data-v-9fe621d0><option value="" data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).category) ? ssrLooseContain(unref(aiFilters).category, "") : ssrLooseEqual(unref(aiFilters).category, "")) ? " selected" : ""}>All Categories</option><!--[-->`);
        ssrRenderList(unref(uniqueCategories), (cat) => {
          _push(`<option${ssrRenderAttr("value", cat.name)} data-v-9fe621d0${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).category) ? ssrLooseContain(unref(aiFilters).category, cat.name) : ssrLooseEqual(unref(aiFilters).category, cat.name)) ? " selected" : ""}>${ssrInterpolate(cat.name)} (${ssrInterpolate(cat.count)}) </option>`);
        });
        _push(`<!--]--></select></div><div class="md:col-span-2" data-v-9fe621d0><label class="block text-sm font-medium text-white dark:text-slate-300 mb-2" data-v-9fe621d0>Platform Client ID</label><div class="relative" data-v-9fe621d0><input${ssrRenderAttr("value", unref(aiFilters).platformClientId)} type="text" placeholder="Search by Platform Client ID..." class="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-white rounded-md px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500" data-v-9fe621d0><div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none" data-v-9fe621d0><svg class="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-9fe621d0></path></svg></div></div></div><div class="md:col-span-2" data-v-9fe621d0><label class="flex items-start space-x-3 cursor-pointer group" data-v-9fe621d0><div class="relative flex items-center" data-v-9fe621d0><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(aiFilters).includeTranscripts) ? ssrLooseContain(unref(aiFilters).includeTranscripts, null) : unref(aiFilters).includeTranscripts) ? " checked" : ""} class="sr-only peer" data-v-9fe621d0><div class="w-11 h-6 bg-ontop-navy-light peer-focus:ring-2 peer-focus:ring-ontop-coral-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[&#39;&#39;] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600" data-v-9fe621d0></div></div><div class="flex-1" data-v-9fe621d0><div class="flex items-center gap-2" data-v-9fe621d0><span class="text-sm font-medium text-white" data-v-9fe621d0>🎙️ Include Call Transcripts</span>`);
        if (unref(aiFilters).includeTranscripts) {
          _push(`<span class="px-2 py-0.5 text-xs rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30" data-v-9fe621d0>Active</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><p class="text-xs text-white/60 mt-1" data-v-9fe621d0> Analyze verbal feedback from DIIO call recordings (last 30 days) alongside written feedback for comprehensive insights </p></div></label></div><div class="md:col-span-2 flex items-end" data-v-9fe621d0><button${ssrIncludeBooleanAttr(unref(generatingAIReport) || unref(feedbackData).length === 0) ? " disabled" : ""} class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"${ssrRenderAttr("title", unref(feedbackData).length === 0 ? "No feedback data loaded" : "Generate comprehensive AI report with current filters")} data-v-9fe621d0>`);
        if (!unref(generatingAIReport)) {
          _push(`<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-9fe621d0></path></svg>`);
        } else {
          _push(`<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" data-v-9fe621d0></div>`);
        }
        _push(` ${ssrInterpolate(unref(generatingAIReport) ? "Generating Report..." : "Generate AI Report")}</button></div></div>`);
        if (unref(hasAIFilters)) {
          _push(`<div class="mt-4 flex flex-wrap gap-2" data-v-9fe621d0><span class="text-sm text-white" data-v-9fe621d0>Active filters:</span>`);
          if (unref(aiFilters).accountManager) {
            _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200" data-v-9fe621d0> Manager: ${ssrInterpolate(unref(aiFilters).accountManager)} <button class="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100" data-v-9fe621d0>×</button></span>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(aiFilters).datePeriod) {
            _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200" data-v-9fe621d0> Period: ${ssrInterpolate(getDatePeriodLabel(unref(aiFilters).datePeriod))} <button class="ml-1 text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100" data-v-9fe621d0>×</button></span>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(aiFilters).feedbackDirectedTo) {
            _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200" data-v-9fe621d0> Directed To: ${ssrInterpolate(unref(aiFilters).feedbackDirectedTo)} <button class="ml-1 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100" data-v-9fe621d0>×</button></span>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(aiFilters).category) {
            _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200" data-v-9fe621d0> Category: ${ssrInterpolate(unref(aiFilters).category)} <button class="ml-1 text-orange-600 dark:text-orange-300 hover:text-orange-800 dark:hover:text-orange-100" data-v-9fe621d0>×</button></span>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(aiFilters).platformClientId) {
            _push(`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200" data-v-9fe621d0> Client ID: ${ssrInterpolate(unref(aiFilters).platformClientId)} <button class="ml-1 text-purple-600 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-100" data-v-9fe621d0>×</button></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(feedbackData).length > 0) {
          _push(`<div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm" data-v-9fe621d0><div class="flex items-center justify-between" data-v-9fe621d0><div class="flex items-center" data-v-9fe621d0><svg class="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" data-v-9fe621d0></path></svg><span class="text-blue-800 dark:text-blue-300" data-v-9fe621d0><strong data-v-9fe621d0>${ssrInterpolate(getAIFilteredData().length)}</strong> of <strong data-v-9fe621d0>${ssrInterpolate(unref(feedbackData).length)}</strong> feedback items will be analyzed </span></div>`);
          if (getAIFilteredData().length === 0) {
            _push(`<span class="text-xs text-orange-600 dark:text-orange-400 font-semibold" data-v-9fe621d0> ⚠️ No items match filters - adjust or clear filters </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div style="${ssrRenderStyle(unref(activeTab) === "saved-reports" ? null : { display: "none" })}" data-v-9fe621d0><div class="mb-6" data-v-9fe621d0><h2 class="text-2xl font-bold text-white" data-v-9fe621d0>💾 Saved Reports</h2><p class="text-white/70 text-sm mt-1" data-v-9fe621d0>View and manage your previously generated AI reports</p></div>`);
        if (unref(savedReportsLoading)) {
          _push(`<div class="flex items-center justify-center py-12" data-v-9fe621d0><div class="text-white/70" data-v-9fe621d0>Loading saved reports...</div></div>`);
        } else if (unref(savedReports).length === 0) {
          _push(`<div class="text-center py-12" data-v-9fe621d0><div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4" data-v-9fe621d0><svg class="w-8 h-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-9fe621d0></path></svg></div><h3 class="text-lg font-medium text-white mb-2" data-v-9fe621d0>No saved reports yet</h3><p class="text-white/70 text-sm" data-v-9fe621d0>Generate an AI report and save it to see it here</p></div>`);
        } else {
          _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-v-9fe621d0><!--[-->`);
          ssrRenderList(unref(savedReports), (report) => {
            _push(`<div class="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 group" data-v-9fe621d0><div class="p-6" data-v-9fe621d0><div class="flex items-start justify-between mb-4" data-v-9fe621d0><div class="flex-1" data-v-9fe621d0><h3 class="text-lg font-semibold text-white mb-1" data-v-9fe621d0>${ssrInterpolate(report.title)}</h3>`);
            if (report.description) {
              _push(`<p class="text-white/70 text-sm mb-2" data-v-9fe621d0>${ssrInterpolate(report.description)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="flex items-center text-xs text-white/60" data-v-9fe621d0><svg class="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" data-v-9fe621d0></path></svg> ${ssrInterpolate(formatDate(report.created_at))}</div></div><div class="flex items-center space-x-1" data-v-9fe621d0><button class="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="View report" data-v-9fe621d0><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" data-v-9fe621d0></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" data-v-9fe621d0></path></svg></button><button class="p-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete report" data-v-9fe621d0><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" data-v-9fe621d0></path></svg></button></div></div><div class="grid grid-cols-2 gap-4 text-xs" data-v-9fe621d0><div class="bg-white/5 rounded-lg p-3" data-v-9fe621d0><div class="text-white/60 mb-1" data-v-9fe621d0>Recurring Requests</div><div class="text-white font-semibold" data-v-9fe621d0>${ssrInterpolate(report.report_data?.topRecurringRequests?.length || 0)}</div></div><div class="bg-white/5 rounded-lg p-3" data-v-9fe621d0><div class="text-white/60 mb-1" data-v-9fe621d0>Critical Risks</div><div class="text-white font-semibold" data-v-9fe621d0>${ssrInterpolate(report.report_data?.criticalRisks?.length || 0)}</div></div></div><div class="flex space-x-2 mt-4" data-v-9fe621d0><button class="flex-1 bg-gradient-cta hover:bg-gradient-cta-hover text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 text-sm" data-v-9fe621d0> View Report </button><button class="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-3 rounded-lg transition-all duration-200 text-sm" data-v-9fe621d0> Download </button></div></div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div><div style="${ssrRenderStyle(unref(activeTab) === "call-transcripts" ? null : { display: "none" })}" data-v-9fe621d0><div class="mb-6" data-v-9fe621d0><h2 class="text-2xl font-bold text-white" data-v-9fe621d0>🎙️ Call Transcripts</h2><p class="text-white/70 text-sm mt-1" data-v-9fe621d0>Access meeting and phone call transcripts from DIIO</p></div><div class="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-sm rounded-xl border border-white/10 p-8 text-center" data-v-9fe621d0><div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6" data-v-9fe621d0><svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" data-v-9fe621d0></path></svg></div><h3 class="text-2xl font-bold text-white mb-3" data-v-9fe621d0>DIIO Integration Active</h3><p class="text-white/80 mb-6 max-w-2xl mx-auto" data-v-9fe621d0> Access your complete call transcription library with advanced search, filtering, and AI-powered insights. View transcripts from meetings and phone calls all in one place. </p><div class="flex items-center justify-center gap-6 mb-8 text-sm" data-v-9fe621d0><div class="flex items-center gap-2" data-v-9fe621d0><div class="w-2 h-2 bg-green-500 rounded-full animate-pulse" data-v-9fe621d0></div><span class="text-white/90" data-v-9fe621d0>Connected</span></div><div class="text-white/60" data-v-9fe621d0>|</div><div class="flex items-center gap-2" data-v-9fe621d0><span class="text-white/90" data-v-9fe621d0>800+ Meetings</span></div><div class="text-white/60" data-v-9fe621d0>|</div><div class="flex items-center gap-2" data-v-9fe621d0><span class="text-white/90" data-v-9fe621d0>25+ Users</span></div></div><a href="/diio" class="inline-flex items-center gap-2 bg-gradient-cta hover:bg-gradient-cta-hover text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" data-v-9fe621d0><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" data-v-9fe621d0></path></svg> Open Call Transcripts Dashboard </a><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left" data-v-9fe621d0><div class="bg-white/5 rounded-lg p-4 border border-white/10" data-v-9fe621d0><div class="flex items-center gap-2 mb-2" data-v-9fe621d0><svg class="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-9fe621d0></path></svg><h4 class="text-white font-semibold" data-v-9fe621d0>Search Transcripts</h4></div><p class="text-white/70 text-sm" data-v-9fe621d0>Find specific conversations and topics across all your calls</p></div><div class="bg-white/5 rounded-lg p-4 border border-white/10" data-v-9fe621d0><div class="flex items-center gap-2 mb-2" data-v-9fe621d0><svg class="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" data-v-9fe621d0></path></svg><h4 class="text-white font-semibold" data-v-9fe621d0>User Management</h4></div><p class="text-white/70 text-sm" data-v-9fe621d0>View transcripts by team member and track engagement</p></div><div class="bg-white/5 rounded-lg p-4 border border-white/10" data-v-9fe621d0><div class="flex items-center gap-2 mb-2" data-v-9fe621d0><svg class="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" data-v-9fe621d0></path></svg><h4 class="text-white font-semibold" data-v-9fe621d0>Export Data</h4></div><p class="text-white/70 text-sm" data-v-9fe621d0>Download and export call data for reporting</p></div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</main>`);
      if (unref(showAIReportDisplay)) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-v-9fe621d0><div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true" data-v-9fe621d0></div><div class="relative bg-ontop-navy-dark rounded-2xl shadow-glow border border-white/10 w-full max-w-6xl max-h-[90vh] flex flex-col transform transition-all" data-v-9fe621d0><div class="bg-gradient-ontop-hero px-6 py-4 flex-shrink-0" data-v-9fe621d0><div class="flex items-center justify-between" data-v-9fe621d0><div class="flex items-center" data-v-9fe621d0><div class="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3" data-v-9fe621d0><svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-9fe621d0></path></svg></div><div data-v-9fe621d0><h3 class="text-xl font-bold text-white" data-v-9fe621d0>AI Intelligence Report</h3><p class="text-purple-100 text-sm" data-v-9fe621d0>Generated with AI-powered insights</p></div></div><div class="flex items-center space-x-2" data-v-9fe621d0><button class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200" title="Download report as HTML" data-v-9fe621d0><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-9fe621d0></path></svg></button><button class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200" title="Copy HTML to clipboard" data-v-9fe621d0><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" data-v-9fe621d0></path></svg></button><button class="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200" data-v-9fe621d0><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-9fe621d0></path></svg></button></div></div></div><div class="flex-1 overflow-y-auto bg-gradient-dark" data-v-9fe621d0><div class="report-content" data-v-9fe621d0>${unref(currentAIReportHTML) ?? ""}</div></div><div class="bg-white/5 px-6 py-4 border-t border-white/10 flex-shrink-0" data-v-9fe621d0><div class="flex items-center justify-between" data-v-9fe621d0><p class="text-sm text-white/70" data-v-9fe621d0> Generated on ${ssrInterpolate((/* @__PURE__ */ new Date()).toLocaleString())}</p><div class="flex space-x-3" data-v-9fe621d0><button class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-xl" data-v-9fe621d0><svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" data-v-9fe621d0></path></svg> Save Report </button><button class="bg-gradient-cta hover:bg-gradient-cta-hover text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-xl" data-v-9fe621d0><svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" data-v-9fe621d0></path></svg> Download HTML </button><button class="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center border border-white/20" data-v-9fe621d0><svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-v-9fe621d0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 00-2 2z" data-v-9fe621d0></path></svg> Copy HTML </button><button class="bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-white/10" data-v-9fe621d0> Close </button></div></div></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9fe621d0"]]);

export { index as default };
//# sourceMappingURL=index-Dys_-BPv.mjs.map
