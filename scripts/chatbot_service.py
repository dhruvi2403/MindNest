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
        
        # Mental health trigger words and responses
        self.mental_health_responses = {
            'anxiety': {
                'triggers': [r'\b(anxious|anxiety|worried|worry|nervous|panic|panicking|scared|fear|afraid|terrified)\b',
                           r'\b(can\'?t breathe|breathing|breath|hyperventilat|suffocating)\b',
                           r'\b(heart racing|palpitations|sweating|trembling|shaking|racing thoughts)\b',
                           r'\b(what if|worst case|something bad|disaster|catastrophe)\b'],
                'response': "I understand you're feeling anxious. Try the Box Breathing technique: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Repeat this 4 times. This can help calm your nervous system.",
                'suggestions': ["More breathing exercises", "Find a therapist", "Take assessment", "Relaxation techniques"]
            },
            'depression': {
                'triggers': [r'\b(depressed|depression|sad|sadness|hopeless|empty|numb|worthless|useless)\b',
                           r'\b(no energy|tired|exhausted|can\'?t get up|unmotivated|no motivation)\b',
                           r'\b(don\'?t care|nothing matters|pointless|give up|want to die)\b',
                           r'\b(hate myself|hate my life|life sucks|everything is terrible)\b'],
                'response': "I hear that you're going through a difficult time. Try one small activation step: drink a glass of water, step outside for a moment, or do a gentle stretch. Small actions can help break through inertia and create momentum.",
                'suggestions': ["Simple activities", "Professional help", "Take assessment", "Support resources"]
            },
            'stress': {
                'triggers': [r'\b(stressed|stress|overwhelmed|pressure|burden|too much)\b',
                           r'\b(can\'?t handle|breaking point|burnt out|exhausted)\b'],
                'response': "Stress can feel overwhelming. Try Progressive Muscle Relaxation: Starting from your toes, tense each muscle group for 5 seconds, then relax. Work your way up to your head. This helps release physical tension.",
                'suggestions': ["Relaxation techniques", "Stress management", "Take a break", "Find support"]
            },
            'burnout': {
                'triggers': [r'\b(burnt out|burnout|burned out|drained|exhausted|overworked)\b',
                           r'\b(no motivation|can\'?t focus|mentally tired)\b'],
                'response': "Burnout is real and valid. Take a micro-break reset: Step away from screens for 5 minutes, stand up, take deep breaths, sip some water, and look outside. Small breaks can help restore your energy.",
                'suggestions': ["Break strategies", "Work-life balance", "Professional guidance", "Self-care tips"]
            },
            'overwhelmed': {
                'triggers': [r'\b(overwhelmed|too much|can\'?t cope|drowning|swamped)\b',
                           r'\b(everything at once|so many things|don\'?t know where to start)\b'],
                'response': "When everything feels overwhelming, try a Brain Dump: Write everything on paper that's on your mind, then circle the top 1-2 priorities. This helps organize your thoughts and focus on what's most important.",
                'suggestions': ["Organization tips", "Priority setting", "Time management", "Get support"]
            },
            'lonely': {
                'triggers': [r'\b(lonely|alone|isolated|no one|nobody)\b',
                           r'\b(no friends|disconnected|left out)\b'],
                'response': "Loneliness can be really painful. Try a Connection Prompt: Send a short text or voice note to someone you trust - even a simple 'thinking of you' can rebuild connection and remind you that you matter to others.",
                'suggestions': ["Connection ideas", "Social support", "Community resources", "Find therapist"]
            },
            'panic': {
                'triggers': [r'\b(panic|panicking|panic attack|can\'?t breathe|hyperventilat)\b',
                           r'\b(heart pounding|dizzy|shaking|losing control)\b'],
                'response': "During panic, try the 5-4-3-2-1 Grounding technique: Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. This helps bring you back to the present moment.",
                'suggestions': ["Grounding techniques", "Breathing exercises", "Emergency support", "Professional help"]
            },
            'trauma': {
                'triggers': [r'\b(trauma|traumatic|triggered|flashback|nightmare)\b',
                           r'\b(ptsd|post traumatic|reliving|haunted)\b'],
                'response': "Trauma responses are your body's way of protecting you. Try Safe Place Visualization: Close your eyes and imagine a place where you feel completely safe and comfortable. Focus on the details - what you see, hear, and feel there.",
                'suggestions': ["Trauma resources", "Professional therapy", "Safety techniques", "Support groups"]
            },
            'hopeless': {
                'triggers': [r'\b(hopeless|no hope|give up|what\'?s the point|no future)\b',
                           r'\b(nothing will change|stuck forever|no way out)\b'],
                'response': "Hopelessness feels heavy, but it's temporary. Try creating a Future Anchor: Write down one small thing you can look forward to tomorrow - it could be as simple as your morning coffee or a favorite song.",
                'suggestions': ["Hope building", "Future planning", "Crisis support", "Professional help"]
            },
            'helpless': {
                'triggers': [r'\b(helpless|powerless|can\'?t do anything|no control|stuck)\b',
                           r'\b(victim|trapped|no choice|at mercy)\b'],
                'response': "Feeling helpless is difficult, but you have more power than you realize. Try a Reframe Power exercise: List 3 things you can control today, even small ones like what you eat, wear, or listen to.",
                'suggestions': ["Empowerment exercises", "Control strategies", "Personal agency", "Support resources"]
            },
            'fear': {
                'triggers': [r'\b(scared|afraid|fear|terrified|frightened)\b',
                           r'\b(what if|worst case|something bad|disaster)\b'],
                'response': "Fear can feel very real even when the threat isn't immediate. Try a Reality Check: Ask yourself 'Is this fear based on something real and likely, or is it imagined?' Then replace the fearful thought with a factual one.",
                'suggestions': ["Fear management", "Reality testing", "Coping strategies", "Professional guidance"]
            },
            'anger': {
                'triggers': [r'\b(angry|mad|furious|rage|pissed|irritated)\b',
                           r'\b(want to hit|so mad|can\'?t stand|hate)\b'],
                'response': "Anger is energy that needs release. Try an Energy Release: Do 20 jumping jacks, take a fast walk, or do pushups until the intensity lowers. Physical movement helps process anger in a healthy way.",
                'suggestions': ["Anger management", "Physical outlets", "Communication skills", "Conflict resolution"]
            },
            'guilt': {
                'triggers': [r'\b(guilty|guilt|my fault|should have|shouldn\'?t have)\b',
                           r'\b(regret|mistake|wrong|bad person)\b'],
                'response': "Guilt can be a heavy burden. Try writing a Self-Forgiveness Note: Write what happened and include one thing you've learned from it. Learning from mistakes is how we grow as humans.",
                'suggestions': ["Self-forgiveness", "Learning from mistakes", "Moving forward", "Professional support"]
            },
            'shame': {
                'triggers': [r'\b(ashamed|shame|embarrassed|humiliated|worthless)\b',
                           r'\b(not good enough|failure|disgusting|pathetic)\b'],
                'response': "Shame attacks our sense of self-worth. Try a Compassion Practice: Speak to yourself as you would to your best friend facing the same situation. You deserve the same kindness you'd give others.",
                'suggestions': ["Self-compassion", "Self-worth building", "Shame resilience", "Therapeutic support"]
            },
            'grief': {
                'triggers': [r'\b(grief|grieving|loss|died|death|miss|gone)\b',
                           r'\b(funeral|memorial|passed away|lost someone)\b'],
                'response': "Grief is love with nowhere to go, and it's a natural response to loss. Try a Memory Ritual: Light a candle or write about a good memory with what or whom you've lost. Honoring memories can bring comfort.",
                'suggestions': ["Grief support", "Memory keeping", "Bereavement resources", "Professional counseling"]
            },
            'insecure': {
                'triggers': [r'\b(insecure|not good enough|inadequate|inferior|compare)\b',
                           r'\b(everyone else|better than me|don\'?t measure up)\b'],
                'response': "Insecurity often comes from comparing our inside to others' outside. Try an Affirmation Reset: Write down 3 strengths or qualities you genuinely value in yourself. Focus on your unique worth.",
                'suggestions': ["Self-esteem building", "Confidence exercises", "Comparison management", "Personal growth"]
            },
            'restless': {
                'triggers': [r'\b(restless|can\'?t sit still|agitated|fidgety|on edge)\b',
                           r'\b(need to move|pacing|can\'?t relax)\b'],
                'response': "Restlessness often signals your body needs attention. Try a Body Scan: Lie down and mentally scan your body from head to toe, consciously releasing tension in each area. This helps calm both mind and body.",
                'suggestions': ["Relaxation techniques", "Movement exercises", "Mindfulness practices", "Calming strategies"]
            },
            'exhausted': {
                'triggers': [r'\b(exhausted|drained|worn out|no energy|so tired)\b',
                           r'\b(can\'?t go on|running on empty|depleted)\b'],
                'response': "Exhaustion is your body's signal to rest. Try a Mini Recharge: Close your eyes and take 10 deep breaths, or if possible, take a 10-minute power nap. Even brief rest can help restore some energy.",
                'suggestions': ["Rest strategies", "Energy management", "Sleep hygiene", "Recovery techniques"]
            },
            'irritable': {
                'triggers': [r'\b(irritated|irritable|annoyed|cranky|short temper)\b',
                           r'\b(everything annoys|on my nerves|snappy)\b'],
                'response': "Irritability often signals we're overwhelmed or need a break. Try Pause and Label: Stop what you're doing, name the feeling out loud ('I'm feeling irritated'), then take 3 slow, deep breaths.",
                'suggestions': ["Emotional regulation", "Stress management", "Patience building", "Self-awareness"]
            }
        }

        # Response patterns
        self.patterns = {
            'greeting': [r'\b(hi|hello|hey|greetings)\b', r'\bgood (morning|afternoon|evening)\b'],
            'help': [r'\b(help|assist|support)\b', r'\bwhat can you do\b', r'\bhow.*work\b'],
            'navigation': [r'\b(go to|navigate|find|where)\b', r'\b(dashboard|assessment|therapist|profile)\b'],
            'motivation': [r'\b(motivat|inspir|encourag)\b', r'\bneed.*support\b'],
            'assessment': [r'\b(test|assessment|questionnaire|evaluate)\b', r'\bmental health.*check\b'],
            'therapist': [r'\b(therapist|counselor|psychologist|professional)\b', r'\bfind.*help\b'],
            'goodbye': [r'\b(bye|goodbye|see you|thanks)\b', r'\btalk.*later\b'],
            'mental_health': []  # Will be populated dynamically
        }

    def detect_mental_health_trigger(self, message: str) -> tuple:
        """Detect mental health triggers in message and return (trigger_type, response_data)"""
        message_lower = message.lower()

        for trigger_type, data in self.mental_health_responses.items():
            for pattern in data['triggers']:
                if re.search(pattern, message_lower):
                    return trigger_type, data

        return None, None

    def get_intent(self, message: str) -> str:
        """Determine user intent from message"""
        message_lower = message.lower()

        # First check for mental health triggers
        trigger_type, _ = self.detect_mental_health_trigger(message)
        if trigger_type:
            return 'mental_health'

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
                
        elif intent == 'mental_health':
            # Handle mental health triggers with specific responses
            trigger_type, trigger_data = self.detect_mental_health_trigger(message)
            if trigger_data:
                response_data["message"] = trigger_data['response']
                response_data["suggestions"] = trigger_data['suggestions']
                # Add crisis support if needed
                if trigger_type in ['panic', 'hopeless', 'trauma']:
                    response_data["suggestions"].append("Crisis support")
                    response_data["message"] += "\n\nIf you're in immediate crisis, please contact emergency services or a crisis hotline."
            else:
                # Fallback to general mental health support
                response_data["message"] = "I understand you're going through something difficult. I'm here to support you. Would you like to talk about what's on your mind?"
                response_data["suggestions"] = ["Find therapist", "Take assessment", "Get support", "Crisis resources"]

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
            # Check if user is asking for more techniques
            if any(phrase in message.lower() for phrase in ['more breathing', 'breathing exercises', 'more techniques']):
                techniques = self.get_additional_techniques('breathing')
                response_data["message"] = techniques['message']
                response_data["suggestions"] = techniques['suggestions']
            elif any(phrase in message.lower() for phrase in ['relaxation', 'muscle relaxation', 'relax']):
                techniques = self.get_additional_techniques('relaxation')
                response_data["message"] = techniques['message']
                response_data["suggestions"] = techniques['suggestions']
            elif any(phrase in message.lower() for phrase in ['grounding', 'panic', 'more grounding']):
                techniques = self.get_additional_techniques('grounding')
                response_data["message"] = techniques['message']
                response_data["suggestions"] = techniques['suggestions']
            elif any(word in message.lower() for word in ['breathing', 'exercise', 'technique', 'help me', 'what should i do']):
                response_data["message"] = """Here are some quick techniques you can try:

**For Anxiety:** Box breathing (4-4-4-4 pattern)
**For Stress:** Progressive muscle relaxation
**For Overwhelm:** Brain dump on paper
**For Panic:** 5-4-3-2-1 grounding technique
**For Low Mood:** One small activation step

What specific situation would you like help with?"""
                response_data["suggestions"] = ["I'm anxious", "I'm stressed", "I'm overwhelmed", "I'm sad"]
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

    def get_additional_techniques(self, technique_type: str) -> Dict[str, Any]:
        """Get additional techniques based on type"""
        techniques = {
            'breathing': {
                'message': """Here are more breathing techniques:

**4-7-8 Breathing:** Inhale for 4, hold for 7, exhale for 8
**Belly Breathing:** Place hand on chest, one on belly. Breathe so only belly hand moves
**Coherent Breathing:** Inhale for 5 seconds, exhale for 5 seconds
**Triangle Breathing:** Inhale for 3, hold for 3, exhale for 3

Try these when you need to calm your nervous system.""",
                'suggestions': ['More techniques', 'Find therapist', 'Take assessment']
            },
            'relaxation': {
                'message': """Progressive Muscle Relaxation steps:

1. **Feet:** Tense for 5 seconds, then relax
2. **Calves:** Tense and relax
3. **Thighs:** Tense and relax
4. **Hands:** Make fists, then relax
5. **Arms:** Tense and relax
6. **Shoulders:** Raise to ears, then drop
7. **Face:** Scrunch up, then relax

Work through each muscle group slowly.""",
                'suggestions': ['Other techniques', 'Stress management', 'Professional help']
            },
            'grounding': {
                'message': """Grounding techniques for anxiety/panic:

**5-4-3-2-1:** 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste
**54321 Countdown:** Count backwards from 54321 slowly
**Cold Water:** Splash cold water on face or hold ice cubes
**Name Game:** Name 5 animals, 5 colors, 5 foods
**Feet on Ground:** Feel your feet touching the floor

These help bring you back to the present moment.""",
                'suggestions': ['Breathing exercises', 'More grounding', 'Emergency support']
            }
        }

        return techniques.get(technique_type, {
            'message': "I'd be happy to help with more techniques. What specific area would you like to work on?",
            'suggestions': ['Breathing exercises', 'Relaxation techniques', 'Grounding methods']
        })

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

@app.route('/techniques/<technique_type>', methods=['GET'])
def get_techniques(technique_type):
    """Get specific mental health techniques"""
    try:
        techniques = chatbot.get_additional_techniques(technique_type)
        return jsonify(techniques)
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
