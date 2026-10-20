import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

let genAI = null;
if (apiKey && apiKey.trim().length > 0) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log(`[AI Service] Google Gemini API initialized with model ${modelName}.`);
  } catch (err) {
    console.warn(`[AI Service] Failed to initialize Gemini API: ${err.message}. Using built-in fallback.`);
  }
} else {
  console.log(`[AI Service] No GEMINI_API_KEY detected. PlaceMentor will run in built-in fallback mode with rich pre-calibrated evaluations.`);
}

export const getAIStatus = () => ({
  provider: genAI ? 'gemini' : 'builtin-mock',
  hasApiKey: Boolean(apiKey && apiKey.trim().length > 0),
  model: genAI ? modelName : 'PlaceMentor Smart Evaluation Engine v1.0'
});

/* ================= ROLE-BASED INTERVIEW QUESTIONS POOL ================= */
const ROLE_QUESTION_BANKS = {
  'Software Engineer (SDE I)': [
    {
      question: "Could you walk me through your background and discuss a software engineering project you built recently?",
      category: "Introductory"
    },
    {
      question: "How would you explain the difference between a Process and a Thread? How does context switching work in operating systems?",
      category: "OS & Concurrency"
    },
    {
      question: "If you need to find the top K frequent elements in an unsorted stream of millions of numbers, what data structure and algorithmic approach would you use? What is the time and space complexity?",
      category: "DSA & Complexity"
    },
    {
      question: "Can you explain how database indexing works internally (B-Trees vs Hash indexes)? When would adding an index degrade database performance?",
      category: "DBMS & Performance"
    },
    {
      question: "Tell me about a time when you encountered a critical bug or production issue in your code. How did you identify the root cause and resolve it?",
      category: "Behavioral & Problem Solving"
    }
  ],
  'Frontend Developer': [
    {
      question: "Please introduce yourself and explain your favorite modern frontend tech stack and why you prefer it.",
      category: "Introductory"
    },
    {
      question: "How does the Virtual DOM reconciliation algorithm work in React? How does React 18/19 handle concurrent rendering and automatic batching?",
      category: "Core React"
    },
    {
      question: "Explain the JavaScript Event Loop, Microtask Queue vs Macrotask Queue, and how `Promise.resolve()` vs `setTimeout(..., 0)` are prioritized.",
      category: "JavaScript Internals"
    },
    {
      question: "How do you optimize Web Vitals (LCP, FID/INP, CLS) for high-traffic web applications? What techniques do you use for code-splitting and asset loading?",
      category: "Frontend Performance"
    },
    {
      question: "Describe how you architect responsive, accessible, and maintainable component design systems.",
      category: "Architecture & Accessibility"
    }
  ],
  'Backend Developer': [
    {
      question: "Welcome! To start off, please tell me about your background and how you design scalable backend architectures.",
      category: "Introductory"
    },
    {
      question: "How do you handle horizontal scalability and state management in distributed Node.js / microservices applications?",
      category: "System Design"
    },
    {
      question: "Explain ACID properties in relational databases and how they contrast with the CAP theorem and eventual consistency in NoSQL stores.",
      category: "Databases & Distributed Systems"
    },
    {
      question: "How do you implement rate limiting, JWT authentication with token revocation, and prevent SQL injection or ReDoS attacks?",
      category: "Backend Security"
    },
    {
      question: "If an API endpoint suddenly experiences 10x traffic spikes causing 504 Gateway Timeouts, how would you diagnose and alleviate the bottleneck?",
      category: "Troubleshooting & Reliability"
    }
  ],
  'Full Stack Developer': [
    {
      question: "Hi! Please introduce yourself and highlight a complete end-to-end full stack application you engineered from scratch.",
      category: "Introductory"
    },
    {
      question: "How do you design RESTful and WebSocket APIs for real-time collaboration platforms? How do you maintain data synchronization across clients?",
      category: "API & WebSockets"
    },
    {
      question: "Walk through your deployment pipeline: containerization with Docker, CI/CD pipelines, and environment management.",
      category: "DevOps & Deployment"
    },
    {
      question: "Explain the trade-offs between Client-Side Rendering (CSR), Server-Side Rendering (SSR), and Static Site Generation (SSG).",
      category: "Web Architecture"
    },
    {
      question: "How do you ensure data integrity, validation, and error boundaries across both client and server layers?",
      category: "Full Stack Quality"
    }
  ],
  'Data Analyst / Data Scientist': [
    {
      question: "Welcome! Could you share your journey into data science and describe an insightful data project you have conducted?",
      category: "Introductory"
    },
    {
      question: "Explain how you handle missing data, outliers, and feature skewness in large structured datasets.",
      category: "Data Preprocessing"
    },
    {
      question: "Write or explain an SQL query using Window Functions (e.g. `DENSE_RANK()`, `LAG()`) to find monthly customer retention rates.",
      category: "Advanced SQL"
    },
    {
      question: "How do you evaluate machine learning classification models when dealing with heavily imbalanced classes (Precision, Recall, ROC-AUC)?",
      category: "Model Evaluation"
    },
    {
      question: "How do you translate complex technical statistical findings into actionable business recommendations for non-technical stakeholders?",
      category: "Business Communication"
    }
  ]
};

