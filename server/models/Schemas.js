const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Profile Schema
const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  githubUsername: { type: String, default: '' },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: String,
    endDate: String,
    current: Boolean,
    description: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: String,
    expirationDate: String,
    credentialUrl: String
  }],
  stats: {
    profileCompletion: { type: Number, default: 20 },
    resumeScore: { type: Number, default: 0 },
    interviewReadiness: { type: Number, default: 0 },
    projectsCount: { type: Number, default: 0 },
    githubActivityCount: { type: Number, default: 0 },
    learningProgress: { type: Number, default: 0 }
  }
});

// Resume Schema
const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  url: { type: String, default: '' },
  score: { type: Number, required: true, default: 0 },
  parsedData: {
    skillsMatched: [{ type: String }],
    skillsMissing: [{ type: String }],
    careerPathRecommendations: [{ type: String }],
    atsFeedback: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Job Application Schema
const JobApplicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: { type: String, required: true },
  position: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'], 
    default: 'Wishlist' 
  },
  dateApplied: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  salary: { type: String, default: '' },
  location: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

// Interview Question Schema
const InterviewQuestionSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g., 'HR', 'React', 'Node.js', 'System Design'
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  type: { type: String, enum: ['HR', 'Technical', 'Coding'], required: true },
  question: { type: String, required: true },
  sampleAnswer: { type: String },
  hint: { type: String }
});

// Message Schema
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null means Global Chat
  content: { type: String, required: true },
  type: { type: String, enum: ['global', 'private', 'group'], default: 'global' },
  timestamp: { type: Date, default: Date.now }
});

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success'], default: 'info' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Roadmap Schema
const RoadmapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['frontend', 'backend', 'fullstack', 'ai', 'devops'], required: true },
  progress: [{
    milestoneId: String,
    title: String,
    completed: { type: Boolean, default: false }
  }],
  updatedAt: { type: Date, default: Date.now }
});

// Project Schema
const ProjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  repoUrl: { type: String, default: '' },
  demoUrl: { type: String, default: '' },
  stars: { type: Number, default: 0 },
  languages: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Export all models
module.exports = {
  User: mongoose.model('User', UserSchema),
  Profile: mongoose.model('Profile', ProfileSchema),
  Resume: mongoose.model('Resume', ResumeSchema),
  JobApplication: mongoose.model('JobApplication', JobApplicationSchema),
  InterviewQuestion: mongoose.model('InterviewQuestion', InterviewQuestionSchema),
  Message: mongoose.model('Message', MessageSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  Roadmap: mongoose.model('Roadmap', RoadmapSchema),
  Project: mongoose.model('Project', ProjectSchema)
};
