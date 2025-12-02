"""
Issue Category Extractor - Ontop Business-Aware
Extracts issue categories from conversation text using keyword matching and patterns.
Enhanced with Ontop-specific aspects: Payments, Card/Wallet, Contracts, Compliance, Support.
"""

import re
from typing import List, Dict, Optional

# Ontop-specific aspects for sentiment analysis
# Enhanced with Spanish (Latin American) keywords for bilingual support
ONTOP_ASPECTS = {
    'payments': {
        'keywords': [
            # English
            'payment', 'pay', 'payroll', 'salary', 'wage', 'charge', 'billing', 'invoice', 'refund', 'money', 'cost', 'price', 'fee', 'transaction', 'wire', 'transfer', 'currency', 'exchange', 'rate', 'deduction', 'withholding', 'tax', 'reimbursement',
            # Spanish (Latin America)
            'pago', 'pagar', 'nómina', 'salario', 'sueldo', 'cobro', 'cargo', 'facturación', 'factura', 'reembolso', 'reembolsar', 'reembolsen', 'dinero', 'costo', 'precio', 'tarifa', 'comisión', 'transacción', 'transferencia', 'transferir', 'divisa', 'moneda', 'tipo de cambio', 'retención', 'deducción', 'impuesto', 'reembolso de dinero', 'cobro incorrecto', 'cargo incorrecto', 'se cargo', 'se cobro', 'cobro a mi tarjeta', 'cargo a mi cuenta', 'pago pendiente', 'pago rechazado', 'problema de pago', 'problema con el pago', 'error en el pago', 'no me pagaron', 'no recibí mi pago', 'falta mi pago'
        ],
        'patterns': [
            r'\$\d+', r'payment\s+issue', r'billing\s+problem', r'payroll\s+issue', r'salary\s+problem', r'wire\s+transfer', r'currency\s+exchange',
            r'problema\s+de\s+pago', r'problema\s+con\s+el\s+pago', r'error\s+de\s+pago', r'cobro\s+incorrecto', r'cargo\s+incorrecto', r'se\s+cargo', r'se\s+cobro', r'reembolso\s+de', r'no\s+recibí\s+mi\s+pago', r'falta\s+mi\s+pago'
        ]
    },
    'card_wallet': {
        'keywords': [
            # English
            'card', 'wallet', 'visa', 'debit', 'credit', 'ontop wallet', 'digital wallet', 'spending', 'balance', 'fund', 'deposit', 'withdrawal', 'atm', 'transaction declined', 'card blocked', 'card issue',
            # Spanish (Latin America)
            'tarjeta', 'billetera', 'cartera digital', 'billetera digital', 'visa', 'débito', 'crédito', 'saldo', 'fondos', 'depósito', 'retiro', 'extracción', 'cajero', 'cajero automático', 'transacción denegada', 'transacción rechazada', 'tarjeta bloqueada', 'tarjeta rechazada', 'problema con la tarjeta', 'problema con tarjeta', 'no funciona la tarjeta', 'mi tarjeta no funciona', 'tarjeta bloqueada', 'no puedo usar mi tarjeta', 'error con la tarjeta', 'problema de billetera', 'problema con billetera', 'no puedo acceder a mi billetera', 'saldo incorrecto', 'fondos incorrectos', 'falta dinero en mi billetera'
        ],
        'patterns': [
            r'ontop\s+wallet', r'visa\s+card', r'card\s+blocked', r'transaction\s+declined', r'wallet\s+issue',
            r'tarjeta\s+bloqueada', r'tarjeta\s+rechazada', r'transacción\s+denegada', r'transacción\s+rechazada', r'problema\s+con\s+la\s+tarjeta', r'problema\s+con\s+tarjeta', r'problema\s+de\s+billetera', r'problema\s+con\s+billetera', r'no\s+funciona\s+la\s+tarjeta', r'saldo\s+incorrecto'
        ]
    },
    'contracts': {
        'keywords': [
            # English
            'contract', 'agreement', 'sign', 'signing', 'ontop signs', 'you sign', 'contractor pro', 'compliance', 'draft', 'template', 'terms', 'clause', 'renewal', 'termination', 'expiration',
            # Spanish (Latin America)
            'contrato', 'acuerdo', 'firmar', 'firma', 'firmado', 'firmando', 'firmar contrato', 'firmar acuerdo', 'borrador', 'plantilla', 'términos', 'cláusula', 'renovación', 'terminación', 'vencimiento', 'expiración', 'cumplimiento', 'problema con contrato', 'problema de contrato', 'no puedo firmar', 'no me deja firmar', 'error al firmar', 'contrato incorrecto', 'acuerdo incorrecto', 'necesito firmar', 'firmar documento'
        ],
        'patterns': [
            r'ontop\s+signs', r'you\s+sign', r'contractor\s+pro', r'contract\s+issue', r'signing\s+problem',
            r'problema\s+con\s+contrato', r'problema\s+de\s+contrato', r'no\s+puedo\s+firmar', r'no\s+me\s+deja\s+firmar', r'error\s+al\s+firmar', r'firmar\s+contrato', r'firmar\s+acuerdo'
        ]
    },
    'compliance': {
        'keywords': [
            # English
            'compliance', 'legal', 'regulation', 'law', 'requirement', 'document', 'verification', 'identity', 'kyc', 'tax form', 'w-9', 'w-8', 'certificate', 'license', 'permit', 'authorization',
            # Spanish (Latin America)
            'cumplimiento', 'legal', 'regulación', 'regla', 'ley', 'requisito', 'requerimiento', 'documento', 'verificación', 'identidad', 'identificación', 'formulario de impuestos', 'formulario fiscal', 'certificado', 'licencia', 'permiso', 'autorización', 'documentación', 'papeles', 'documentos necesarios', 'requisitos legales', 'verificación de identidad', 'verificación de documentos', 'problema de verificación', 'documento rechazado', 'documento incorrecto', 'falta documento', 'necesito subir documento'
        ],
        'patterns': [
            r'compliance\s+issue', r'legal\s+requirement', r'tax\s+form', r'verification\s+problem',
            r'problema\s+de\s+cumplimiento', r'requisito\s+legal', r'formulario\s+de\s+impuestos', r'formulario\s+fiscal', r'problema\s+de\s+verificación', r'verificación\s+de\s+identidad', r'documento\s+rechazado', r'documento\s+incorrecto'
        ]
    },
    'support': {
        'keywords': [
            # English
            'support', 'help', 'assistance', 'service', 'response', 'waiting', 'delay', 'time', 'escalate', 'escalation', 'urgent', 'priority', 'sla', 'resolution',
            # Spanish (Latin America)
            'soporte', 'ayuda', 'asistencia', 'servicio', 'respuesta', 'esperando', 'espera', 'retraso', 'demora', 'tiempo', 'escalar', 'escalamiento', 'urgente', 'prioridad', 'resolución', 'solución', 'problema', 'consulta', 'pregunta', 'no me responden', 'no hay respuesta', 'esperando respuesta', 'respuesta lenta', 'necesito ayuda', 'requiero ayuda', 'solicito ayuda', 'problema urgente', 'caso urgente', 'no me han ayudado'
        ],
        'patterns': [
            r'support\s+issue', r'waiting\s+for', r'no\s+response', r'slow\s+response', r'escalation\s+request',
            r'problema\s+de\s+soporte', r'esperando\s+respuesta', r'no\s+me\s+responden', r'no\s+hay\s+respuesta', r'respuesta\s+lenta', r'solicitud\s+de\s+escalamiento', r'necesito\s+ayuda', r'problema\s+urgente'
        ]
    }
}

