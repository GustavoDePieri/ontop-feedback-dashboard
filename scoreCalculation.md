# Quick Explanation: Sentiment Calculation (Meetings)

## Stage 1: Meeting-Level Sentiment

1. **Analyze each spoken segment** in the meeting transcript  
   - Uses Hugging Face model (`cardiffnlp/twitter-xlm-roberta-base-sentiment`)  
   - Returns: Positive / Negative / Neutral + confidence (0.0–1.0)

2. **Convert to numerical score**  
   - Positive → +1.0  
   - Negative → -1.0  
   - Neutral → 0.0  
   - Weighted by confidence:  
     `score = value × confidence`

3. **Average all segments**  
   - Sum all weighted segment scores  
   - Divide by total confidence weight  
   - Output: **Meeting sentiment score** (−1.0 to +1.0)

4. **Apply business rules**  
   - Strong complaints → force negative  
   - Routine operational dialogues → adjust toward neutral  
   - Final score saved in the database

---

## Stage 2: Client-Level Aggregation

1. **Collect all meetings for the client**  
   - Fetch meetings linked to `client_id`  
   - Use each meeting’s `sentiment_score`

2. **Apply weights**  
   - Negative meetings → ×2.5  
   - Positive meetings → ×1.0  
   - Neutral meetings → ×0.5  
   - Recent meetings get a slight recency boost

3. **Weighted average formula**


4. **Classification**  
- Score > 0.2 → **Positive**  
- −0.2 ≤ score ≤ 0.2 → **Neutral**  
- Score < −0.2 → **Negative**

---

## Summary

- **Meeting level:** Speech segments → weighted average → sentiment score (−1.0 to +1.0)  
- **Client level:** Meeting scores → weighted aggregation (negative ×2.5) → final client sentiment  
- Negative experiences have **2.5× more impact** on the final score.
