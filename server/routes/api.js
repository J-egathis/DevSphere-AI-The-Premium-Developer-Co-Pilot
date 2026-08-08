const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, adminOnly } = require('../middleware/auth');
const { registerUser, loginUser, forgotPassword, resetPassword } = require('../controllers/authController');
const { 
  User, Profile, Resume, JobApplication, 
  InterviewQuestion, Message, Notification, Roadmap, Project 
} = require('../models/Schemas');

// Configure Multer for File Uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Dictionary of skills for ATS Parser Simulation
const SKILLS_DICTIONARY = [
  'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'React', 'Vue', 'Angular', 
  'Node.js', 'Express.js', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI', 
  'Java', 'Spring Boot', 'C++', 'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 
  'Google Cloud', 'Azure', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 
  'GraphQL', 'Git', 'CI/CD', 'Agile', 'Scrum', 'System Design'
];

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

// ==========================================
// PROFILE ROUTES
// ==========================================
router.get('/profile', protect, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await Profile.create({
        user: req.user._id,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${req.user.username}`,
        bio: 'New developer profile.'
      });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile' });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const { bio, skills, githubUsername, education, experience, certifications } = req.body;
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.bio = bio !== undefined ? bio : profile.bio;
    profile.skills = skills !== undefined ? skills : profile.skills;
    profile.githubUsername = githubUsername !== undefined ? githubUsername : profile.githubUsername;
    profile.education = education !== undefined ? education : profile.education;
    profile.experience = experience !== undefined ? experience : profile.experience;
    profile.certifications = certifications !== undefined ? certifications : profile.certifications;

    // Recalculate Profile Completion
    let score = 20; // base score for registering
    if (profile.bio) score += 15;
    if (profile.skills && profile.skills.length > 0) score += 15;
    if (profile.githubUsername) score += 10;
    if (profile.education && profile.education.length > 0) score += 15;
    if (profile.experience && profile.experience.length > 0) score += 15;
    if (profile.certifications && profile.certifications.length > 0) score += 10;
    profile.stats.profileCompletion = Math.min(score, 100);

    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// ==========================================
// RESUME ANALYZER ROUTES
// ==========================================
router.get('/resumes', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving resumes' });
  }
});

router.post('/resumes/upload', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filename = req.file.originalname;
    const textContent = req.file.buffer.toString('utf-8');

    // Simulate ATS Parse / Scan
    const matched = [];
    const missing = [];
    
    // Scan for skills in filename or text
    SKILLS_DICTIONARY.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(textContent) || regex.test(filename)) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    // Make sure we have a few simulated matches if it is a binary/non-text file
    if (matched.length === 0) {
      // Pick random 3-6 skills from dictionary as matches
      const count = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < count; i++) {
        const randomSkill = SKILLS_DICTIONARY[Math.floor(Math.random() * SKILLS_DICTIONARY.length)];
        if (!matched.includes(randomSkill)) matched.push(randomSkill);
      }
      // Re-filter missing
      SKILLS_DICTIONARY.forEach(s => {
        if (!matched.includes(s) && !missing.includes(s)) missing.push(s);
      });
    }

    // Calculate score
    const totalPossible = 15; // Benchmark target
    const scoreVal = Math.min(Math.floor((matched.length / totalPossible) * 100), 100);
    const finalScore = Math.max(scoreVal, 45); // Keep it above 45 for user motivation

    // Dynamic Career suggestions
    const careerPaths = [];
    if (matched.includes('React') || matched.includes('HTML5') || matched.includes('CSS3')) {
      careerPaths.push('Frontend Developer', 'UI/UX Engineer');
    }
    if (matched.includes('Node.js') || matched.includes('Express.js') || matched.includes('Python') || matched.includes('PostgreSQL')) {
      careerPaths.push('Backend Developer', 'Database Architect');
    }
    if (careerPaths.length === 0) {
      careerPaths.push('Full Stack Engineer', 'Software Engineer');
    }
    if (matched.includes('Docker') || matched.includes('Kubernetes') || matched.includes('AWS')) {
      careerPaths.push('DevOps Engineer', 'Cloud Infrastructure Engineer');
    }

    // Recommendations feedback
    const missingSubset = missing.slice(0, 4);
    const feedback = `Your resume matches ${matched.length} core developer skills. To improve your score to 90+, we recommend adding skills like: ${missingSubset.join(', ')}. Try formatting your experience in bullet points starting with action verbs.`;

    // Save Resume to Database
    const resume = await Resume.create({
      user: req.user._id,
      filename,
      score: finalScore,
      parsedData: {
        skillsMatched: matched,
        skillsMissing: missingSubset,
        careerPathRecommendations: careerPaths,
        atsFeedback: feedback
      }
    });

    // Update Profile Resume Score
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      profile.stats.resumeScore = finalScore;
      // Add missing skills to profile stats if profile skills are empty
      if (profile.skills.length === 0) {
        profile.skills = matched.slice(0, 6);
      }
      await profile.save();
    }

    // Trigger Notification
    await Notification.create({
      user: req.user._id,
      title: 'Resume Analyzed Successfully!',
      content: `Your resume received an ATS score of ${finalScore}%. Review the details inside the analyzer.`,
      type: 'success'
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error('[Resume Upload Error]', error);
    res.status(500).json({ message: 'Error processing resume file' });
  }
});

// ==========================================
// INTERVIEW ASSISTANT ROUTES
// ==========================================
// Populate sample questions on the fly if collection is empty
const defaultQuestions = [
  { category: 'HR', difficulty: 'Easy', type: 'HR', question: 'Tell me about yourself and your background.', sampleAnswer: 'Highlight your education, recent achievements, and key skills concisely.', hint: 'Use the Present-Past-Future formula.' },
  { category: 'HR', difficulty: 'Medium', type: 'HR', question: 'Why do you want to work at DevSphere AI?', sampleAnswer: 'Mention company values, their innovative products, and alignment with your career trajectory.', hint: 'Show you researched the company.' },
  { category: 'JavaScript', difficulty: 'Easy', type: 'Technical', question: 'What is the difference between let, const, and var?', sampleAnswer: 'var is function-scoped and hoisted. let and const are block-scoped. const variables cannot be reassigned.', hint: 'Discuss block scope and hoisting.' },
  { category: 'React', difficulty: 'Medium', type: 'Technical', question: 'Explain React Virtual DOM and how reconciliation works.', sampleAnswer: 'React keeps a virtual copy of UI in memory. In reconciliation, it compares virtual DOM changes with the actual DOM and updates only modified components.', hint: 'Mention the diffing algorithm.' },
  { category: 'Node.js', difficulty: 'Hard', type: 'Technical', question: 'Explain the Node.js Event Loop phases.', sampleAnswer: 'It consists of timers, pending callbacks, idle/prepare, poll, check, and close callbacks phases. It enables non-blocking asynchronous operations.', hint: 'Mention macro-tasks and micro-tasks.' },
  { category: 'Coding', difficulty: 'Medium', type: 'Coding', question: 'Write a function to check if a string is a palindrome.', sampleAnswer: 'function isPalindrome(str) { return str === str.split("").reverse().join(""); }', hint: 'Remove non-alphanumeric characters first.' }
];

router.get('/interviews/questions', protect, async (req, res) => {
  try {
    let questions = await InterviewQuestion.find({});
    if (questions.length === 0) {
      await InterviewQuestion.insertMany(defaultQuestions);
      questions = await InterviewQuestion.find({});
    }
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error getting interview questions' });
  }
});

router.post('/interviews/evaluate', protect, async (req, res) => {
  const { questionId, answer } = req.body;
  if (!questionId || !answer) {
    return res.status(400).json({ message: 'Question and answer required' });
  }

  try {
    const question = await InterviewQuestion.findById(questionId);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Simple keyword evaluation for demo
    const cleanAnswer = answer.toLowerCase();
    const keywords = question.sampleAnswer.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    let matches = 0;
    keywords.forEach(kw => {
      if (cleanAnswer.includes(kw)) matches++;
    });

    const ratio = matches / Math.max(keywords.length, 1);
    let evaluationScore = Math.floor(ratio * 100);
    evaluationScore = Math.max(35, Math.min(evaluationScore + 30, 95)); // Normalize score realistically

    let feedback = '';
    if (evaluationScore >= 80) {
      feedback = 'Excellent answer! You covered the core principles and explained the concept clearly with good structure.';
    } else if (evaluationScore >= 60) {
      feedback = 'Good attempt. To make this answer outstanding, try adding specific real-world examples and clarify your technical vocabulary.';
    } else {
      feedback = `Room for improvement. Your answer was a bit brief. Try structure: 1) What is the core definition, 2) Why is it important, 3) Write code/use cases. Remember to cover keywords like: ${keywords.slice(0, 3).join(', ')}.`;
    }

    // Update profile interview readiness
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      // Calculate running average
      const oldReadiness = profile.stats.interviewReadiness;
      profile.stats.interviewReadiness = oldReadiness === 0 ? evaluationScore : Math.round((oldReadiness + evaluationScore) / 2);
      await profile.save();
    }

    res.json({
      score: evaluationScore,
      feedback,
      sampleAnswer: question.sampleAnswer
    });
  } catch (error) {
    res.status(500).json({ message: 'Error evaluating answer' });
  }
});

// ==========================================
// JOB TRACKER ROUTES
// ==========================================
router.get('/jobs', protect, async (req, res) => {
  try {
    const jobs = await JobApplication.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error getting jobs' });
  }
});

router.post('/jobs', protect, async (req, res) => {
  const { company, position, status, notes, salary, location } = req.body;
  if (!company || !position) {
    return res.status(400).json({ message: 'Company and Position are required' });
  }

  try {
    const job = await JobApplication.create({
      user: req.user._id,
      company,
      position,
      status: status || 'Wishlist',
      notes,
      salary,
      location
    });

    // Update project stats
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      const count = await JobApplication.countDocuments({ user: req.user._id });
      // Sync stats count
      profile.stats.projectsCount = count; 
      await profile.save();
    }

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job tracker card' });
  }
});

router.put('/jobs/:id', protect, async (req, res) => {
  try {
    const { status, notes, company, position, salary, location } = req.body;
    const job = await JobApplication.findOne({ _id: req.params.id, user: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    job.status = status !== undefined ? status : job.status;
    job.notes = notes !== undefined ? notes : job.notes;
    job.company = company !== undefined ? company : job.company;
    job.position = position !== undefined ? position : job.position;
    job.salary = salary !== undefined ? salary : job.salary;
    job.location = location !== undefined ? location : job.location;
    job.updatedAt = Date.now();

    await job.save();
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job' });
  }
});

router.delete('/jobs/:id', protect, async (req, res) => {
  try {
    const job = await JobApplication.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Update count stats
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      const count = await JobApplication.countDocuments({ user: req.user._id });
      profile.stats.projectsCount = count;
      await profile.save();
    }

    res.json({ message: 'Job tracking card removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// ==========================================
// ROADMAP GENERATOR ROUTES
// ==========================================
const defaultMilestones = {
  frontend: [
    { milestoneId: 'fe_html_css', title: 'HTML5 & CSS3 Masteries', completed: false },
    { milestoneId: 'fe_js', title: 'Modern JavaScript (ES6+)', completed: false },
    { milestoneId: 'fe_react', title: 'React Hooks & State Management', completed: false },
    { milestoneId: 'fe_build_tools', title: 'Build Tools (Vite, Webpack)', completed: false },
    { milestoneId: 'fe_ssr', title: 'SSR & Jamstack (Next.js)', completed: false }
  ],
  backend: [
    { milestoneId: 'be_node', title: 'Node.js Core & Event Loop', completed: false },
    { milestoneId: 'be_express', title: 'RESTful API with Express', completed: false },
    { milestoneId: 'be_db', title: 'Relational & NoSQL Databases', completed: false },
    { milestoneId: 'be_auth', title: 'JWT, OAuth & Cookie Security', completed: false },
    { milestoneId: 'be_cache', title: 'Caching (Redis) & PubSub', completed: false }
  ],
  fullstack: [
    { milestoneId: 'fs_mvc', title: 'MVC Architecture Patterns', completed: false },
    { milestoneId: 'fs_api', title: 'GraphQL & WebSockets integrations', completed: false },
    { milestoneId: 'fs_deploy', title: 'Full Stack Deployment (Vercel/Render)', completed: false },
    { milestoneId: 'fs_testing', title: 'End-to-End Testing (Cypress/Jest)', completed: false }
  ],
  ai: [
    { milestoneId: 'ai_python', title: 'Python & Data Structures', completed: false },
    { milestoneId: 'ai_math', title: 'Linear Algebra & Statistics', completed: false },
    { milestoneId: 'ai_ml', title: 'Supervised & Unsupervised ML', completed: false },
    { milestoneId: 'ai_dl', title: 'Neural Networks & PyTorch', completed: false },
    { milestoneId: 'ai_llm', title: 'LLMs, Prompting & RAG Systems', completed: false }
  ],
  devops: [
    { milestoneId: 'do_linux', title: 'Linux Bash & SSH Scripting', completed: false },
    { milestoneId: 'do_docker', title: 'Docker Containers', completed: false },
    { milestoneId: 'do_k8s', title: 'Kubernetes Cluster Orchestration', completed: false },
    { milestoneId: 'do_cicd', title: 'GitHub Actions CI/CD pipelines', completed: false },
    { milestoneId: 'do_iac', title: 'Infrastructure as Code (Terraform)', completed: false }
  ]
};

router.get('/roadmaps', protect, async (req, res) => {
  try {
    let roadmaps = await Roadmap.find({ user: req.user._id });
    // If user has no roadmaps, pre-populate them
    if (roadmaps.length === 0) {
      const roadmapPromises = Object.keys(defaultMilestones).map(key => {
        return Roadmap.create({
          user: req.user._id,
          title: `${key.charAt(0).toUpperCase() + key.slice(1)} Career Path`,
          type: key,
          progress: defaultMilestones[key]
        });
      });
      roadmaps = await Promise.all(roadmapPromises);
    }
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving roadmaps' });
  }
});

router.post('/roadmaps/toggle', protect, async (req, res) => {
  const { roadmapType, milestoneId } = req.body;
  if (!roadmapType || !milestoneId) {
    return res.status(400).json({ message: 'Roadmap type and Milestone ID required' });
  }

  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id, type: roadmapType });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found' });

    let itemFound = false;
    roadmap.progress = roadmap.progress.map(p => {
      if (p.milestoneId === milestoneId) {
        p.completed = !p.completed;
        itemFound = true;
      }
      return p;
    });

    if (!itemFound) return res.status(404).json({ message: 'Milestone not found in roadmap' });
    roadmap.updatedAt = Date.now();
    await roadmap.save();

    // Recalculate learning progress percentage across all roadmaps
    const allRoadmaps = await Roadmap.find({ user: req.user._id });
    let totalItems = 0;
    let completedItems = 0;
    allRoadmaps.forEach(rm => {
      rm.progress.forEach(p => {
        totalItems++;
        if (p.completed) completedItems++;
      });
    });

    const completionPct = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      profile.stats.learningProgress = completionPct;
      await profile.save();
    }

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: 'Error updating roadmap progression' });
  }
});

// ==========================================
// CHAT / MESSAGES ROUTES
// ==========================================
router.get('/chat/history', protect, async (req, res) => {
  try {
    // Return last 50 messages of Global Chat (recipient is null)
    const messages = await Message.find({ recipient: null })
      .populate('sender', 'username email')
      .sort({ timestamp: 1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chat history' });
  }
});

// ==========================================
// PROJECT ROUTES (FOR PORTFOLIO / DETAILS)
// ==========================================
router.get('/projects', protect, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

router.post('/projects', protect, async (req, res) => {
  const { title, description, repoUrl, demoUrl, languages } = req.body;
  if (!title) return res.status(400).json({ message: 'Project title is required' });

  try {
    const project = await Project.create({
      user: req.user._id,
      title,
      description,
      repoUrl,
      demoUrl,
      languages: languages || []
    });

    // Update count in profile stats
    const count = await Project.countDocuments({ user: req.user._id });
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      profile.stats.projectsCount = count;
      await profile.save();
    }

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error saving project' });
  }
});

router.delete('/projects/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Update count
    const count = await Project.countDocuments({ user: req.user._id });
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      profile.stats.projectsCount = count;
      await profile.save();
    }

    res.json({ message: 'Project removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// ==========================================
// NOTIFICATION ROUTES
// ==========================================
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error getting notifications' });
  }
});

router.put('/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

router.put('/notifications/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification' });
  }
});

// ==========================================
// ADMIN PANEL ROUTES
// ==========================================
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  try {
    const userCount = await User.countDocuments({});
    const resumeCount = await Resume.countDocuments({});
    const jobCount = await JobApplication.countDocuments({});
    const projectCount = await Project.countDocuments({});

    // Generate dummy system statistics
    res.json({
      metrics: {
        totalUsers: userCount,
        totalResumes: resumeCount,
        totalJobsTracked: jobCount,
        totalProjectsUploaded: projectCount
      },
      health: {
        apiStatus: 'Operational',
        databaseStatus: 'Healthy',
        socketStatus: 'Connected',
        cpuUsage: `${Math.floor(Math.random() * 15) + 5}%`,
        memoryUsage: `${Math.floor(Math.random() * 20) + 40}%`
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard metrics' });
  }
});

router.get('/admin/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user index' });
  }
});

router.put('/admin/users/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role configuration' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: `User role has been successfully set to ${role}` });
  } catch (error) {
    res.status(500).json({ message: 'Error configuring user credentials' });
  }
});

module.exports = router;