/* ================= INTERVIEW SERVICE METHODS ================= */

export const getInitialInterviewQuestion = (role, experienceLevel) => {
  const bank = ROLE_QUESTION_BANKS[role] || ROLE_QUESTION_BANKS['Software Engineer (SDE I)'];
  const first = bank[0];
  return {
    question: first.question,
    category: first.category || 'Introductory',
    questionIndex: 0,
    totalQuestions: bank.length
  };
};

export const evaluateInterviewAnswer = async ({ role, experienceLevel, questionText, candidateAnswer, questionIndex }) => {
  const bank = ROLE_QUESTION_BANKS[role] || ROLE_QUESTION_BANKS['Software Engineer (SDE I)'];
  const isFinalQuestion = questionIndex >= bank.length - 1;
  const nextQuestion = !isFinalQuestion ? bank[questionIndex + 1].question : null;
  const nextCategory = !isFinalQuestion ? bank[questionIndex + 1].category : null;

  // If Gemini API is configured, use real Gemini model
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `
You are a senior tech lead conducting a real placement interview for the role "${role}" (${experienceLevel}).
The question asked was: "${questionText}"
The candidate's response was: "${candidateAnswer}"

Analyze the candidate's answer objectively.
Return a STRICT JSON response (no markdown fences, just pure JSON) with the following structure:
{
  "score": <number between 1 and 10 representing quality and technical depth>,
  "relevance": "<'High' | 'Good' | 'Needs Focus'>",
  "clarity": "<'Clear & Structured' | 'Well Articulated' | 'Needs Elaboration'>",
  "technicalAccuracy": "<'Strong' | 'Good' | 'Basic' | 'Needs Depth'>",
  "feedback": "<2-3 concise sentences evaluating technical accuracy, clarity, and relevance>",
  "followUpComment": "<1 encouraging sentence acknowledging their answer>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<suggestion 1>", "<suggestion 2>"]
}
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        score: parsed.score || 7,
        relevance: parsed.relevance || 'Good',
        clarity: parsed.clarity || 'Well Articulated',
        technicalAccuracy: parsed.technicalAccuracy || 'Good',
        feedback: parsed.feedback || "Good explanation demonstrating fundamental understanding.",
        followUpComment: parsed.followUpComment || "Thank you for that response.",
        strengths: parsed.strengths || ["Clear structure"],
        improvements: parsed.improvements || ["Add more technical depth"],
        nextQuestion,
        nextCategory,
        isCompleted: isFinalQuestion,
        aiProvider: 'gemini'
      };
    } catch (err) {
      console.warn('[AI Service] Gemini call failed, falling back to smart evaluation:', err.message);
    }
  }

  // High-fidelity fallback evaluation engine
  const wordCount = candidateAnswer.trim().split(/\s+/).length;
  let score = 5;
  const strengths = [];
  const improvements = [];

  let relevance = 'Good';
  let clarity = 'Well Articulated';
  let technicalAccuracy = 'Good';

  if (wordCount >= 35) {
    score += 2;
    clarity = 'Clear & Structured';
    strengths.push("Thorough, well-developed response structure");
  } else if (wordCount >= 18) {
    score += 1;
    clarity = 'Well Articulated';
    strengths.push("Direct and concise answering style");
  } else {
    clarity = 'Needs Elaboration';
    improvements.push("Elaborate with concrete examples and technical depth");
  }

  const technicalKeywords = [
    'complexity', 'runtime', 'latency', 'optimize', 'index', 'database',
    'component', 'state', 'cache', 'thread', 'memory', 'scale', 'architecture',
    'transaction', 'async', 'algorithm', 'system', 'api', 'model', 'query'
  ];
  const matchedKeywords = technicalKeywords.filter(k => candidateAnswer.toLowerCase().includes(k));
  if (matchedKeywords.length >= 3) {
    score += 2;
    technicalAccuracy = 'Strong';
    relevance = 'High';
    strengths.push(`Effective use of engineering concepts (${matchedKeywords.slice(0, 3).join(', ')})`);
  } else if (matchedKeywords.length >= 1) {
    score += 1;
    technicalAccuracy = 'Good';
    relevance = 'Good';
    strengths.push("Identified core technical principles");
  } else {
    technicalAccuracy = 'Basic';
    relevance = wordCount >= 15 ? 'Good' : 'Needs Focus';
    improvements.push("Incorporate specific technical metrics and architectural trade-offs");
  }

  score = Math.min(Math.max(score, 4), 9); // Bounds 4 - 9

  let feedback = `Solid response demonstrating comprehension of ${role} concepts.`;
  if (score >= 8) {
    feedback = `Exceptional explanation! You articulated technical nuances clearly and backed your answer with practical reasoning.`;
  } else if (score >= 6) {
    feedback = `Good answer covering key points. To stand out further, consider discussing edge cases and complexity trade-offs.`;
  } else {
    feedback = `Acceptable attempt. Focus on structuring your answer using the STAR (Situation, Task, Action, Result) method and providing concrete technical specifics.`;
  }

  return {
    score,
    relevance,
    clarity,
    technicalAccuracy,
    feedback,
    followUpComment: isFinalQuestion ? "That concludes our core question rounds!" : "Great, let's move forward to the next challenge.",
    strengths,
    improvements,
    nextQuestion,
    nextCategory,
    isCompleted: isFinalQuestion,
    aiProvider: 'builtin-mock'
  };
};

export const generateInterviewFinalReport = async ({ role, experienceLevel, messages }) => {
  const scores = messages
    .filter(m => m.role === 'candidate' && typeof m.score === 'number')
    .map(m => m.score);

  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 7.5;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `
A student just completed a mock campus placement interview for ${role} (${experienceLevel}).
Transcript:
${messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}

Generate a comprehensive performance appraisal in STRICT JSON format:
{
  "overallScore": ${avg},
  "technicalAccuracy": <number 1-10>,
  "communication": <number 1-10>,
  "confidence": <number 1-10>,
  "problemSolving": <number 1-10>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "summary": "<2-3 paragraph detailed summary of how the student performed, their readiness for tier-1 company rounds, and key takeaways>",
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch (err) {
      console.warn('[AI Service] Gemini summary failed, using fallback summary:', err.message);
    }
  }

  // Built-in intelligent report
  const technicalAccuracy = Math.min(10, Math.max(5, Math.round(avg * 1.05 * 10) / 10));
  const communication = Math.min(10, Math.max(5, Math.round((avg + 0.3) * 10) / 10));
  const confidence = Math.min(10, Math.max(5, Math.round((avg - 0.2) * 10) / 10));
  const problemSolving = Math.min(10, Math.max(5, Math.round((avg + 0.1) * 10) / 10));

  return {
    overallScore: avg,
    technicalAccuracy,
    communication,
    confidence,
    problemSolving,
    strengths: [
      `Demonstrated solid baseline knowledge relevant to ${role}`,
      "Communicated thoughts sequentially without getting overwhelmed",
      "Engaged well with follow-up prompts and scenario questions"
    ],
    areasForImprovement: [
      "Deepen quantitative metrics: mention latency, memory limits, and worst-case complexities",
      "Adopt the STAR method for project and behavioral scenarios",
      "Pre-emptively address edge cases before interviewer prompts"
    ],
    summary: `The candidate demonstrated strong foundational capability for the ${role} position. Responses exhibited good technical vocabulary and clear thought organization. With targeted practice on edge-case analysis and time-complexity optimization, the student has high potential for clearing technical rounds at top product and service firms.`,
    recommendations: [
      "Review high-frequency LeetCode / HackerRank patterns for Data Structures",
      "Practice mock system design scenarios and database indexing trade-offs",
      "Speak aloud while whiteboarding code solutions to improve live interview presence"
    ]
  };
};

