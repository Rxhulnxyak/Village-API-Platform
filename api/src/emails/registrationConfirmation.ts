/**
 * Registration Confirmation Email
 * Uses inline CSS only — Gmail strips <style> blocks from email <head>.
 * This is a known email client limitation, not an oversight.
 * Inline CSS is the industry standard for transactional HTML emails.
 */

export const registrationConfirmationTemplate = (businessName: string) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <tr>
      <td style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">VillageAPI</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <p style="font-size: 16px; color: #374151;">Hi ${businessName},</p>
        <h2 style="color: #111827; font-size: 20px; margin-top: 20px;">Account received — pending review</h2>
        <p style="font-size: 16px; color: #4b5563; line-height: 1.5;">Thank you for registering with VillageAPI. Here is what happens next:</p>
        <ol style="font-size: 16px; color: #4b5563; line-height: 1.5; padding-left: 20px;">
          <li style="margin-bottom: 10px;">Our team reviews your application (typically within 24 hours on business days).</li>
          <li style="margin-bottom: 10px;">You'll receive an approval email with a link to set up your API keys.</li>
          <li style="margin-bottom: 10px;">Make your first API request within minutes of approval.</li>
        </ol>
        <p style="font-size: 16px; color: #4b5563; line-height: 1.5; margin-top: 20px;">
          While you wait, you can explore the API at <a href="https://demo.villageapi.com" style="color: #2563eb; text-decoration: none;">demo.villageapi.com</a>.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 14px; color: #6b7280; margin: 0;">support@villageapi.com | villageapi.com</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
