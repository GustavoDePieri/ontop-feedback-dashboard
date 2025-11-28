# Changelog

## [2025-11-28] - Performance & UI Updates

### Fixed
- **Database Timeout Issue**: Fixed "canceling statement due to statement timeout" error when loading transcripts
  - Reduced initial load from 50,000 to 10,000 transcripts
  - Excluded `transcript_text` field from list queries (loaded on-demand)
  - Changed from `created_at` to `occurred_at` ordering for better chronological sorting
  - Added lazy loading for transcript text when viewing individual transcripts

- **Timezone Bug**: Fixed `TypeError` in `transcript_sentiment_aggregator.py`
  - `calculate_recency_weight` now correctly handles timezone-aware vs timezone-naive datetime comparison
  - Strips timezone info before subtraction to prevent runtime errors with 'Z' suffix timestamps

### Enhanced
- **Sentiment Analysis Modal**: Updated DIIO page sentiment display to show new AI analysis structure
  - Added Overall Sentiment, Sentiment Score, Customer Satisfaction, and Churn Risk metrics
  - Added Churn Signals, Key Themes, Pain Points, and Positive Highlights sections
  - Added Actionable Insights with priority levels
  - Improved visual design with color-coded metrics

### Added
- **New API Method**: `getDiioTranscript(id)` for fetching single transcript with full text
- **Performance Documentation**: Created `PERFORMANCE_OPTIMIZATION.md` with detailed optimization notes
- **includeText Parameter**: Added optional parameter to `getDiioTranscripts()` for conditional text loading

### Performance Impact
- **Initial Load Time**: Reduced from timeout (~60s+) to ~2-5 seconds
- **Data Transfer**: ~95% reduction (from several GB to ~MB)
- **Memory Usage**: Significantly reduced browser memory footprint

### Technical Details
- Modified files:
  - `composables/useSupabase.ts` - Optimized queries and added new method
  - `pages/diio.vue` - Updated load strategy and enhanced sentiment modal
  - `transcript_sentiment_aggregator.py` - Fixed timezone handling bug

### Migration Notes
- No breaking changes for end users
- Developers: `getDiioTranscripts(limit, offset, includeText)` now has 3 parameters
- Consider adding database index on `occurred_at` for optimal performance

---

## Previous Updates

See Git history for earlier changes.
