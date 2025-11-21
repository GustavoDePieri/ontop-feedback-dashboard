const CHURN_SIGNALS = {
  // Payment Issues
  payment_issue: {
    keywords: [
      "payment",
      "invoice",
      "billing",
      "charge",
      "fee",
      "cost",
      "price",
      "expensive",
      "payment failed",
      "payment error",
      "payment issue",
      "billing problem",
      "overcharged",
      "wrong charge",
      "unexpected fee",
      "payment delay",
      "late payment",
      "payment processing",
      "payment method",
      "credit card",
      "refund",
      "chargeback",
      "dispute",
      "payment declined"
    ],
    severity: "high"
  },
  // Worker Payout Issues
  worker_payout_issue: {
    keywords: [
      "payout",
      "worker payment",
      "contractor payment",
      "freelancer payment",
      "payout delay",
      "payout issue",
      "payout problem",
      "payout error",
      "workers not paid",
      "payment to workers",
      "contractor not paid",
      "late payout",
      "payout missing",
      "payout failed",
      "payout processing"
    ],
    severity: "high"
  },
  // Recurring Problems
  recurring_problem: {
    keywords: [
      "again",
      "still",
      "recurring",
      "repeated",
      "happening again",
      "keep happening",
      "ongoing issue",
      "persistent problem",
      "same issue",
      "same problem",
      "continues to",
      "repeatedly"
    ],
    severity: "medium"
  },
  // Long-lasting Problems
  long_lasting_problem: {
    keywords: [
      "months",
      "weeks",
      "long time",
      "for a while",
      "since",
      "ongoing",
      "persistent",
      "chronic",
      "has been",
      "still not fixed",
      "taking too long",
      "delayed",
      "waiting",
      "unresolved"
    ],
    severity: "high"
  },
  // Price Negotiation / Discount Requests
  price_negotiation: {
    keywords: [
      "discount",
      "cheaper",
      "lower price",
      "reduce cost",
      "reduce fee",
      "too expensive",
      "cost too much",
      "price too high",
      "fees too high",
      "negotiate",
      "better price",
      "competitive",
      "competitor pricing",
      "can't afford",
      "budget",
      "cost cutting",
      "reduce expenses",
      "price match",
      "lower rate",
      "discount code",
      "promo"
    ],
    severity: "medium"
  },
  // Customer Situation Changes
  customer_situation: {
    keywords: [
      "layoff",
      "layoffs",
      "firing",
      "fired",
      "let go",
      "reduction",
      "financial problem",
      "financial issues",
      "budget cuts",
      "cutting costs",
      "company downsizing",
      "reducing workforce",
      "closing",
      "shutting down",
      "bankruptcy",
      "financial trouble",
      "cash flow",
      "revenue decline",
      "economic downturn",
      "market conditions",
      "business slow"
    ],
    severity: "critical"
  },
  // Opportunities
  opportunity: {
    keywords: [
      "expand",
      "growing",
      "hiring",
      "scaling",
      "new project",
      "new business",
      "upsell",
      "upgrade",
      "more features",
      "additional",
      "increase",
      "new needs",
      "considering",
      "interested in",
      "potential",
      "opportunity",
      "benefit",
      "gym",
      "insurance",
      "new product"
    ],
    severity: "low"
  },
  // Churn: No Active Workforce
  churn_no_active_workforce: {
    keywords: [
      "no workers",
      "no contractors",
      "no freelancers",
      "no active workforce",
      "stopped hiring",
      "not using",
      "not active",
      "inactive workers",
      "no activity",
      "no usage",
      "not utilizing",
      "workforce inactive"
    ],
    severity: "critical"
  },
  // Churn: Shutdown Operations
  churn_shutdown_operations: {
    keywords: [
      "shutting down",
      "closing",
      "ceasing operations",
      "going out of business",
      "closing shop",
      "ending operations",
      "winding down",
      "discontinuing",
      "no longer operating",
      "shut down",
      "closed",
      "stopping business"
    ],
    severity: "critical"
  },
  // Churn: Legal/Compliance Issues
  churn_legal_compliance: {
    keywords: [
      "legal",
      "compliance",
      "regulations",
      "law",
      "lawsuit",
      "legal issue",
      "compliance issue",
      "regulatory",
      "audit",
      "violation",
      "non-compliant",
      "legal problem",
      "compliance problem",
      "regulatory issue"
    ],
    severity: "high"
  },
  // Churn: Price Value Perception
  churn_price_value: {
    keywords: [
      "not worth it",
      "not getting value",
      "not worth the price",
      "overpriced",
      "value proposition",
      "roi",
      "return on investment",
      "not seeing value",
      "better value",
      "more value",
      "getting value",
      "worth the cost"
    ],
    severity: "high"
  },
  // Churn: Product Fit
  churn_product_fit: {
    keywords: [
      "not working",
      "doesn't fit",
      "not suitable",
      "not right for us",
      "wrong product",
      "not what we need",
      "doesn't meet needs",
      "not aligned",
      "not compatible",
      "doesn't work for",
      "not a fit"
    ],
    severity: "high"
  },
  // Churn: Worker Experience
  churn_worker_experience: {
    keywords: [
      "worker complaint",
      "worker issue",
      "worker problem",
      "worker unhappy",
      "contractor complaint",
      "freelancer issue",
      "worker experience",
      "workers not happy",
      "worker dissatisfaction",
      "worker feedback negative"
    ],
    severity: "medium"
  }
};
const PATTERNS = {
  pain_point: [
    "issue",
    "problem",
    "challenge",
    "struggle",
    "difficult",
    "frustrating",
    "pain",
    "blocker",
    "broken",
    "not working",
    "failing",
    "error",
    "slow",
    "takes too long",
    "manual",
    "tedious",
    "annoying"
  ],
  feature_request: [
    "want",
    "need",
    "would like",
    "wish",
    "could you",
    "can you",
    "would be great",
    "would help",
    "if you had",
    "missing",
    "lacking",
    "add",
    "include",
    "integrate",
    "support",
    "enable"
  ],
  praise: [
    "love",
    "great",
    "awesome",
    "excellent",
    "perfect",
    "happy",
    "satisfied",
    "impressed",
    "appreciate",
    "thank you",
    "helpful",
    "easy",
    "simple",
    "works well",
    "pleased"
  ],
  concern: [
    "worried",
    "concerned",
    "afraid",
    "risk",
    "dangerous",
    "unsure",
    "wondering",
    "questioning",
    "doubt",
    "hesitant",
    "considering",
    "evaluating",
    "looking at",
    "competitor"
  ],
  urgency_critical: [
    "urgent",
    "critical",
    "asap",
    "immediately",
    "emergency",
    "blocker",
    "show stopper",
    "can't continue",
    "must have",
    "losing money",
    "clients leaving",
    "threatening to leave",
    "going to cancel",
    "switching"
  ],
  urgency_high: [
    "soon",
    "quickly",
    "priority",
    "important",
    "need this",
    "waiting for",
    "affecting business",
    "costing us",
    "losing time",
    "affecting operations"
  ]
};
function parseTranscript(transcript, metadata) {
  var _a;
  const segments = splitIntoSegments(transcript, metadata);
  const feedbackSegments = [];
  for (const segment of segments) {
    const analysis = analyzeSegment(segment);
    if (analysis.isFeedback) {
      feedbackSegments.push({
        speaker: segment.speaker,
        speakerType: segment.speakerType,
        text: segment.text,
        type: analysis.type,
        urgency: analysis.urgency,
        keywords: analysis.keywords,
        sentiment: analysis.sentiment,
        churnSignals: analysis.churnSignals
      });
    }
  }
  const typeCounts = feedbackSegments.reduce((acc, seg) => {
    acc[seg.type] = (acc[seg.type] || 0) + 1;
    return acc;
  }, {});
  const dominantType = ((_a = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]) == null ? void 0 : _a[0]) || "unknown";
  const speakers = new Set(feedbackSegments.map((s) => s.speaker));
  const churnRiskScore = calculateChurnRiskScore(feedbackSegments);
  const sentimentCounts = feedbackSegments.reduce((acc, seg) => {
    acc[seg.sentiment] = (acc[seg.sentiment] || 0) + 1;
    return acc;
  }, {});
  const overallSentiment = sentimentCounts.negative > sentimentCounts.positive ? "negative" : sentimentCounts.positive > sentimentCounts.negative ? "positive" : "neutral";
  const criticalSignalsCount = feedbackSegments.reduce((count, seg) => {
    return count + seg.churnSignals.filter((s) => s.severity === "critical").length;
  }, 0);
  return {
    feedbackSegments,
    metadata: {
      totalSegments: segments.length,
      feedbackSegments: feedbackSegments.length,
      speakerCount: speakers.size,
      dominantType,
      churnRiskScore,
      overallSentiment,
      criticalSignalsCount
    }
  };
}
function calculateChurnRiskScore(segments) {
  let score = 0;
  for (const segment of segments) {
    for (const signal of segment.churnSignals) {
      switch (signal.severity) {
        case "critical":
          score += 25;
          break;
        case "high":
          score += 15;
          break;
        case "medium":
          score += 5;
          break;
        case "low":
          score += 1;
          break;
      }
    }
    if (segment.sentiment === "negative") {
      score += 3;
    }
    if (segment.urgency === "critical") {
      score += 10;
    } else if (segment.urgency === "high") {
      score += 5;
    }
  }
  return Math.min(100, score);
}
function splitIntoSegments(transcript, metadata) {
  const segments = [];
  const lines = transcript.split("\n");
  let currentSpeaker = "Unknown";
  let currentSpeakerType = "unknown";
  let currentText = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const speakerMatch = trimmed.match(/^([A-Z][a-zA-Z\s]+?):\s*(.*)$/) || // "Name: text"
    trimmed.match(/^\[([A-Z][a-zA-Z\s]+?)\]\s*(.*)$/) || // "[Name] text"
    trimmed.match(/^([A-Z][a-zA-Z\s]+?)\n(.*)$/s);
    if (speakerMatch) {
      if (currentText.length > 0) {
        segments.push({
          speaker: currentSpeaker,
          speakerType: currentSpeakerType,
          text: currentText.join(" ").trim()
        });
        currentText = [];
      }
      const speakerName = speakerMatch[1].trim();
      currentSpeaker = speakerName;
      currentSpeakerType = identifySpeakerType(speakerName, metadata);
      if (speakerMatch[2]) {
        currentText.push(speakerMatch[2].trim());
      }
    } else {
      currentText.push(trimmed);
    }
  }
  if (currentText.length > 0) {
    segments.push({
      speaker: currentSpeaker,
      speakerType: currentSpeakerType,
      text: currentText.join(" ").trim()
    });
  }
  if (segments.length === 0) {
    segments.push({
      speaker: "Unknown",
      speakerType: "unknown",
      text: transcript.trim()
    });
  }
  return segments;
}
function identifySpeakerType(speakerName, metadata) {
  if (!metadata) return "unknown";
  const nameLower = speakerName.toLowerCase();
  if (metadata.sellerEmails && metadata.sellerEmails.length > 0) {
    for (const email of metadata.sellerEmails) {
      const emailName = email.split("@")[0].toLowerCase();
      if (nameLower.includes(emailName) || emailName.includes(nameLower)) {
        return "seller";
      }
    }
  }
  if (metadata.customerEmails && metadata.customerEmails.length > 0) {
    for (const email of metadata.customerEmails) {
      const emailName = email.split("@")[0].toLowerCase();
      if (nameLower.includes(emailName) || emailName.includes(nameLower)) {
        return "customer";
      }
    }
  }
  return "unknown";
}
function analyzeSegment(segment, metadata) {
  const text = segment.text.toLowerCase();
  const words = text.split(/\s+/);
  if (words.length < 5) {
    return {
      isFeedback: false,
      type: "question",
      urgency: "low",
      keywords: [],
      sentiment: "neutral",
      churnSignals: []
    };
  }
  let type = "question";
  let maxMatches = 0;
  const matchedKeywords = [];
  for (const [feedbackType, keywords] of Object.entries(PATTERNS)) {
    if (feedbackType.startsWith("urgency_")) continue;
    let matches = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++;
        matchedKeywords.push(keyword);
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      type = feedbackType;
    }
  }
  const isFeedback = maxMatches > 0;
  const churnSignals = detectChurnSignals(text);
  let urgency = "medium";
  if (PATTERNS.urgency_critical.some((k) => text.includes(k))) {
    urgency = "critical";
  } else if (PATTERNS.urgency_high.some((k) => text.includes(k))) {
    urgency = "high";
  } else if (type === "praise") {
    urgency = "low";
  }
  if (churnSignals.some((s) => s.severity === "critical")) {
    urgency = "critical";
  } else if (churnSignals.some((s) => s.severity === "high")) {
    urgency = urgency === "low" ? "medium" : urgency;
  }
  let sentiment = "neutral";
  const positiveScore = PATTERNS.praise.filter((k) => text.includes(k)).length;
  const negativeScore = [...PATTERNS.pain_point, ...PATTERNS.concern].filter((k) => text.includes(k)).length;
  const churnNegativeScore = churnSignals.filter(
    (s) => ["critical", "high"].includes(s.severity)
  ).length;
  if (positiveScore > negativeScore + churnNegativeScore + 1) {
    sentiment = "positive";
  } else if (negativeScore + churnNegativeScore > positiveScore + 1) {
    sentiment = "negative";
  }
  return {
    isFeedback,
    type,
    urgency,
    keywords: Array.from(new Set(matchedKeywords)),
    sentiment,
    churnSignals
  };
}
function detectChurnSignals(text) {
  const signals = [];
  for (const [category, config] of Object.entries(CHURN_SIGNALS)) {
    const matchedKeywords = [];
    for (const keyword of config.keywords) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (regex.test(text)) {
        matchedKeywords.push(keyword);
      }
    }
    if (matchedKeywords.length > 0) {
      signals.push({
        category,
        severity: config.severity,
        description: getChurnSignalDescription(category),
        keywords: matchedKeywords
      });
    }
  }
  return signals;
}
function getChurnSignalDescription(category) {
  const descriptions = {
    payment_issue: "Payment or billing issue mentioned",
    worker_payout_issue: "Worker payout problem reported",
    recurring_problem: "Recurring or repeated problem identified",
    long_lasting_problem: "Long-lasting unresolved issue",
    price_negotiation: "Price negotiation or discount request",
    customer_situation: "Customer situation change (layoffs, financial issues)",
    opportunity: "Growth or upsell opportunity identified",
    churn_no_active_workforce: "No active workforce - potential churn risk",
    churn_shutdown_operations: "Customer shutting down operations",
    churn_legal_compliance: "Legal or compliance issue",
    churn_price_value: "Price value perception concern",
    churn_product_fit: "Product fit concern",
    churn_worker_experience: "Worker experience issue"
  };
  return descriptions[category] || "Churn signal detected";
}
function formatSegmentsForAI(segments, metadata) {
  const lines = [];
  lines.push(`Call: ${metadata.callName}`);
  lines.push(`Date: ${metadata.date}`);
  if (metadata.accountName) {
    lines.push(`Account: ${metadata.accountName}`);
  }
  if (metadata.participants && metadata.participants.length > 0) {
    lines.push(`Participants: ${metadata.participants.join(", ")}`);
  }
  lines.push("");
  for (const segment of segments) {
    lines.push(`[${segment.type.toUpperCase()}] ${segment.speaker} (${segment.speakerType}):`);
    lines.push(segment.text);
    lines.push(`\u2192 Urgency: ${segment.urgency}, Sentiment: ${segment.sentiment}`);
    if (segment.churnSignals.length > 0) {
      lines.push(`\u2192 Churn Signals: ${segment.churnSignals.map((s) => `${s.category} (${s.severity})`).join(", ")}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
function getSegmentStats(segments) {
  const typeCounts = segments.reduce((acc, seg) => {
    acc[seg.type] = (acc[seg.type] || 0) + 1;
    return acc;
  }, {});
  const urgencyCounts = segments.reduce((acc, seg) => {
    acc[seg.urgency] = (acc[seg.urgency] || 0) + 1;
    return acc;
  }, {});
  const sentimentCounts = segments.reduce((acc, seg) => {
    acc[seg.sentiment] = (acc[seg.sentiment] || 0) + 1;
    return acc;
  }, {});
  const churnSignalCounts = segments.reduce((acc, seg) => {
    for (const signal of seg.churnSignals) {
      acc[signal.category] = (acc[signal.category] || 0) + 1;
    }
    return acc;
  }, {});
  return {
    total: segments.length,
    byType: typeCounts,
    byUrgency: urgencyCounts,
    bySentiment: sentimentCounts,
    byChurnSignal: churnSignalCounts
  };
}

export { formatSegmentsForAI as f, getSegmentStats as g, parseTranscript as p };
//# sourceMappingURL=transcriptParser.mjs.map