/* ================= GROUP DISCUSSION SERVICE ================= */

export const GD_TOPICS = [
  {
    id: 'gd-1',
    title: 'Will Artificial Intelligence Replace Software Engineers or Empower Them?',
    category: 'Technology',
    description: 'Explore the rise of generative AI, automated code generation, and how the role of software developers will evolve over the next decade.'
  },
  {
    id: 'gd-2',
    title: 'Remote Work vs In-Office Work Culture: Impact on Productivity and Innovation',
    category: 'Business & Economy',
    description: 'Evaluate the pros and cons of distributed engineering teams versus co-located corporate office environments.'
  },
  {
    id: 'gd-3',
    title: 'Central Bank Digital Currencies (CBDCs) vs Cryptocurrencies: The Future of Money',
    category: 'Finance & Tech',
    description: 'Discuss financial sovereignty, blockchain decentralization, security, and consumer privacy in the evolving monetary system.'
  },
  {
    id: 'gd-4',
    title: 'Ethical Implications of Social Media Algorithms on Youth Mental Health',
    category: 'Social Issues',
    description: 'Deliberate on attention economy business models, algorithmic amplification, data privacy, and government regulatory oversight.'
  },
  {
    id: 'gd-5',
    title: 'Is College Degree Still Essential for High-Paying Tech Placement in 2025?',
    category: 'Education & Career',
    description: 'Analyze self-taught developers, bootcamps, open source portfolios versus traditional four-year computer science degrees.'
  }
];