# General issue categories (kept for backward compatibility and additional context)
# Enhanced with Spanish (Latin American) keywords for bilingual support
ISSUE_CATEGORIES = {
    'payment': {
        'keywords': [
            # English
            'payment', 'pay', 'charge', 'billing', 'invoice', 'refund', 'money', 'cost', 'price', 'fee', 'transaction', 'card', 'credit',
            # Spanish (Latin America)
            'pago', 'pagar', 'cobro', 'cargo', 'factura', 'facturación', 'reembolso', 'reembolsar', 'dinero', 'costo', 'precio', 'tarifa', 'comisión', 'transacción', 'tarjeta', 'crédito'
        ],
        'patterns': [
            r'\$\d+', r'payment\s+issue', r'billing\s+problem',
            r'problema\s+de\s+pago', r'problema\s+con\s+el\s+pago', r'problema\s+de\s+facturación', r'cobro\s+incorrecto', r'cargo\s+incorrecto'
        ]
    },
    'technical': {
        'keywords': [
            # English
            'bug', 'error', 'crash', 'broken', 'not working', 'issue', 'problem', 'glitch', 'freeze', 'slow', 'loading', 'connection', 'login', 'password',
            # Spanish (Latin America)
            'error', 'errores', 'fallo', 'falla', 'roto', 'no funciona', 'no está funcionando', 'problema técnico', 'problema', 'glitch', 'se congela', 'congelado', 'lento', 'cargando', 'carga', 'conexión', 'iniciar sesión', 'login', 'contraseña', 'password', 'acceso', 'no puedo acceder', 'no puedo entrar', 'error al iniciar sesión', 'problema de conexión', 'no carga', 'está lento'
        ],
        'patterns': [
            r'error\s+\d+', r'bug\s+in', r'not\s+working', r'can\'t\s+login',
            r'no\s+funciona', r'no\s+está\s+funcionando', r'problema\s+técnico', r'error\s+al\s+iniciar\s+sesión', r'no\s+puedo\s+acceder', r'no\s+puedo\s+entrar', r'problema\s+de\s+conexión'
        ]
    },
    'account': {
        'keywords': [
            # English
            'account', 'profile', 'settings', 'access', 'permission', 'locked', 'suspended', 'verification', 'email', 'username',
            # Spanish (Latin America)
            'cuenta', 'perfil', 'configuración', 'configuraciones', 'acceso', 'permiso', 'bloqueado', 'bloqueada', 'suspendido', 'suspendida', 'verificación', 'correo', 'email', 'usuario', 'nombre de usuario', 'mi cuenta está bloqueada', 'cuenta bloqueada', 'no puedo acceder a mi cuenta', 'problema con mi cuenta', 'problema de cuenta'
        ],
        'patterns': [
            r'account\s+locked', r'can\'t\s+access', r'profile\s+issue',
            r'cuenta\s+bloqueada', r'no\s+puedo\s+acceder\s+a\s+mi\s+cuenta', r'problema\s+con\s+mi\s+cuenta', r'problema\s+de\s+cuenta'
        ]
    },
    'service': {
        'keywords': [
            # English
            'service', 'support', 'help', 'assistance', 'response', 'waiting', 'delay', 'time',
            # Spanish (Latin America)
            'servicio', 'soporte', 'ayuda', 'asistencia', 'respuesta', 'esperando', 'espera', 'retraso', 'demora', 'tiempo', 'no me responden', 'no hay respuesta', 'esperando respuesta', 'respuesta lenta'
        ],
        'patterns': [
            r'waiting\s+for', r'no\s+response', r'slow\s+response',
            r'esperando\s+respuesta', r'no\s+me\s+responden', r'no\s+hay\s+respuesta', r'respuesta\s+lenta'
        ]
    },
    'feature_request': {
        'keywords': [
            # English
            'feature', 'request', 'add', 'suggest', 'improvement', 'enhancement', 'wish', 'would like',
            # Spanish (Latin America)
            'funcionalidad', 'característica', 'solicitud', 'agregar', 'añadir', 'sugerir', 'sugerencia', 'mejora', 'mejorar', 'deseo', 'me gustaría', 'quisiera', 'podrían agregar', 'sería bueno', 'sería útil'
        ],
        'patterns': [
            r'add\s+feature', r'can\s+you\s+add', r'would\s+be\s+great',
            r'podrían\s+agregar', r'sería\s+bueno', r'sería\s+útil', r'me\s+gustaría\s+que'
        ]
    },
    'complaint': {
        'keywords': [
            # English
            'complaint', 'unhappy', 'dissatisfied', 'disappointed', 'frustrated', 'angry', 'upset', 'terrible', 'awful', 'horrible',
            # Spanish (Latin America)
            'queja', 'reclamo', 'insatisfecho', 'insatisfecha', 'decepcionado', 'decepcionada', 'frustrado', 'frustrada', 'enojado', 'enojada', 'molesto', 'molesta', 'terrible', 'horrible', 'pésimo', 'pésima', 'muy mal', 'muy malo', 'muy mala', 'no estoy contento', 'no estoy contenta', 'muy frustrado', 'muy frustrada', 'muy decepcionado', 'muy decepcionada'
        ],
        'patterns': [
            r'very\s+disappointed', r'not\s+happy', r'very\s+frustrated',
            r'muy\s+decepcionado', r'muy\s+decepcionada', r'no\s+estoy\s+contento', r'no\s+estoy\s+contenta', r'muy\s+frustrado', r'muy\s+frustrada', r'muy\s+molesto', r'muy\s+molesta'
        ]
    },
    'question': {
        'keywords': [
            # English
            'question', 'how', 'what', 'why', 'when', 'where', 'explain', 'clarify', 'understand',
            # Spanish (Latin America)
            'pregunta', 'consulta', 'cómo', 'qué', 'por qué', 'cuándo', 'dónde', 'explicar', 'explicación', 'aclarar', 'aclaración', 'entender', 'comprender', 'no entiendo', 'no comprendo', 'podrían explicar', 'me pueden explicar', 'necesito saber', 'quiero saber'
        ],
        'patterns': [
            r'how\s+do\s+i', r'what\s+is', r'can\s+you\s+explain',
            r'cómo\s+hago', r'qué\s+es', r'podrían\s+explicar', r'me\s+pueden\s+explicar', r'no\s+entiendo', r'necesito\s+saber'
        ]
    },
    'refund': {
        'keywords': [
            # English
            'refund', 'return', 'money back', 'cancel', 'reimbursement',
            # Spanish (Latin America)
            'reembolso', 'reembolsar', 'reembolsen', 'devolución', 'devolver', 'devolver dinero', 'cancelar', 'cancelación', 'quiero mi dinero de vuelta', 'quiero que me devuelvan', 'necesito reembolso', 'solicito reembolso', 'reembolso de dinero'
        ],
        'patterns': [
            r'refund\s+request', r'want\s+my\s+money\s+back', r'cancel\s+and\s+refund',
            r'solicito\s+reembolso', r'quiero\s+mi\s+dinero\s+de\s+vuelta', r'quiero\s+que\s+me\s+devuelvan', r'necesito\s+reembolso', r'reembolso\s+de\s+dinero'
        ]
    },
    'delivery': {
        'keywords': [
            # English
            'delivery', 'shipping', 'shipment', 'order', 'package', 'arrive', 'tracking',
            # Spanish (Latin America)
            'entrega', 'envío', 'enviar', 'pedido', 'orden', 'paquete', 'llegar', 'llegada', 'rastreo', 'seguimiento', 'dónde está mi pedido', 'dónde está mi orden', 'problema de entrega', 'problema con el envío', 'no ha llegado', 'no llegó'
        ],
        'patterns': [
            r'where\s+is\s+my\s+order', r'delivery\s+issue', r'shipping\s+problem',
            r'dónde\s+está\s+mi\s+pedido', r'dónde\s+está\s+mi\s+orden', r'problema\s+de\s+entrega', r'problema\s+con\s+el\s+envío', r'no\s+ha\s+llegado', r'no\s+llegó'
        ]
    },
    'quality': {
        'keywords': [
            # English
            'quality', 'defect', 'damaged', 'broken', 'wrong', 'incorrect', 'faulty',
            # Spanish (Latin America)
            'calidad', 'defecto', 'defectuoso', 'defectuosa', 'dañado', 'dañada', 'roto', 'rota', 'incorrecto', 'incorrecta', 'malo', 'mala', 'pobre calidad', 'mala calidad', 'producto defectuoso', 'está roto', 'está dañado', 'está incorrecto'
        ],
        'patterns': [
            r'poor\s+quality', r'defective', r'damaged\s+product',
            r'pobre\s+calidad', r'mala\s+calidad', r'producto\s+defectuoso', r'está\s+roto', r'está\s+dañado', r'está\s+incorrecto'
        ]
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

