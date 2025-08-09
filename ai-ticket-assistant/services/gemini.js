const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async analyzeTicket(subject, description, category) {
    try {
      const prompt = `
Analyze this support ticket and provide the following information in JSON format:

Ticket Details:
- Subject: "${subject}"
- Description: "${description}"
- User Category: "${category}"

Please analyze and return ONLY a valid JSON object with these fields:
{
  "aiCategory": "The most appropriate category for this ticket",
  "aiPriority": "low, medium, or high based on urgency and impact",
  "aiSummary": "A brief 2-3 sentence summary of the issue",
  "suggestedTags": ["array", "of", "relevant", "tags"],
  "requiredSkills": ["array", "of", "technical", "skills", "needed"]
}

Consider these factors:
- Priority: high for critical system issues, security problems, or service outages
- Priority: medium for feature requests, account issues, or moderate bugs  
- Priority: low for general questions, documentation requests, or minor issues
- Tags should be technical keywords related to the issue
- Required skills should match common technical competencies
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse the JSON response
      const cleanedText = this.extractJSON(text);
      const analysis = JSON.parse(cleanedText);
      
      // Validate and sanitize the response
      return this.validateAnalysis(analysis);
      
    } catch (error) {
      console.error('Gemini AI analysis error:', error);
      
      // Return fallback analysis
      return this.getFallbackAnalysis(subject, description, category);
    }
  }

  extractJSON(text) {
    // Remove markdown code blocks and extra text
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Find JSON object boundaries
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}') + 1;
    
    if (start === -1 || end === 0) {
      throw new Error('No JSON object found in response');
    }
    
    return cleaned.substring(start, end);
  }

  validateAnalysis(analysis) {
    const validCategories = [
      'Technical Issue', 'Account Problem', 'Feature Request', 'Bug Report',
      'General Inquiry', 'Billing', 'Security', 'Performance', 'Integration', 'Other'
    ];
    
    const validPriorities = ['low', 'medium', 'high'];
    
    return {
      aiCategory: validCategories.includes(analysis.aiCategory) ? analysis.aiCategory : 'Other',
      aiPriority: validPriorities.includes(analysis.aiPriority) ? analysis.aiPriority : 'medium',
      aiSummary: typeof analysis.aiSummary === 'string' ? 
        analysis.aiSummary.substring(0, 1000) : 'AI analysis summary not available',
      suggestedTags: Array.isArray(analysis.suggestedTags) ? 
        analysis.suggestedTags.slice(0, 10).filter(tag => typeof tag === 'string') : [],
      requiredSkills: Array.isArray(analysis.requiredSkills) ? 
        analysis.requiredSkills.slice(0, 5).filter(skill => typeof skill === 'string') : []
    };
  }

  getFallbackAnalysis(subject, description, category) {
    // Simple keyword-based fallback analysis
    const text = `${subject} ${description}`.toLowerCase();
    
    let priority = 'medium';
    if (text.includes('urgent') || text.includes('critical') || text.includes('down') || 
        text.includes('error') || text.includes('security') || text.includes('hack')) {
      priority = 'high';
    } else if (text.includes('request') || text.includes('question') || text.includes('help')) {
      priority = 'low';
    }

    const tags = [];
    const skillKeywords = {
      'react': 'React',
      'node': 'Node.js', 
      'javascript': 'JavaScript',
      'database': 'Database',
      'api': 'API',
      'frontend': 'Frontend',
      'backend': 'Backend',
      'mobile': 'Mobile',
      'web': 'Web Development'
    };

    Object.keys(skillKeywords).forEach(keyword => {
      if (text.includes(keyword)) {
        tags.push(skillKeywords[keyword]);
      }
    });

    return {
      aiCategory: category || 'General Inquiry',
      aiPriority: priority,
      aiSummary: `Ticket regarding ${subject.toLowerCase()}. Requires technical assistance.`,
      suggestedTags: tags.slice(0, 5),
      requiredSkills: tags.slice(0, 3)
    };
  }

  async generateResponse(ticketData, context = '') {
    try {
      const prompt = `
As an AI assistant for a support system, help generate a helpful response for this ticket:

Ticket: ${ticketData.subject}
Description: ${ticketData.description}
Category: ${ticketData.category}
${context ? `Additional Context: ${context}` : ''}

Provide a professional, helpful response that:
1. Acknowledges the user's issue
2. Provides initial troubleshooting steps or guidance
3. Is concise but comprehensive
4. Maintains a friendly, supportive tone

Response (max 500 words):
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().substring(0, 2000); // Limit response length
      
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'Thank you for contacting support. We have received your request and will review it shortly. A team member will respond to you as soon as possible.';
    }
  }
}

module.exports = new GeminiService();