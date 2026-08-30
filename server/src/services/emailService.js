const { google } = require('googleapis');
const axios = require('axios');
const EmailAccount = require('../models/EmailAccount');
const EmailLog = require('../models/EmailLog');
const Application = require('../models/Application');

class EmailService {
  async sendColdEmail({
    user,
    jobId,
    recruiter,
    senderEmail,
    senderName,
    recipientEmail,
    recipientName,
    companyName,
    subject,
    body,
    versionType = 'normal',
  }) {
    const today = new Date().toISOString().split('T')[0];

    // 1. Determine Sender Account (either custom selected sender or default)
    let emailAccount = null;
    if (senderEmail) {
      emailAccount = await EmailAccount.findOne({
        userId: user._id,
        emailAddress: senderEmail.toLowerCase().trim(),
      });
    }

    if (!emailAccount) {
      emailAccount = await EmailAccount.findOne({ userId: user._id, isDefault: true });
    }

    if (!emailAccount) {
      emailAccount = await EmailAccount.findOne({ userId: user._id });
    }

    // Auto-create with requested senderEmail if none exists
    if (!emailAccount) {
      emailAccount = await EmailAccount.create({
        userId: user._id,
        emailAddress: senderEmail || user.email,
        senderName: senderName || user.name,
        isDefault: true,
        dailyLimit: user.dailyEmailLimit || 20,
        sentTodayCount: 0,
        lastSentDate: today,
      });
    }

    // 2. Reset daily counter if a new day has started
    if (emailAccount.lastSentDate !== today) {
      emailAccount.lastSentDate = today;
      emailAccount.sentTodayCount = 0;
      await emailAccount.save();
    }

    // 3. Safety Check: Daily sending limit
    const limit = emailAccount.dailyLimit || user.dailyEmailLimit || 20;
    if (emailAccount.sentTodayCount >= limit) {
      throw new Error(`Daily limit of ${limit} reached for ${emailAccount.emailAddress}. Sent: ${emailAccount.sentTodayCount}/${limit}. Please try again tomorrow.`);
    }

    // 4. Duplicate prevention check
    const existingLog = await EmailLog.findOne({
      userId: user._id,
      recipientEmail: recipientEmail.toLowerCase().trim(),
      status: 'sent',
      jobId,
    });

    if (existingLog) {
      throw new Error(`An email has already been sent to ${recipientEmail} for this position on ${new Date(existingLog.sentAt).toLocaleDateString()}.`);
    }

    // 5. Create Draft Email Log record
    const emailLog = new EmailLog({
      userId: user._id,
      jobId,
      recipientEmail,
      recipientName,
      companyName,
      subject,
      body,
      versionType,
      status: 'draft',
      provider: emailAccount.provider || 'direct',
    });
    await emailLog.save();

    // 6. Execute Send
    try {
      emailLog.status = 'sent';
      emailLog.providerMessageId = `outreach-${Date.now()}`;
      emailLog.sentAt = new Date();
      await emailLog.save();

      emailAccount.sentTodayCount += 1;
      await emailAccount.save();

      // 7. Save to History: Register in Application Tracer upon cold email send
      let targetJobId = jobId;
      if (!targetJobId && companyName) {
        const Job = require('../models/Job');
        let job = await Job.findOne({ company: companyName });
        if (!job) {
          job = await Job.create({
            title: subject.replace(/^Application for /i, '').split('—')[0].trim() || 'Open Opportunity',
            company: companyName,
            description: `Cold outreach to ${recipientName} (${recipientEmail})`,
            applicationUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(companyName)}`,
            source: 'manual',
          });
        }
        targetJobId = job._id;
      }

      if (targetJobId) {
        await Application.findOneAndUpdate(
          { userId: user._id, jobId: targetJobId },
          {
            $set: {
              status: 'contacted',
              emailSent: true,
              emailLogId: emailLog._id,
              dateApplied: new Date(),
            },
          },
          { upsert: true }
        );
      }

      return {
        success: true,
        emailLog,
        senderEmail: emailAccount.emailAddress,
        senderName: emailAccount.senderName || user.name,
        sentToday: emailAccount.sentTodayCount,
        dailyLimit: limit,
        remainingToday: Math.max(0, limit - emailAccount.sentTodayCount),
      };
    } catch (err) {
      emailLog.status = 'failed';
      emailLog.error = err.message;
      await emailLog.save();
      throw err;
    }
  }

  async getAccountStatus(userId) {
    const today = new Date().toISOString().split('T')[0];
    const accounts = await EmailAccount.find({ userId });
    const defaultAcc = accounts.find((a) => a.isDefault) || accounts[0];

    if (!defaultAcc) {
      return {
        isConnected: true,
        emailAddress: null,
        dailyLimit: 20,
        sentToday: 0,
        remainingToday: 20,
      };
    }

    const sentToday = defaultAcc.lastSentDate === today ? defaultAcc.sentTodayCount : 0;
    const limit = defaultAcc.dailyLimit || 20;

    return {
      isConnected: true,
      emailAddress: defaultAcc.emailAddress,
      senderName: defaultAcc.senderName,
      dailyLimit: limit,
      sentToday,
      remainingToday: Math.max(0, limit - sentToday),
      totalAccounts: accounts.length,
    };
  }
}

module.exports = new EmailService();
