const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Resume = require('../models/Resume');
const User = require('../models/User');
const aiService = require('../services/aiService');

// Extract text helper based on file extension
async function extractTextFromFile(filePath, originalName) {
  const ext = originalName.split('.').pop().toLowerCase();
  const fileBuffer = fs.readFileSync(filePath);

  if (ext === 'pdf') {
    const data = await pdfParse(fileBuffer);
    return data.text;
  } else if (ext === 'docx') {
    const data = await mammoth.extractRawText({ buffer: fileBuffer });
    return data.value;
  } else {
    return fileBuffer.toString('utf-8');
  }
}

// @route   POST /api/resumes/upload
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX file' });
    }

    const { path: filePath, originalname } = req.file;

    // 1. Extract raw text from file
    let rawText = '';
    try {
      rawText = await extractTextFromFile(filePath, originalname);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: `Failed to extract text from file: ${err.message}`,
      });
    }

    if (!rawText || rawText.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Could not detect readable text in uploaded resume. Please check your file.',
      });
    }

    // 2. Parse into structured candidate profile using AI
    console.log(`[ResumeController] Parsing resume for user ${req.user._id}...`);
    const parsedProfile = await aiService.parseResumeText(rawText);

    // 3. Save Resume Model
    const ext = originalname.split('.').pop().toLowerCase();
    const resume = await Resume.create({
      userId: req.user._id,
      fileName: originalname,
      filePath,
      fileType: ext === 'pdf' ? 'pdf' : (ext === 'docx' ? 'docx' : 'manual'),
      rawText,
      parsedProfile,
      isDefault: true,
    });

    // Update user active resume reference
    await User.findByIdAndUpdate(req.user._id, { activeResumeId: resume._id });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      resume,
    });
  } catch (error) {
    console.error('[ResumeController] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/resumes/current
exports.getCurrentResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found for this user',
      });
    }

    res.json({
      success: true,
      resume,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/resumes/:id
exports.updateParsedProfile = async (req, res) => {
  try {
    const { parsedProfile } = req.body;

    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    resume.parsedProfile = parsedProfile;
    await resume.save();

    res.json({
      success: true,
      message: 'Candidate profile updated successfully',
      resume,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/resumes
exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: resumes.length, resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/resumes/:id
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
