# 🏆 Esports Tournament Registration Management System
### 電競錦標賽報名管理自動化系統

> A Google Apps Script automation system for managing esports tournament registrations, built with Google Sheets, Gmail, and LINE Messaging API.

---

## 📋 Features

- **Auto-process form submissions** — Automatically writes team data into structured Google Sheets when a Google Form is submitted
- **Data validation** — Automatically validates ID format, phone number, email, duplicate team names, and duplicate ID numbers
- **Email notifications** — Sends automated emails for:
  - Registration received confirmation
  - Audit approved notification (with Discord QR code)
  - Audit rejected notification (with reason and re-registration link)
- **LINE group notifications** — Sends daily registration statistics to a LINE group at midnight
- **Public roster** — Auto-filtered public team list (excludes personal info like ID numbers and email)
- **Zone assignment** — Auto-populated zone assignment sheet for approved teams
- **Smart audit system** — One-click email trigger: set "已寄 ✓" to automatically send the appropriate email based on audit status

---

## 🛠 Tech Stack

- **Google Apps Script** (JavaScript)
- **Google Sheets** — Data storage and management
- **Google Forms** — Registration form
- **Gmail / MailApp** — Email notifications
- **LINE Messaging API** — LINE group notifications
- **QR Code API** (api.qrserver.com) — QR codes in emails

---

## 🚀 Setup Guide

### Prerequisites
- A Google account
- A Google Form linked to a Google Spreadsheet
- A LINE Developer account (for LINE notifications)

### Step 1: Copy the Script
1. Open your Google Spreadsheet
2. Go to **Extensions > Apps Script**
3. Copy the contents of `程式碼_github版.js` into the editor
4. Save the project

### Step 2: Configure Settings
Fill in the following variables in the script:

```javascript
// Basic settings
var CONFIG = {
  屆次: "第六屆",          // Tournament edition
  年份: "2026",            // Year
  聯絡信箱: "YOUR_EMAIL@gmail.com",
};

// Email settings
var EMAIL_CONFIG = {
  寄件人名稱: "YOUR_ORGANIZATION_NAME",
  寄件信箱:   "YOUR_EMAIL@gmail.com",
  屆次:       "第六屆",
  年份:       "2026",
  DC連結:     "YOUR_DISCORD_INVITE_URL",      // Discord server invite link
  表單連結:   "YOUR_GOOGLE_FORM_URL",         // Re-registration form link
  Logo網址:   "YOUR_GOOGLE_DRIVE_LOGO_URL",   // Logo image (must be public)
};

// LINE settings
var LINE_TOKEN    = "YOUR_LINE_CHANNEL_ACCESS_TOKEN";
var LINE_GROUP_ID = "YOUR_LINE_GROUP_ID";
```

Also replace `YOUR_LOGO_FILE_ID` in the three email functions with your actual Google Drive file ID.

### Step 3: Get LINE Group ID
1. Create a LINE Messaging API channel at [developers.line.biz](https://developers.line.biz)
2. Add the bot to your LINE group
3. Set up a Webhook URL pointing to your Apps Script deployment
4. Send a message in the group
5. Run the `查看群組ID` function to retrieve the group ID
6. Fill it into `LINE_GROUP_ID`

### Step 4: Set Up Triggers
Go to **Apps Script > Clock icon > Add Trigger**:

| Function | Event Source | Event Type |
|----------|-------------|------------|
| `onFormSubmit` | Spreadsheet | On form submit |
| `onEdit` | Spreadsheet | On edit |
| `每日報名統計通知` | Time-driven | Day timer (Midnight) |

### Step 5: Initial Setup
Run the `初次設定` function to create all required sheets.

---

## 📁 Sheet Structure

| Sheet Name | Description |
|-----------|-------------|
| ⚔ 傳說_詳細資料 | League of Legends team detailed data |
| 🎯 特戰_詳細資料 | Valorant team detailed data |
| ⚔ 傳說_驗證結果 | League of Legends validation results |
| 🎯 特戰_驗證結果 | Valorant validation results |
| ⚔ 傳說_公開名單 | League of Legends public roster |
| 🎯 特戰_公開名單 | Valorant public roster |
| 🏟 賽區分配 | Zone assignment sheet |

---

## ⚙ Configuration Reference

| What to change | Where to change |
|---------------|----------------|
| Tournament edition/year | `var CONFIG` and `var EMAIL_CONFIG` (both!) |
| Sender name/email | `var EMAIL_CONFIG` |
| Discord invite link | `EMAIL_CONFIG.DC連結` |
| Re-registration form link | `EMAIL_CONFIG.表單連結` |
| Logo image | `EMAIL_CONFIG.Logo網址` + replace `YOUR_LOGO_FILE_ID` in email functions |
| LINE token | `var LINE_TOKEN` |
| LINE group | `var LINE_GROUP_ID` (run `查看群組ID` to get new ID) |
| Form field mapping | `var F` (0-indexed column positions) |
| Sheet column headers | `var HEADERS` (rebuild sheets after changing) |

---

## 🔄 Audit Workflow

```
Registration submitted
    ↓
Auto: Write to sheet + Send "Received" email
    ↓
Staff reviews each member's data
    ↓
Set audit status for each member:
  ✓ 審核通過 ✓ = Approved
  ✗ 資料有誤 ✗ = Rejected (fill in reason in V column)
    ↓
Change "是否寄信通知" to "已寄 ✓"
    ↓
Auto: Send appropriate email
  - All approved → Send approval email (with Discord QR)
  - Any rejected → Send rejection email (with reason)
```

---

## ⚠ Important Notes

- **Sender email**: The actual sending account is the Google account that **runs** the script, not the one set in `EMAIL_CONFIG`. To change the sender, re-authorize with the new account.
- **LINE Token**: If you reissue the token, the old one expires immediately. Update `LINE_TOKEN` right away.
- **Rebuild sheets**: Running `重建工作表` clears all audit statuses. Do NOT run this during active review.
- **Logo image**: Must be set to "Anyone with the link can view" in Google Drive.
- **doPost + 查看群組ID**: Keep these functions — needed when switching LINE groups.

---

## 📄 License

This project is open source. Feel free to use and modify it for your own tournament management needs.

---

## 👥 Author

**f0nazj**  
GitHub: [github.com/f0nazj](https://github.com/f0nazj)
