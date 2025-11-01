# Email OTP Setup Guide

## Overview
The app now uses email-based OTP verification for new user signups. Users must verify their email before they can log in.

## Email Configuration

### 1. Set up Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll down to **App passwords**
4. Click **Select app** → Choose "Mail"
5. Click **Select device** → Choose "Other" and name it "Hatchr"
6. Click **Generate**
7. Copy the 16-character password (remove spaces)

### 2. Add Environment Variables

Add these to your `backend/.env` file:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-16-char-app-password
```

**Important:** Use the App Password, NOT your regular Gmail password!

### 3. Alternative Email Providers

If not using Gmail, update `/backend/utils/email.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});
```

## How It Works

### Signup Flow
1. User fills signup form → submits
2. Backend creates user with `isEmailVerified: false`
3. Backend generates 6-digit OTP (expires in 10 minutes)
4. Backend sends OTP to user's email
5. Frontend shows OTP verification screen
6. User enters OTP → backend verifies
7. Backend marks user as verified → sends welcome email
8. User auto-logged in → redirected to feed

### Login Flow (Unverified User)
1. Unverified user tries to log in
2. Backend blocks login → resends new OTP
3. Frontend shows OTP verification screen
4. User verifies → logs in successfully

## Testing

### Test New User Registration
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Go to `/signup`
4. Register with a real email address
5. Check email for OTP code
6. Enter OTP on verification screen
7. Should redirect to feed after verification

### Test Unverified Login Attempt
1. Try to log in with unverified account
2. Should receive new OTP email
3. OTP screen should appear
4. Verify and log in

## Troubleshooting

### Email Not Sending
- Check `EMAIL_USER` and `EMAIL_APP_PASSWORD` in `.env`
- Verify App Password is correct (not regular password)
- Check console for email errors
- Make sure 2-Step Verification is enabled on Gmail

### OTP Expired
- OTPs expire after 10 minutes
- Use the "Resend OTP" button to get a new code
- Old codes are automatically cleaned up by MongoDB TTL index

### User Already Verified Error
- This means the email is already verified
- Try logging in normally (no OTP needed)

## Features

✅ 6-digit OTP codes  
✅ 10-minute expiration  
✅ Automatic cleanup of expired OTPs  
✅ Resend OTP functionality  
✅ HTML email templates  
✅ Welcome email after verification  
✅ Dark mode support in UI  
✅ Mobile-responsive OTP input  

## Security Notes

- OTPs are stored securely in database
- TTL index automatically removes expired OTPs
- Passwords are hashed with bcrypt
- JWT tokens for authentication
- Email verification prevents fake accounts
