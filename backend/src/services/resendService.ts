import { ENV } from '../config/env.js';

export const sendVerificationEmail = async (
  email: string,
  code: string,
  name?: string,
  type: 'signup' | 'login' = 'signup'
): Promise<{ success: boolean; messageId?: string; simulated?: boolean }> => {
  const resendApiKey = process.env.RESEND_API_KEY || (ENV as any).RESEND_API_KEY;

  if (!resendApiKey || process.env.NODE_ENV === 'test' || email.endsWith('@example.com')) {
    console.log(`[Resend Service (Preview/Dev Mode)] ${type === 'login' ? 'Login' : 'Signup'} Verification Code for ${email}: ${code}`);
    return { success: true, simulated: true };
  }

  try {
    const fromAddress = process.env.RESEND_FROM_EMAIL || (ENV as any).RESEND_FROM_EMAIL || 'MediCare Hospital <noreply@medicare.name.ng>';
    const isLogin = type === 'login';
    const subject = isLogin
      ? `Your TechQuo News Login Code: ${code}`
      : `Your TechQuo News Verification Code: ${code}`;
    const headerTitle = isLogin ? 'Confirm your sign-in' : 'Verify your email address';
    const bodyText = isLogin
      ? `Hi ${name || 'Reader'},<br/>You are signing in to your TechQuo News account. Please enter the following 6-digit confirmation code on your mobile device to complete your sign-in:`
      : `Hi ${name || 'Reader'},<br/>Thank you for signing up for TechQuo News. Please enter the following 6-digit verification code in your mobile application to complete verification and activate your account:`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #eaeaea; border-radius: 12px;">
            <div style="margin-bottom: 24px; text-align: left;">
              <h1 style="font-family: Georgia, serif; font-size: 26px; color: #000; margin: 0;">TECHQUO<span style="color: #2563EB;">.</span></h1>
              <p style="font-size: 11px; letter-spacing: 2px; color: #888; text-transform: uppercase; margin-top: 4px;">Tech / Innovation / Africa</p>
            </div>
            <h2 style="font-size: 20px; font-weight: 700; color: #111; margin-bottom: 12px;">${headerTitle}</h2>
            <p style="font-size: 14px; line-height: 22px; color: #555; margin-bottom: 24px;">
              ${bodyText}
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <div style="display: inline-block; letter-spacing: 8px; font-size: 32px; font-weight: 800; font-family: monospace; background: #F3F4F6; color: #111; padding: 16px 28px; border-radius: 8px; border: 1px solid #E5E7EB;">
                ${code}
              </div>
            </div>
            <p style="font-size: 12px; color: #888; line-height: 18px; margin-top: 24px;">
              This code will expire in 10 minutes. If you did not initiate this request, please secure your account immediately.
            </p>
          </div>
        `,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error('[Resend Error]', data);
      throw new Error(data?.message || 'Failed to dispatch verification email via Resend');
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend Exception]', err);
    throw err;
  }
};
