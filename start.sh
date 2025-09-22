#!/bin/bash

# Download NLTK data if not present
python -c "
import nltk
import os
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('vader_lexicon')
    print('NLTK data already available')
except LookupError:
    print('Downloading NLTK data...')
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True) 
    nltk.download('vader_lexicon', quiet=True)
    print('NLTK data downloaded successfully')
"

# Run the Streamlit app
exec streamlit run dashboard.py \
    --server.port ${PORT:-8501} \
    --server.address 0.0.0.0 \
    --server.headless true \
    --server.enableCORS false \
    --server.enableXsrfProtection false \
    --server.fileWatcherType none
