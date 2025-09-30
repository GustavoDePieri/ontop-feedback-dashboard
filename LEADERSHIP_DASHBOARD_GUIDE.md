# Leadership Dashboard Guide
## Frequency-Based Priority Stack for Client Feedback

### 🎯 **Purpose**

This dashboard is designed specifically for **leadership visibility** to answer one critical question:

> **"What are our clients asking for most, and what should we tackle first?"**

---

## 🧠 **Philosophy: Evidence Over Organization**

### **Traditional Approach (❌ What We Avoid)**
- Categorize feedback by department
- Create subcategories and nested structures
- Show data in silos (Support feedback, Product feedback, etc.)
- Results: Scattered insights without clear priorities

### **Our Approach (✅ What We Do)**
- **Group by what clients actually want** - Not by internal structure
- **Count frequency** - How many times do we hear the same request?
- **Rank by evidence** - Most mentions + revenue impact = highest priority
- **Create a stack** - Work from biggest problem to smallest
- **Ignore silos** - Look at ALL feedback holistically

---

## 📊 **How the AI Analysis Works**

### **Key Principles**

1. **Frequency First**: The AI identifies recurring themes across ALL feedback, regardless of category
2. **Evidence-Based**: Every priority item must have **3+ mentions** minimum
3. **Revenue-Weighted**: Issues affecting high-MRR/TPV clients get extra attention
4. **Actionable**: Every item comes with a specific recommended action
5. **Quick Win Detection**: Identifies low-effort, high-impact opportunities

### **What the AI Analyzes**

```
Input: All feedback data (sentiment, text, categories, revenue data)
       ↓
AI Process: 
  1. Identify similar requests across all feedback
  2. Count frequency of each theme
  3. Calculate revenue impact
  4. Assess sentiment patterns
  5. Determine quick win potential
       ↓
Output: Priority Stack (ordered by frequency + impact)
```

---

## 🏆 **Priority Stack Components**

### **1. Leadership Summary**
A 2-3 sentence executive overview highlighting:
- Top 3 most recurring requests
- Combined business impact
- Urgency indicators

### **2. Top Recurring Requests** (The Priority Stack)

Each item includes:

