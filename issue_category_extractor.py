"""
Issue Category Extractor - Ontop Business-Aware
Extracts issue categories from conversation text using keyword matching and patterns.
Enhanced with Ontop-specific aspects: Payments, Card/Wallet, Contracts, Compliance, Support.
"""

import re
from typing import List, Dict, Optional

# Ontop-specific aspects for sentiment analysis
ONTOP_ASPECTS = {
    'payments': {
        'keywords': ['payment', 'pay', 'payroll', 'salary', 'wage', 'charge', 'billing', 'invoice', 'refund', 'money', 'cost', 'price', 'fee', 'transaction', 'wire', 'transfer', 'currency', 'exchange', 'rate', 'deduction', 'withholding', 'tax', 'reimbursement'],
        'patterns': [r'\$\d+', r'payment\s+issue', r'billing\s+problem', r'payroll\s+issue', r'salary\s+problem', r'wire\s+transfer', r'currency\s+exchange']
    },
    'card_wallet': {
        'keywords': ['card', 'wallet', 'visa', 'debit', 'credit', 'ontop wallet', 'digital wallet', 'spending', 'balance', 'fund', 'deposit', 'withdrawal', 'atm', 'transaction declined', 'card blocked', 'card issue'],
        'patterns': [r'ontop\s+wallet', r'visa\s+card', r'card\s+blocked', r'transaction\s+declined', r'wallet\s+issue']
    },
    'contracts': {
        'keywords': ['contract', 'agreement', 'sign', 'signing', 'ontop signs', 'you sign', 'contractor pro', 'compliance', 'draft', 'template', 'terms', 'clause', 'renewal', 'termination', 'expiration'],
        'patterns': [r'ontop\s+signs', r'you\s+sign', r'contractor\s+pro', r'contract\s+issue', r'signing\s+problem']
    },
    'compliance': {
        'keywords': ['compliance', 'legal', 'regulation', 'law', 'requirement', 'document', 'verification', 'identity', 'kyc', 'tax form', 'w-9', 'w-8', 'certificate', 'license', 'permit', 'authorization'],
        'patterns': [r'compliance\s+issue', r'legal\s+requirement', r'tax\s+form', r'verification\s+problem']
    },
    'support': {
        'keywords': ['support', 'help', 'assistance', 'service', 'response', 'waiting', 'delay', 'time', 'escalate', 'escalation', 'urgent', 'priority', 'sla', 'resolution'],
        'patterns': [r'support\s+issue', r'waiting\s+for', r'no\s+response', r'slow\s+response', r'escalation\s+request']
    }
}

# General issue categories (kept for backward compatibility and additional context)
ISSUE_CATEGORIES = {
    'payment': {
        'keywords': ['payment', 'pay', 'charge', 'billing', 'invoice', 'refund', 'money', 'cost', 'price', 'fee', 'transaction', 'card', 'credit'],
        'patterns': [r'\$\d+', r'payment\s+issue', r'billing\s+problem']
    },
    'technical': {
        'keywords': ['bug', 'error', 'crash', 'broken', 'not working', 'issue', 'problem', 'glitch', 'freeze', 'slow', 'loading', 'connection', 'login', 'password'],
        'patterns': [r'error\s+\d+', r'bug\s+in', r'not\s+working', r'can\'t\s+login']
    },
    'account': {
        'keywords': ['account', 'profile', 'settings', 'access', 'permission', 'locked', 'suspended', 'verification', 'email', 'username'],
        'patterns': [r'account\s+locked', r'can\'t\s+access', r'profile\s+issue']
    },
    'service': {
        'keywords': ['service', 'support', 'help', 'assistance', 'response', 'waiting', 'delay', 'time'],
        'patterns': [r'waiting\s+for', r'no\s+response', r'slow\s+response']
    },
    'feature_request': {
        'keywords': ['feature', 'request', 'add', 'suggest', 'improvement', 'enhancement', 'wish', 'would like'],
        'patterns': [r'add\s+feature', r'can\s+you\s+add', r'would\s+be\s+great']
    },
    'complaint': {
        'keywords': ['complaint', 'unhappy', 'dissatisfied', 'disappointed', 'frustrated', 'angry', 'upset', 'terrible', 'awful', 'horrible'],
        'patterns': [r'very\s+disappointed', r'not\s+happy', r'very\s+frustrated']
    },
    'question': {
        'keywords': ['question', 'how', 'what', 'why', 'when', 'where', 'explain', 'clarify', 'understand'],
        'patterns': [r'how\s+do\s+i', r'what\s+is', r'can\s+you\s+explain']
    },
    'refund': {
        'keywords': ['refund', 'return', 'money back', 'cancel', 'reimbursement'],
        'patterns': [r'refund\s+request', r'want\s+my\s+money\s+back', r'cancel\s+and\s+refund']
    },
    'delivery': {
        'keywords': ['delivery', 'shipping', 'shipment', 'order', 'package', 'arrive', 'tracking'],
        'patterns': [r'where\s+is\s+my\s+order', r'delivery\s+issue', r'shipping\s+problem']
    },
    'quality': {
        'keywords': ['quality', 'defect', 'damaged', 'broken', 'wrong', 'incorrect', 'faulty'],
        'patterns': [r'poor\s+quality', r'defective', r'damaged\s+product']
    }
}

