# Payment Verification System Setup

This app now includes an admin verification system for payments. When users submit a payment, it goes through the following flow:

## Flow Overview

1. **User submits payment** via Send Money dialog
2. **OCR verifies** the payment screenshot
3. **Screenshot is uploaded** to Cloudinary (if configured)
4. **Payment enters pending state** waiting for admin approval
5. **Admin reviews** the payment screenshot in the admin panel
6. **Admin approves/rejects** the payment
7. **If approved**, the donation is recorded and added to the earned balance

## Setup Instructions

### 1. Cloudinary Configuration (Required for Screenshot Storage)

Cloudinary is used to store payment screenshots so admins can review them.

**Steps:**

1. **Create a Cloudinary account** (free tier available):
   - Go to https://cloudinary.com/
   - Sign up for a free account

2. **Get your Cloud Name**:
   - After logging in, you'll see your cloud name in the dashboard URL
   - Example: `https://console.cloudinary.com/console/c-XXXXX` → `XXXXX` is your cloud name
   - Or find it in the Dashboard under "Account Details"

3. **Create an Upload Preset**:
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set signing mode to **"Unsigned"** (important!)
   - Name it something like `epay-receipts`
   - Save the preset

4. **Update your .env file**:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_here
   ```

5. **Restart your dev server** after updating .env

### 2. Firebase Firestore Rules

Add/update these rules in your Firebase Console (Firestore Database → Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Funding stats - read by anyone, write only by authenticated users
    match /funding/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Activity logs - read by anyone, write only by authenticated users  
    match /activityLogs/{logId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Donor logs - read by anyone, write only by authenticated users
    match /donorLogs/{logId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Admin notifications - read/write only by authenticated users
    match /adminNotifications/{notifId} {
      allow read, write: if request.auth != null;
    }
    
    // Pending payments
    match /pendingPayments/{paymentId} {
      // Anyone can create a new pending payment
      allow create: if true;
      // Anyone can read (for now - tighten this in production)
      allow read: if true;
      // Only authenticated users (admin) can update/delete
      allow update, delete: if request.auth != null;
    }
  }
}
```

**Note:** These rules allow reads without authentication for demo purposes. For production, implement proper admin authentication.

### 3. Testing Without Cloudinary

If you don't configure Cloudinary, the system will still work but:
- Screenshot URLs will be empty
- Admins won't be able to see the payment screenshots
- Payments will still be verified via OCR and submitted for admin approval

## Admin Workflow

1. **Login to admin panel** at `/admin` (password: `epaygar`)
2. **View pending payments** section at the top
3. **Click on screenshot** to view full size in new tab
4. **Verify the payment** details:
   - Check amount matches
   - Verify recipient is "Marahatta"
   - Check the payment is legitimate
5. **Approve or Reject**:
   - **Approve**: Payment is recorded, added to earned balance, donor appears in leaderboard
   - **Reject**: Payment is marked as rejected, nothing is recorded

## Features

- ✅ OCR verification before submission
- ✅ Screenshot upload to Cloudinary
- ✅ Pending payment queue for admin review
- ✅ Visual screenshot preview in admin panel
- ✅ One-click approve/reject buttons
- ✅ Automatic notification when payment is approved
- ✅ Works in local mode if Cloudinary isn't configured

## Security Notes

- Unsigned upload preset is used for simplicity
- For production, consider:
  - Adding authentication to restrict who can upload
  - Setting upload folder restrictions in Cloudinary
  - Implementing rate limiting on submissions
  - Adding server-side validation via Cloudinary webhooks