| Field | Description | How to Use |
|-------|-------------|------------|
| **Rank (#1, #2, etc.)** | Priority order | Start at #1 and work down |
| **Request** | What clients are asking for | The actual problem to solve |
| **Frequency** | Number of mentions | Evidence strength |
| **Priority** | High/Medium/Low | Based on frequency + revenue |
| **Evidence** | Specific data points | Who's asking, how many times |
| **Revenue Impact** | MRR/TPV affected | Business justification |
| **Sentiment** | Positive/Mixed/Negative | Urgency indicator |
| **Recommended Action** | Specific next step | What to do about it |
| **Quick Win** | Yes/No + explanation | Can we solve this fast? |
| **Owner** | Department/team | Who should own this |

### **3. Quick Wins** 🚀
Low-hanging fruit that:
- Appears frequently in feedback
- Can be solved quickly
- Has disproportionate positive impact
- Should be tackled ASAP

### **4. Emerging Patterns** 📈
Early warning signs:
- New trends starting to appear
- Not yet at critical mass (< 3 mentions)
- Could become major issues if ignored
- Monitor these closely

### **5. Critical Risks** ⚠️
Urgent attention needed:
- Strong evidence of churn risk
- Multiple high-value clients affected
- Escalation concerns
- Requires immediate action

---

## 🎮 **How to Use the Dashboard**

### **Step 1: Apply Filters**
```
Time Range: Choose your analysis period (e.g., Last 30 Days)
Sentiment: Optional - Focus on specific sentiment
Account Manager: Optional - View by AM responsibility
```

### **Step 2: Generate AI Analysis**
Click **"Generate AI Analysis"** button
- AI processes ALL feedback (not just filtered view)
- Takes 10-20 seconds
- Uses Google Gemini Flash 2.5

### **Step 3: Review Priority Stack**
Start at **#1** and work your way down:

**For Each Item:**
1. ✅ Read the request - What do clients want?
2. 📊 Check the evidence - How strong is the pattern?
3. 💰 Review revenue impact - How much is at stake?
4. ⚡ Assess quick win potential - Can we solve this fast?
5. 👤 Identify owner - Who should tackle this?
6. 📝 Take action - Assign to the appropriate team

### **Step 4: Execute**
**Priority-Based Execution:**
```
Week 1-2: Tackle all "Quick Wins" + #1 Priority
Week 3-4: Address #2 and #3 priorities
Week 5+:   Work down the stack systematically
```

**Track Progress:**
- Cross off items as they're addressed
- Re-run analysis weekly to see if priorities change
- Monitor if frequency decreases after fixes

---

## 📈 **Success Metrics**

### **You're Succeeding When:**
1. ✅ Frequency of top issues decreases week over week
2. ✅ High-priority items move down or disappear
3. ✅ Overall sentiment improves
4. ✅ Revenue impact of negative feedback decreases
5. ✅ Quick wins are knocked out rapidly

### **Red Flags:**
1. ⚠️ Same issues stay at top for multiple weeks
2. ⚠️ Frequency of critical items increasing
3. ⚠️ New critical risks emerging faster than old ones are resolved
4. ⚠️ High-MRR clients appearing in multiple priority items

---

## 💡 **Best Practices**

### **Weekly Ritual**
```
Monday Morning:
1. Generate fresh AI analysis
2. Review Priority Stack in leadership meeting
3. Assign owners to top 3 priorities
4. Check status of previous week's assignments

Friday Afternoon:
5. Update stakeholders on progress
6. Document what was completed
7. Prepare for Monday's review
```

### **Cross-Functional Collaboration**
The AI assigns **Cross-Functional Owners**:
- **Product**: Feature requests, platform improvements
- **Support**: Process issues, training gaps
- **Operations**: System reliability, performance
- **Sales**: Pricing, contracts, onboarding
- **Multiple Teams**: Complex issues requiring collaboration

**Create dedicated Slack channels or task boards for each top priority**

### **Evidence-Based Decision Making**
❌ **Don't Say**: "I think we should prioritize X"
✅ **Instead Say**: "X appears 12 times with $500K MRR impact - Priority #1"

---

## 🔍 **Example Priority Stack**

### **#1 - Faster Payment Processing** 
- **Frequency**: 18 mentions
- **Priority**: HIGH
- **Evidence**: 18 mentions across 12 accounts, including 4 high-MRR clients ($800K combined)
- **Revenue Impact**: $800K MRR at risk
- **Sentiment**: Negative
- **Action**: Product team to optimize payment API, reduce processing time from 2 days to same-day
- **Quick Win**: No - Requires engineering effort (2-3 sprints)
- **Owner**: Product + Engineering

### **#2 - Multi-Currency Reporting**
- **Frequency**: 15 mentions
- **Priority**: HIGH
- **Evidence**: 15 mentions from 8 accounts, concentrated in LATAM region
- **Revenue Impact**: $600K MRR affected
- **Sentiment**: Mixed
- **Action**: Add currency conversion display in dashboard reports
- **Quick Win**: Yes - Can use existing API, 1 sprint
- **Owner**: Product

### **#3 - Better Invoice Customization**
- **Frequency**: 12 mentions
- **Priority**: MEDIUM
- **Evidence**: 12 mentions from 10 accounts, mostly SMB segment
- **Revenue Impact**: $200K MRR affected
- **Sentiment**: Neutral
- **Action**: Add template customization to invoice generator
- **Quick Win**: Yes - UI enhancement only, 1 week
- **Owner**: Product + Design

---

## ⚡ **Quick Start Checklist**

- [ ] Set your time range filter
- [ ] Click "Generate AI Analysis"
- [ ] Read the Leadership Summary
- [ ] Review Priority Stack (#1 first)
- [ ] Identify Quick Wins
- [ ] Assign owners to top 3 priorities
- [ ] Create action items in your PM tool
- [ ] Schedule follow-up for next week
- [ ] Re-run analysis weekly

---

## 🆘 **Troubleshooting**

### **"Not enough data"**
- Need minimum 10-15 feedback items for meaningful analysis
- Expand your time range filter
- Consider removing restrictive filters

### **"AI results seem generic"**
- Make sure you have diverse feedback data
- Check that feedback text is detailed (not just 1-2 words)
- Try focusing on a specific time period with more activity

### **"Priorities don't match my intuition"**
- Trust the data - frequency beats intuition
- Check the evidence field for specifics
- Remember: This is what clients say, not what we think they want

### **"Same issues week after week"**
- These are systemic problems requiring attention
- Either address them or decide to accept the trade-off
- If accepting, document why and communicate to clients

---

## 🚀 **Next Steps**

1. **Run your first analysis** - See what comes up
2. **Share with leadership** - Get buy-in on the approach
3. **Establish weekly ritual** - Make this part of your rhythm
4. **Track progress** - Document what changes over time
5. **Iterate** - Adjust based on what works

---

## 📞 **Need Help?**

- Review the evidence in each priority item
- Start with Quick Wins to build momentum
- Focus on frequency + revenue impact
- Trust the data, not just gut feeling
- Work the stack from top to bottom

**Remember: This isn't about perfect categorization. It's about knowing what to fix first, backed by evidence.**

---

*Last Updated: September 30, 2025*
*Dashboard Version: 2.0 - Frequency-Based Priority Stack*