def extract_issue_category(conversation: List[Dict], analyze_all: bool = False) -> Optional[str]:
    """
    Extract the main issue category from a conversation.
    
    Args:
        conversation: List of message dicts from Supabase
        analyze_all: If True, analyze all messages. If False, only customer messages.
        
    Returns:
        Category name (e.g., 'payment', 'technical') or None if no category found
    """
    if not conversation:
        return None
    
    # Collect all text from relevant messages
    texts = []
    for message in conversation:
        message_text = message.get('message_text', '')
        author_type = message.get('author_type', '')
        
        if not message_text:
            continue
        
        # Filter by author type if needed
        if not analyze_all and author_type != 'end-user':
            continue
        
        texts.append(message_text.lower())
    
    if not texts:
        return None
    
    # Combine all text
    combined_text = ' '.join(texts)
    
    # Score each category
    category_scores = {}
    
    for category, config in ISSUE_CATEGORIES.items():
        score = 0
        
        # Check keywords
        keywords = config.get('keywords', [])
        for keyword in keywords:
            # Count occurrences (word boundaries to avoid partial matches)
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            matches = len(re.findall(pattern, combined_text))
            score += matches * 2  # Keywords worth 2 points
        
        # Check patterns
        patterns = config.get('patterns', [])
        for pattern in patterns:
            matches = len(re.findall(pattern, combined_text, re.IGNORECASE))
            score += matches * 3  # Patterns worth 3 points
        
        if score > 0:
            category_scores[category] = score
    
    # Return category with highest score, or None if no matches
    if category_scores:
        # Get category with highest score
        best_category = max(category_scores.items(), key=lambda x: x[1])
        # Only return if score is significant (at least 2 points)
        if best_category[1] >= 2:
            return best_category[0]
    
    return None

def extract_all_categories(conversation: List[Dict], analyze_all: bool = False) -> List[Dict]:
    """
    Extract all issue categories found in a conversation with scores.
    
    Args:
        conversation: List of message dicts from Supabase
        analyze_all: If True, analyze all messages. If False, only customer messages.
        
    Returns:
        List of dicts with 'category' and 'score'
    """
    if not conversation:
        return []
    
    # Collect all text from relevant messages
    texts = []
    for message in conversation:
        message_text = message.get('message_text', '')
        author_type = message.get('author_type', '')
        
        if not message_text:
            continue
        
        if not analyze_all and author_type != 'end-user':
            continue
        
        texts.append(message_text.lower())
    
    if not texts:
        return []
    
    combined_text = ' '.join(texts)
    
    # Score each category
    category_scores = {}
    
    for category, config in ISSUE_CATEGORIES.items():
        score = 0
        
        # Check keywords
        keywords = config.get('keywords', [])
        for keyword in keywords:
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            matches = len(re.findall(pattern, combined_text))
            score += matches * 2
        
        # Check patterns
        patterns = config.get('patterns', [])
        for pattern in patterns:
            matches = len(re.findall(pattern, combined_text, re.IGNORECASE))
            score += matches * 3
        
        if score > 0:
            category_scores[category] = score
    
    # Return sorted by score
    sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
    
    return [{'category': cat, 'score': score} for cat, score in sorted_categories if score >= 2]


def extract_ontop_aspects(conversation: List[Dict], analyze_all: bool = False) -> Dict[str, float]:
    """
    Extract Ontop-specific aspects from a conversation with confidence scores.
    
    Args:
        conversation: List of message dicts from Supabase
        analyze_all: If True, analyze all messages. If False, only customer messages.
        
    Returns:
        Dict mapping aspect names to confidence scores (0.0 to 1.0)
        Example: {'payments': 0.85, 'card_wallet': 0.30, 'contracts': 0.0, ...}
    """
    if not conversation:
        return {}
    
    # Collect all text from relevant messages
    texts = []
    for message in conversation:
        message_text = message.get('message_text', '') or message.get('body', '')
        author_type = message.get('author_type', '')
        
        if not message_text:
            continue
        
        if not analyze_all and author_type != 'end-user':
            continue
        
        texts.append(message_text.lower())
    
    if not texts:
        return {}
    
    combined_text = ' '.join(texts)
    
    # Score each Ontop aspect
    aspect_scores = {}
    
    for aspect, config in ONTOP_ASPECTS.items():
        score = 0.0
        
        # Check keywords
        keywords = config.get('keywords', [])
        for keyword in keywords:
            pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
            matches = len(re.findall(pattern, combined_text))
            score += matches * 2  # Keywords worth 2 points
        
        # Check patterns
        patterns = config.get('patterns', [])
        for pattern in patterns:
            matches = len(re.findall(pattern, combined_text, re.IGNORECASE))
            score += matches * 3  # Patterns worth 3 points
        
        # Normalize to 0.0-1.0 scale (using sigmoid-like function)
        if score > 0:
            # Convert raw score to confidence (0.0 to 1.0)
            # Using a simple normalization: score / (score + 10) caps at ~0.9 for high scores
            normalized_score = min(score / (score + 10), 0.95)
            aspect_scores[aspect] = round(normalized_score, 4)
    
    return aspect_scores


def get_primary_ontop_aspect(conversation: List[Dict], analyze_all: bool = False) -> Optional[str]:
    """
    Get the primary Ontop aspect from a conversation.
    
    Args:
        conversation: List of message dicts from Supabase
        analyze_all: If True, analyze all messages. If False, only customer messages.
        
    Returns:
        Primary aspect name (e.g., 'payments', 'card_wallet') or None
    """
    aspects = extract_ontop_aspects(conversation, analyze_all)
    
    if not aspects:
        return None
    
    # Return aspect with highest score
    return max(aspects.items(), key=lambda x: x[1])[0]

