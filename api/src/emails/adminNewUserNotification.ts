/**
 * Admin Notification Email for New User Registration
 * Includes deep link to admin panel to save admin 3 clicks.
 */

export const adminNewUserNotificationTemplate = (data: {
  userId: string;
  businessName: string;
  email: string;
  phone?: string;
  gstNumber?: string;
  createdAt: Date;
}) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <tr>
      <td style="background-color: #111827; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 20px;">New Registration: ${data.businessName}</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px;">
        <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Business Name</td>
            <td style="border-bottom: 1px solid #e5e7eb; color: #4b5563;">${data.businessName}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email</td>
            <td style="border-bottom: 1px solid #e5e7eb; color: #4b5563;">${data.email}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Phone</td>
            <td style="border-bottom: 1px solid #e5e7eb; color: #4b5563;">${data.phone || 'N/A'}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">GST Number</td>
            <td style="border-bottom: 1px solid #e5e7eb; color: #4b5563;">${data.gstNumber || 'N/A'}</td>
          </tr>
          <tr>
            <td style="border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Registered At</td>
            <td style="border-bottom: 1px solid #e5e7eb; color: #4b5563;">${data.createdAt.toLocaleString()}</td>
          </tr>
        </table>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_ADMIN_URL}/admin/users/${data.userId}" 
             style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Review User in Admin Panel
          </a>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
