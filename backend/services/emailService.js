import mjml from 'mjml';
import { Resend } from 'resend';

export const generatePasswordResetEmail = (resetLink, userName) => {
  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-title>Password Reset Request</mj-title>
        <mj-attributes>
          <mj-all font-family="Arial, sans-serif" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f4">
        <mj-section background-color="#ffffff" padding="40px">
          <mj-column>
            <mj-image 
              width="120px" 
              src="https://via.placeholder.com/120x60/007bff/ffffff?text=RoadGuard"
              alt="RoadGuard Logo"
            />
            <mj-divider border-color="#e0e0e0" />
            <mj-text font-size="24px" color="#333333" font-weight="bold" align="center">
              Password Reset Request
            </mj-text>
            <mj-text font-size="16px" color="#666666" line-height="24px">
              Hello ${userName},
            </mj-text>
            <mj-text font-size="16px" color="#666666" line-height="24px">
              We received a request to reset your password for your RoadGuard account. 
              Click the button below to reset your password.
            </mj-text>
            <mj-button 
              background-color="#007bff" 
              color="#ffffff" 
              font-size="16px" 
              font-weight="bold"
              href="${resetLink}"
              padding="15px 30px"
              border-radius="5px"
            >
              Reset Password
            </mj-button>
            <mj-text font-size="14px" color="#999999" line-height="20px">
              This link will expire in 15 minutes for your security.
            </mj-text>
            <mj-text font-size="14px" color="#999999" line-height="20px">
              If the button doesn't work, copy and paste this link into your browser:
            </mj-text>
            <mj-text font-size="12px" color="#007bff" word-break="break-all">
              ${resetLink}
            </mj-text>
            <mj-divider border-color="#e0e0e0" />
            <mj-text font-size="12px" color="#999999" align="center">
              If you didn't request this password reset, please ignore this email. 
              Your password will remain unchanged.
            </mj-text>
            <mj-text font-size="12px" color="#999999" align="center">
              © 2024 RoadGuard. All rights reserved.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml(mjmlTemplate);
  return html;
};

export const sendPasswordResetEmail = async (email, resetLink, userName) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    let htmlContent;
    try {
      htmlContent = generatePasswordResetEmail(resetLink, userName);
    } catch (mjmlError) {
      console.error('MJML error, using fallback HTML:', mjmlError);
      // Fallback HTML if MJML fails
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${userName},</p>
          <p>We received a request to reset your password for your RoadGuard account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 15 minutes for your security.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">© 2024 RoadGuard. All rights reserved.</p>
        </div>
      `;
    }
    
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: 'Password Reset Request - RoadGuard',
      html: htmlContent
    });

    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};