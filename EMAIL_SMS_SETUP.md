# Email & SMS Configuration for OTP

## 📧 **Email Setup (Gmail)**

### **Step 1: Enable App Passwords**
1. Go to your Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate new app password
4. Select "Mail" and "Other (custom name)"
5. Copy the generated 16-character password

### **Step 2: Update Backend .env**
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
```

### **Step 3: Test Email**
```bash
cd backend
npm run dev
```
Try creating an account - you should receive OTP via email.

## 📱 **SMS Setup (Twilio)**

### **Step 1: Create Twilio Account**
1. Go to https://www.twilio.com/
2. Sign up for free account
3. Get your Account SID, Auth Token, and Phone Number

### **Step 2: Update Backend .env**
```env
# SMS Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### **Step 3: Test SMS**
Try creating account with phone number - you should receive OTP via SMS.

## ✅ **Verification**

After setup, users can:
- ✅ Receive OTP codes via email
- ✅ Receive OTP codes via SMS
- ✅ Complete account verification
- ✅ Login successfully

## 🚨 **For Development (No Email/SMS)**

If you don't want to configure email/SMS, the OTP codes will appear in the backend console:
```
⚠️ Email service not configured - OTP would be sent to user@email.com: 123456
```

Just use the code from the console to verify accounts.