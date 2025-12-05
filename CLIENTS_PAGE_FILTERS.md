# Clients Page Filter Changes

## 🎯 Summary

The Clients page now shows **filtered data** to focus on internal operations from the last 3 months.

## ✅ Changes Applied

### 1. Tickets Filter (Zendesk)
**Now showing:**
- ✅ Only **internal tickets** (`is_external = FALSE`)
- ✅ Only tickets from the **last 3 months** (based on `created_at`)

**Previously:** Showed all tickets (internal + external, all time)

### 2. Transcripts Filter (DIIO)
**Now showing:**
- ✅ Only transcripts from the **last 3 months** (based on `occurred_at`)

**Previously:** Showed all transcripts (all time)

## 📁 Files Modified

### Backend API Endpoints:
1. **`server/api/clients/list.get.ts`**
   - Added 3-month date filter for both tickets and transcripts
   - Added `is_external = false` filter for Zendesk tickets
   - Added console logging to track filtered data

2. **`server/api/clients/[id]/details.get.ts`**
   - Applied same filters to client detail view
   - Ensures ticket and transcript counts match filtered data

### Frontend:
3. **`pages/clients.vue`**
   - Added visual badges showing active filters:
     - "Internal Tickets Only" badge
     - "Last 3 Months" badge

## 🔍 Filter Details

### Date Calculation
```javascript
const threeMonthsAgo = new Date()
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
```

### Zendesk Tickets Query
```javascript
.eq('is_external', false)         // Internal only
.gte('created_at', threeMonthsAgoISO)  // Last 3 months
```

### DIIO Transcripts Query
```javascript
.gte('occurred_at', threeMonthsAgoISO)  // Last 3 months
```

## 📊 Impact

### What You'll See:
- **Fewer clients** in the list (only those with internal tickets or recent transcripts)
- **Lower ticket counts** per client (only internal tickets from last 3 months)
- **Lower transcript counts** per client (only transcripts from last 3 months)
- **More relevant data** focused on recent internal operations

### What's Filtered Out:
- ❌ External tickets (from end customers)
- ❌ Tickets older than 3 months
- ❌ Transcripts older than 3 months
- ❌ Clients with only external tickets or old data

## 🎨 Visual Changes

Added two filter badges at the top of the page:

```
┌─────────────────────┐  ┌──────────────────┐
│ 🔵 Internal Tickets │  │ 🟣 Last 3 Months │
│    Only             │  │                  │
└─────────────────────┘  └──────────────────┘
```

## 🧪 Testing

To verify the filters are working:

1. **Check console logs:**
   - Look for: `Filtering data from last 3 months: [date]`
   - Look for: `Found DIIO clients: X`
   - Look for: `Found Zendesk internal clients: Y`

2. **Compare counts:**
   - Total clients should be fewer than before
   - Ticket counts should show only internal tickets

3. **Check client details:**
   - Open any client
   - Verify tickets shown are all internal (`is_external = false`)
   - Verify all data is from the last 3 months

## 🔄 To Revert or Adjust

### To show external tickets:
In both API files, remove or modify:
```javascript
.eq('is_external', false)
```

### To change time window (e.g., 6 months):
In both API files, change:
```javascript
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
// Change to:
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 6)
```

### To show all historical data:
Remove the date filters:
```javascript
.gte('created_at', threeMonthsAgoISO)  // Remove this line
.gte('occurred_at', threeMonthsAgoISO) // Remove this line
```

## 📝 Notes

- Filters are applied server-side for performance
- All client counts and statistics reflect filtered data
- Enrichment data is not filtered (shows all historical enrichment)
- Changes take effect immediately after deployment
- No database schema changes required

## ✅ Build Status

✅ Build successful - No errors
✅ Linter passed - No warnings
✅ Ready for deployment

## 🚀 Next Steps

1. Deploy to Vercel (git push or manual deploy)
2. Test on production environment
3. Monitor client counts to ensure filters are working
4. Adjust time window if needed based on feedback

