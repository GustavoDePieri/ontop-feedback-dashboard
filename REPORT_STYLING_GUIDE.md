# 🎨 Report Styling Guide

## ⚠️ CRITICAL: Where to Edit Report Styles

This guide will save you hours of frustration! Read this before making ANY changes to report styling.

---

## 📁 File Architecture

### ✅ Files to Edit for AI Report Styling

#### 1. `composables/useReportTemplates.ts` ⭐ **PRIMARY FILE**
**What it does:**
- Generates the complete HTML template with embedded CSS for ALL reports
- Contains the `<style>` tag with all the CSS classes and styling
- Used by both the main dashboard AI reports AND the Reports page

**When to edit:**
- Changing report layout or structure
- Updating colors, fonts, or spacing
- Modifying any visual element in the report
- Changing the header gradient or background

**Key sections:**
```javascript
const generateExecutiveHTML = (report: WeeklyReportData): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          /* ALL YOUR STYLES GO HERE */
          body { ... }
          .section { ... }
          .metric-card { ... }
        </style>
      </head>
      <body>
        <!-- Report HTML structure -->
      </body>
    </html>
  `
}
```

#### 2. `pages/index.vue` (lines ~2847-2900) ⚠️ **AI INSIGHTS SECTION ONLY**
**What it does:**
- Contains ONLY the HTML for the AI-powered insights section
- Gets injected into the report HTML via `html.replace('<!-- AI Insights Placeholder -->', aiSection)`
- Has inline styles that must match the main template

**When to edit:**
- Only when changing the AI insights section specifically
- Must keep styles consistent with `useReportTemplates.ts`

**Example:**
```javascript
const aiSection = `
  <div class="section">
    <h2 class="section-title">🤖 AI-Powered Insights</h2>
    <!-- Inline styles here MUST match the dark theme -->
  </div>
`
```

---

### ❌ Files NOT Used for AI Report Styling

#### `components/ReportDisplayModal.vue` 
**What it actually does:**
- Displays the side panel modal on the `/reports` page ONLY
- Shows structured data using Vue components (NOT raw HTML)
- Has its own dark theme styling for the UI chrome (buttons, header, etc.)

**Why it doesn't affect AI reports:**
- The AI report on `pages/index.vue` uses `v-html="currentAIReportHTML"`
- This renders the raw HTML string from `useReportTemplates.ts`
- Vue components don't affect content rendered by `v-html`

**When to edit:**
- Only if you want to change the Reports page modal UI
- Not related to the actual report content styling

---

## 🎨 Current Dark Theme Specifications

### Color Palette

| Element | Color | Usage |
|---------|-------|-------|
| Background | `linear-gradient(135deg, #0f0819 0%, #1a0d2e 50%, #2a1b3d 100%)` | Body background |
| Container | `linear-gradient(135deg, #1a0d2e 0%, #0f0819 100%)` | Main container |
| Header | `linear-gradient(120deg, #8b5cf6 0%, #ec4899 50%, #fb7185 100%)` | Ontop brand gradient |
| Primary Text | `#ffffff` | Headings and important text |
| Secondary Text | `rgba(255, 255, 255, 0.7)` | Body text, labels |
| Tertiary Text | `rgba(255, 255, 255, 0.5)` | Less important text |
| Purple Accent | `#8b5cf6` | Metrics, numbers, highlights |
| Pink Accent | `#ec4899` | Department values |
| Green (Positive) | `#10b981` | Positive metrics, insights |
| Red (Negative) | `#dc2626` | Negative metrics, critical issues |
| Yellow (Neutral) | `#f59e0b` | Neutral metrics, warnings |

### Effects

| Effect | CSS | Usage |
|--------|-----|-------|
| Glassmorphism | `backdrop-filter: blur(10px)` | Cards, containers |
| Transparency | `background: rgba(255, 255, 255, 0.05)` | Card backgrounds |
| Border Glow | `border: 1px solid rgba(255, 255, 255, 0.1)` | Card borders |
| Shadow Glow | `box-shadow: 0 0 20px rgba(168, 85, 247, 0.3)` | Container shadow |

---

## 🔄 How the Report Flow Works

```
User clicks "Generate AI Report"
          ↓
1. Data is processed in pages/index.vue
          ↓
2. generateExecutiveHTML(reportData) is called
   from useReportTemplates.ts
          ↓
3. HTML string with embedded CSS is returned
          ↓
4. If AI insights exist, the aiSection HTML
   is injected via html.replace()
          ↓
5. Complete HTML is set to currentAIReportHTML.value
          ↓
6. Modal displays it using v-html
          ↓
7. Browser renders the HTML with embedded styles
```

**Key Point:** The entire report is a single HTML string with embedded CSS. No Vue components are involved in rendering the actual report content!

---

## ✅ Step-by-Step: How to Change Report Styles

### Example: Changing the Header Color

1. **Open** `composables/useReportTemplates.ts`

2. **Find** the header style (around line 16):
   ```css
   .header { background: linear-gradient(120deg, #8b5cf6 0%, #ec4899 50%, #fb7185 100%); ... }
   ```

3. **Modify** the gradient:
   ```css
   .header { background: linear-gradient(120deg, #6366f1 0%, #8b5cf6 100%); ... }
   ```

4. **Save** and test by generating a new AI report

### Example: Changing Text Color for a Section

1. **Open** `composables/useReportTemplates.ts`

2. **Find** the section title style (around line 21):
   ```css
   .section-title { font-size: 20px; font-weight: 700; color: #ffffff; ... }
   ```

3. **Change** the color:
   ```css
   .section-title { font-size: 20px; font-weight: 700; color: #a78bfa; ... }
   ```

4. **Also update** the AI insights section in `pages/index.vue` (line ~2878):
   ```html
   <h3 style="font-size: 16px; font-weight: 700; color: #a78bfa; ...">
   ```

5. **Save both files** and test

---

## 🚨 Common Mistakes to Avoid

### ❌ Mistake #1: Editing ReportDisplayModal.vue
```
"I changed the modal component but the AI report looks the same!"
```
**Solution:** Edit `useReportTemplates.ts` instead.

### ❌ Mistake #2: Not Updating Both Files
```
"The main report looks good but the AI insights section is still light-themed!"
```
**Solution:** Update BOTH `useReportTemplates.ts` AND the AI section in `pages/index.vue`.

### ❌ Mistake #3: Using Tailwind Classes
```
"I added class='text-white' but it doesn't work!"
```
**Solution:** The report is rendered as raw HTML. Tailwind classes won't work. Use inline styles or define CSS in the `<style>` tag.

### ❌ Mistake #4: Forgetting Contrast
```
"My text is white on a light background!"
```
**Solution:** Always test with both the embedded CSS and inline styles to ensure proper contrast.

---

## 📝 Checklist for Style Changes

- [ ] Identified which file to edit (`useReportTemplates.ts` for main styles)
- [ ] Updated the CSS in the `<style>` tag
- [ ] If changing AI section, also updated `pages/index.vue`
- [ ] Tested by generating a new AI report
- [ ] Checked contrast and readability
- [ ] Verified all sections (metrics, issues, actions, accounts)
- [ ] Tested downloaded HTML report
- [ ] Committed changes with clear description

---

## 🆘 Quick Reference

**Need to change...** | **Edit this file** | **Section**
--------------------|-------------------|------------
Report background | `useReportTemplates.ts` | `body { background: ... }`
Header gradient | `useReportTemplates.ts` | `.header { background: ... }`
Text colors | `useReportTemplates.ts` | Various selectors
Card styling | `useReportTemplates.ts` | `.metric-card`, `.priority-issue`, etc.
AI insights section | `pages/index.vue` | Lines ~2847-2900
Report modal UI | `components/ReportDisplayModal.vue` | Vue template

---

## 💡 Pro Tips

1. **Use browser DevTools** to inspect the rendered HTML and see exactly what styles are being applied
2. **Search for color codes** in `useReportTemplates.ts` to find all instances that need updating
3. **Keep a color palette** reference handy from `tailwind.config.js`
4. **Test downloads** - the HTML reports are standalone files that need all styles embedded
5. **Match the dashboard** - use the same colors and effects as the main UI for consistency

---

## 📞 Still Confused?

If you're not sure which file to edit:

1. **Is it the AI report content?** → `useReportTemplates.ts`
2. **Is it the AI insights specifically?** → Also update `pages/index.vue`
3. **Is it the modal UI (buttons, close icon)?** → `ReportDisplayModal.vue`

**When in doubt, edit `useReportTemplates.ts` first!**

