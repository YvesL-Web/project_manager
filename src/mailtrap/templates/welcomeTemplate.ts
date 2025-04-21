export const WELCOME_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Community</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to Our Platform, {name}!</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Dear {name},</p>
    <p>We're thrilled to welcome you to our community! Your account with email <strong>{email}</strong> has been successfully created.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✨
      </div>
    </div>
    
    <p>Here's what you can do next:</p>
    <ul>
      <li>Complete your profile to get personalized recommendations</li>
      <li>Explore our platform and discover exciting features</li>
      <li>Connect with other members of our community</li>
    </ul>
    
    <p>To get started, simply log in to your account and begin your journey with us!</p>
    
    <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
    
    <p>Welcome aboard!<br>Your App Team</p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message, please do not reply to this email.</p>
    <p>© 2025 Your Company Name. All rights reserved.</p>
  </div>
</body>
</html>
`;