export const generateGDAiResponses = async ({ topic, transcript, candidateMessage }) => {
  const participants = [
    { name: 'Priya Sharma', role: 'Analytical / Data-Driven' },
    { name: 'Rohan Mehta', role: 'Contrarian / Alternative Viewpoint' },
    { name: 'Aman Verma', role: 'Industry / Practical Realist' },
    { name: 'Moderator (Dr. Sen)', role: 'GD Facilitator' }
  ];

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const prompt = `
You are moderating a campus placement Group Discussion.
Topic: "${topic}"
Candidate's latest input: "${candidateMessage}"

Recent transcript:
${transcript.slice(-4).map(t => `${t.speaker}: ${t.message}`).join('\n')}

Simulate 2 realistic responses from the other participants:
Choose from:
1. "Priya Sharma" (brings statistics, analytical logic)
2. "Rohan Mehta" (politely provides a counter-perspective or edge-case)
3. "Aman Verma" (gives real-world corporate or industrial case study)
4. "Moderator (Dr. Sen)" (synthesizes discussion and guides the flow)

Return STRICT JSON:
{
  "responses": [
    {
      "speaker": "<Name>",
      "role": "<Role>",
      "message": "<2-3 natural spoken sentences directly addressing the candidate or topic>"
    },
    {
      "speaker": "<Different Name>",
      "role": "<Role>",
      "message": "<2-3 natural spoken sentences continuing the flow>"
    }
  ]
}
`;
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleanJson = text.replace(/^```json/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed.responses && parsed.responses.length) {
        return parsed.responses;
      }
    } catch (err) {
      console.warn('[AI Service] Gemini GD response failed, using fallback:', err.message);
    }
  }

  // Pre-calibrated dynamic fallback responses
  const responsesPool = [
    {
      speaker: 'Priya Sharma',
      role: 'Analytical / Data-Driven',
      message: `I completely see your point. If we look at recent industry reports, over 70% of leading tech enterprises have adopted assisted AI tools, which correlates directly with the productivity gains you mentioned.`
    },
    {
      speaker: 'Rohan Mehta',
      role: 'Contrarian / Alternative Viewpoint',
      message: `While I appreciate that perspective, we must also consider the potential risks. Over-reliance on automation without deep foundational knowledge can lead to architectural debt and security vulnerabilities that juniors may miss.`
    },
    {
      speaker: 'Aman Verma',
      role: 'Industry / Practical Realist',
      message: `Adding to that practical side, in actual software delivery cycles, communication with clients and translating ambiguous business needs into logic remain distinctly human tasks that no current tool replaces.`
    },
    {
      speaker: 'Moderator (Dr. Sen)',
      role: 'GD Facilitator',
      message: `Excellent observations from everyone. Let's make sure we also explore how educational curriculums should adapt to prepare graduates for this paradigm shift.`
    }
  ];

  // Pick 2 random distinct participants
  const shuffled = [...responsesPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};

export const evaluateGDSessionService = async ({ topic, transcript, candidateName = 'Candidate' }) => {
  const candidateTurns = transcript.filter(t => t.speaker === candidateName || t.role === 'candidate');
  const count = candidateTurns.length;

  let contentQuality = 7;
  let communicationClarity = 8;
  let listeningAndRebuttal = 7;
  let leadershipAndInitiative = 7;

  if (count >= 3) {
    leadershipAndInitiative += 1.5;
    contentQuality += 1;
  } else if (count === 1) {
    leadershipAndInitiative -= 1;
    communicationClarity -= 0.5;
  }

  const overallScore = Math.min(10, Math.round(((contentQuality + communicationClarity + listeningAndRebuttal + leadershipAndInitiative) / 4) * 10) / 10);

  return {
    contentQuality: Math.min(10, contentQuality),
    communicationClarity: Math.min(10, communicationClarity),
    listeningAndRebuttal: Math.min(10, listeningAndRebuttal),
    leadershipAndInitiative: Math.min(10, leadershipAndInitiative),
    overallScore,
    feedback: `Strong participation in the group discussion on "${topic}". You maintained an assertive yet respectful tone, accommodated peer opinions, and substantiated your arguments well.`,
    strengths: [
      "Clear articulation of core perspectives",
      "Respectful rebuttal without talking over other participants",
      "Strong relevance of points to the designated topic"
    ],
    improvements: [
      "Initiate the discussion early to secure prime leadership points",
      "Cite specific real-world case studies and market statistics to reinforce authority",
      "Help summarize key consensus points when the discussion diverges"
    ]
  };
};
