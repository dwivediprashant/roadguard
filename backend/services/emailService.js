import nodemailer from 'nodemailer';

// Using Ethereal Email for testing (creates test accounts automatically)
let transporter;

const createTransporter = async () => {
  if (!transporter) {
    // Create test account for demo
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
};

export const sendOTPEmail = async (email, otp, firstName) => {
  const transporter = await createTransporter();
  
  const mailOptions = {
    from: '"RoadGuard Service" <noreply@roadguard.com>',
    to: email,
    subject: 'RoadGuard - Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #007bff; margin: 0;">🚗 RoadGuard</h1>
          <p style="color: #666; margin: 5px 0;">Your trusted roadside assistance</p>
        </div>
        
        <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.5;">Hello ${firstName},</p>
        <p style="font-size: 16px; line-height: 1.5;">You requested a password reset for your RoadGuard account.</p>
        
        <div style="background: linear-gradient(135deg, #007bff, #0056b3); padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; color: white;">
          <h3 style="margin: 0 0 15px 0; font-size: 18px;">Your OTP Code</h3>
          <div style="background: white; color: #333; padding: 15px; border-radius: 8px; display: inline-block; min-width: 200px;">
            <h1 style="margin: 0; font-size: 32px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
          </div>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">⏰ This OTP will expire in <strong>10 minutes</strong></p>
        </div>
        
        <p style="font-size: 14px; color: #666; line-height: 1.5;">If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <div style="text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">© 2024 RoadGuard Services. All rights reserved.</p>
          <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    throw new Error('Failed to send email');
  }
};