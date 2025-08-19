from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import re
import datetime
import json
from typing import Dict, List, Any

app = Flask(__name__)
CORS(app)

class MindNestChatbot:
    def __init__(self):
        self.conversation_history = []
        self.user_context = {}
        
        # Greeting responses
        self.greetings = [
            "Hello! I'm your MindNest companion. How can I help you today?",
            "Hi there! Welcome to MindNest. I'm here to support you on your mental wellness journey.",
            "Greetings! I'm your personal wellness assistant. What would you like to explore today?",
            "Hello! I'm here to help you navigate MindNest and provide support. How are you feeling today?"
        ]
        
        # Motivational statements
        self.motivational_quotes = [
            "Remember, every small step forward is progress. You're doing great!",
            "Your mental health journey is unique and valuable. Be patient with yourself.",
            "It's okay to have difficult days. What matters is that you're taking care of yourself.",
            "You have the strength to overcome challenges. I believe in you!",
            "Taking time for your mental health is not selfish - it's necessary.",
            "Progress isn't always linear, and that's perfectly okay.",
            "You're brave for prioritizing your mental wellness.",
            "Every day you choose to care for yourself is a victory.",
            "Your feelings are valid, and seeking help shows strength.",
            "Small acts of self-care can make a big difference."
        ]
        
        # Navigation help
        self.navigation_help = {
            "dashboard": {
                "description": "Your personal wellness dashboard with stats and quick actions",
                "url": "/dashboard",
                "features": ["View wellness stats", "Quick assessment access", "Recent activity", "Mental health tips"]
            },
            "assessment": {
                "description": "Take a comprehensive mental health assessment",
                "url": "/assessment",
                "features": ["Detailed questionnaire", "AI-powered analysis", "Personalized recommendations", "Progress tracking"]
            },
            "therapist": {
                "description": "Find and connect with mental health professionals",
                "url": "/therapists",
                "features": ["Browse therapists", "Filter by specialty", "Read reviews", "Book consultations"]
            },
            "profile": {
                "description": "Manage your account and view your wellness journey",
                "url": "/profile",
                "features": ["Personal information", "Assessment history", "Progress tracking", "Account settings"]
            }
        }
        
        # Response patterns
        self.patterns = {
            'greeting': [r'\b(hi|hello|hey|greetings)\b', r'\bgood (morning|afternoon|evening)\b'],
            'help': [r'\b(help|assist|support)\b', r'\bwhat can you do\b', r'\bhow.*work\b'],
            'navigation': [r'\b(go to|navigate|find|where)\b', r'\b(dashboard|assessment|therapist|profile)\b'],
            'motivation': [r'\b(motivat|inspir|encourag)\b', r'\b(sad|down|depressed|anxious)\b', r'\bneed.*support\b'],
            'assessment': [r'\b(test|assessment|questionnaire|evaluate)\b', r'\bmental health.*check\b'],
            'therapist': [r'\b(therapist|counselor|psychologist|professional)\b', r'\bfind.*help\b'],
            'goodbye': [r'\b(bye|goodbye|see you|thanks)\b', r'\btalk.*later\b']
        }

    def get_intent(self, message: str) -> str:
        """Determine user intent from message"""
        message_lower = message.lower()
        
        for intent, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    return intent
        
        return 'general'

    def generate_response(self, message: str, user_id: str = None) -> Dict[str, Any]:
        """Generate chatbot response based on user message"""
        intent = self.get_intent(message)
        
        response_data = {
            "message": "",
            "suggestions": [],
            "actions": [],
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        if intent == 'greeting':
            response_data["message"] = random.choice(self.greetings)
            response_data["suggestions"] = [
                "Take an assessment",
                "Find a therapist",
                "View my dashboard",
                "Get motivation"
            ]
            
        elif intent == 'help':
            response_data["message"] = """I'm here to help you with:
            
🏠 **Navigation**: I can guide you to different sections of MindNest
📊 **Dashboard**: View your wellness stats and progress
📝 **Assessment**: Take mental health evaluations
👩‍⚕️ **Therapists**: Find mental health professionals
💪 **Motivation**: Get encouraging words and support
📱 **General Support**: Answer questions about using the platform

What would you like to explore?"""
            response_data["suggestions"] = ["Show me around", "Take assessment", "Find therapist", "Motivate me"]
            
        elif intent == 'navigation':
            page = self.extract_page_from_message(message)
            if page:
                nav_info = self.navigation_help.get(page)
                if nav_info:
                    response_data["message"] = f"""**{page.title()} Page**
                    
{nav_info['description']}

**Features available:**
{chr(10).join([f"• {feature}" for feature in nav_info['features']])}

Would you like me to take you there?"""
                    response_data["actions"] = [{"type": "navigate", "url": nav_info["url"], "label": f"Go to {page.title()}"}]
                else:
                    response_data["message"] = "I can help you navigate to: Dashboard, Assessment, Therapist Directory, or Profile. Which would you like to visit?"
            else:
                response_data["message"] = """I can help you navigate MindNest! Here are the main sections:
                
🏠 **Dashboard** - Your wellness overview
📝 **Assessment** - Take mental health evaluations  
👩‍⚕️ **Therapist** - Find mental health professionals
👤 **Profile** - Manage your account

Which section would you like to visit?"""
                response_data["suggestions"] = ["Dashboard", "Assessment", "Therapist", "Profile"]
                
        elif intent == 'motivation':
            response_data["message"] = random.choice(self.motivational_quotes)
            response_data["suggestions"] = ["Another quote", "Take assessment", "Find support"]
            
        elif intent == 'assessment':
            response_data["message"] = """Our comprehensive assessment helps evaluate your mental wellness across multiple dimensions:

📊 **What it includes:**
• Mood and emotional state
• Stress and anxiety levels  
• Sleep and lifestyle factors
• Social and work relationships

🤖 **AI Analysis:**
• Personalized insights
• Risk factor identification
• Tailored recommendations
• Progress tracking

Ready to begin your assessment?"""
            response_data["actions"] = [{"type": "navigate", "url": "/assessment", "label": "Start Assessment"}]
            
        elif intent == 'therapist':
            response_data["message"] = """Find the right mental health professional for your needs:

🔍 **Search & Filter:**
• By specialty (anxiety, depression, trauma, etc.)
• By location and availability
• By therapy approach (CBT, DBT, etc.)
• By insurance accepted

👩‍⚕️ **Professional Profiles:**
• Detailed backgrounds and experience
• Patient reviews and ratings
• Consultation booking
• Secure messaging

Would you like to browse our therapist directory?"""
            response_data["actions"] = [{"type": "navigate", "url": "/therapists", "label": "Find Therapists"}]
            
        elif intent == 'goodbye':
            farewells = [
                "Take care! Remember, I'm always here when you need support.",
                "Goodbye! Keep prioritizing your mental wellness.",
                "See you later! You're doing great on your wellness journey.",
                "Until next time! Remember to be kind to yourself."
            ]
            response_data["message"] = random.choice(farewells)
            
        else:
            # General conversation
            general_responses = [
                "I understand you're looking for support. How can I help you today?",
                "I'm here to assist with your mental wellness journey. What would you like to explore?",
                "That's interesting! Is there something specific about MindNest I can help you with?",
                "I'm listening. How can I support you right now?"
            ]
            response_data["message"] = random.choice(general_responses)
            response_data["suggestions"] = ["Get help", "Take assessment", "Find therapist", "Motivate me"]
        
        # Add conversation to history
        self.conversation_history.append({
            "user_message": message,
            "bot_response": response_data["message"],
            "intent": intent,
            "timestamp": response_data["timestamp"]
        })
        
        return response_data

    def extract_page_from_message(self, message: str) -> str:
        """Extract page name from user message"""
        message_lower = message.lower()
        for page in self.navigation_help.keys():
            if page in message_lower:
                return page
        return None

    def get_random_motivation(self) -> str:
        """Get a random motivational quote"""
        return random.choice(self.motivational_quotes)

# Initialize chatbot
chatbot = MindNestChatbot()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "MindNest Chatbot"})

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        user_id = data.get('user_id', 'anonymous')
        
        if not message:
            return jsonify({"error": "Message is required"}), 400
        
        response = chatbot.generate_response(message, user_id)
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/motivation', methods=['GET'])
def get_motivation():
    """Get random motivational quote"""
    try:
        quote = chatbot.get_random_motivation()
        return jsonify({"message": quote, "type": "motivation"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/navigation-help', methods=['GET'])
def navigation_help():
    """Get navigation help information"""
    try:
        return jsonify({"navigation": chatbot.navigation_help})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/conversation-history', methods=['GET'])
def get_conversation_history():
    """Get conversation history"""
    try:
        user_id = request.args.get('user_id', 'anonymous')
        # In a real app, filter by user_id
        return jsonify({"history": chatbot.conversation_history[-10:]})  # Last 10 messages
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🤖 MindNest Chatbot Service Starting...")
    print("📍 Available endpoints:")
    print("   POST /chat - Main chat interface")
    print("   GET /motivation - Random motivational quotes")
    print("   GET /navigation-help - Navigation assistance")
    print("   GET /health - Health check")
    print("🚀 Starting server on http://localhost:5001")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
