"""
Test the improved sentiment analysis on specific feedback examples
"""

from analyze_feedback import improved_spanish_sentiment_analysis

def test_specific_feedback():
    """Test the specific feedback that was misclassified"""
    
    test_feedback = """Utilizan la plataforma para poder tener los contratos con workers de diversos países y poder hacer los pagos internacionales.
Les funciona poder cancelar transacciones porque a veces necesitan corregir el monto por algún pago extra y así lo podrán hacer si temas. Auto-charge les parece bien para tener las membresias pagadas sin problemas. Tienen quickbooks como herramienta contábil, entonces ya pregunté a Santi Varela si pueden utilizar la integración, una vez que no están en la lista que había compartido. En lo general no tienen problema con Ontop y les gusta mucho el servicio que prestamos."""
    
    print("🧪 Testing Improved Sentiment Analysis")
    print("=" * 60)
    print("📝 Feedback Text:")
    print(test_feedback)
    print("\n" + "-" * 60)
    
    # Analyze with improved system
    result = improved_spanish_sentiment_analysis(test_feedback)
    
    print("🎯 Analysis Results:")
    print(f"   Sentiment: {result['sentiment']}")
    print(f"   Confidence: {result['confidence']:.2f}")
    print(f"   Method: {result['method']}")
    if 'vader_score' in result:
        print(f"   VADER Score: {result['vader_score']:.3f}")
    if 'textblob_score' in result:
        print(f"   TextBlob Score: {result['textblob_score']:.3f}")
    
    print("\n✅ Expected: POSITIVE")
    print(f"🎯 Predicted: {result['sentiment']}")
    
    if result['sentiment'] == 'Positive':
        print("🎉 SUCCESS! Correctly classified as POSITIVE")
    else:
        print("❌ FAILED! Still misclassified")
    
    # Test a few more examples
    print("\n" + "=" * 60)
    print("🧪 Testing Additional Examples:")
    
    additional_tests = [
        ("Conformes de nuestro lado.", "Positive"),
        ("Estamos muy conformes con el servicio prestado", "Positive"),
        ("Le encanta la plataforma", "Positive"),
        ("No funciona la plataforma y tenemos problemas", "Negative"),
        ("Es difícil de usar y muy lento", "Negative")
    ]
    
    for i, (text, expected) in enumerate(additional_tests, 1):
        result = improved_spanish_sentiment_analysis(text)
        status = "✅" if result['sentiment'] == expected else "❌"
        print(f"{i}. {status} '{text[:50]}...' → {result['sentiment']} (expected {expected})")

if __name__ == "__main__":
    test_specific_feedback()
