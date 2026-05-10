# 🏆 電競錦標賽報名管理自動化系統

> 使用 Google Apps Script 開發的電競錦標賽報名管理系統，整合 Google Sheets、Gmail 和 LINE Messaging API。

---

## 📋 功能特色

- **自動處理報名資料** — Google 表單送出後自動將隊伍資料寫入 Google Sheets
- **資料驗證** — 自動驗證身分證格式、電話格式、Email、戰隊名稱重複、身分證跨欄重複
- **自動寄信通知** — 三種通知信件：
  - 收到報名確認信
  - 審核通過通知（含 Discord QR Code）
  - 審核未通過通知（含未通過原因和重新報名連結）
- **LINE 群組通知** — 每天午夜自動發送當日及累計報名統計到 LINE 群組
- **公開名單** — 自動篩選已審核通過的隊伍（不含個資）
- **賽區分配** — 審核通過的隊伍自動出現在賽區分配表
- **智慧審核系統** — 把「是否寄信通知」改成「已寄 ✓」，自動根據審核狀態寄送對應信件

---

## 🛠 使用技術

- **Google Apps Script**（JavaScript）
- **Google Sheets** — 資料儲存與管理
- **Google Forms** — 報名表單
- **Gmail / MailApp** — 寄送通知信
- **LINE Messaging API** — LINE 群組通知
- **QR Code API**（api.qrserver.com）— 信件內嵌 QR Code

---

## 🚀 安裝與設定

### 前置條件
- 一個 Google 帳號
- 已連結到 Google 試算表的 Google 表單
- LINE Developer 帳號（用於 LINE 通知）

### 第一步：複製腳本
1. 打開你的 Google 試算表
2. 點選 **擴充功能 > Apps Script**
3. 把 `程式碼_github版.js` 的內容全部複製貼上
4. 儲存專案

### 第二步：填寫設定
在腳本裡找到以下變數並填入你的資訊：

```javascript
// 基本設定
var CONFIG = {
  屆次: "第六屆",               // 修改：比賽屆次
  年份: "2026",                 // 修改：年份
  聯絡信箱: "YOUR_EMAIL@gmail.com",
};

// 信件設定
var EMAIL_CONFIG = {
  寄件人名稱: "YOUR_ORGANIZATION_NAME",   // 修改：寄件人顯示名稱
  寄件信箱:   "YOUR_EMAIL@gmail.com",     // 修改：寄件信箱
  屆次:       "第六屆",                    // 修改：和 CONFIG 一致
  年份:       "2026",                     // 修改：和 CONFIG 一致
  DC連結:     "YOUR_DISCORD_INVITE_URL",  // 修改：Discord 伺服器邀請連結
  表單連結:   "YOUR_GOOGLE_FORM_URL",     // 修改：重新報名的表單連結
  Logo網址:   "YOUR_GOOGLE_DRIVE_LOGO_URL", // 修改：Logo 圖片連結（需設為公開）
};

// LINE 設定
var LINE_TOKEN    = "YOUR_LINE_CHANNEL_ACCESS_TOKEN";
var LINE_GROUP_ID = "YOUR_LINE_GROUP_ID";
```

同時把三個寄信函式裡的 `YOUR_LOGO_FILE_ID` 換成你的 Google Drive 圖片 ID。

### 第三步：取得 LINE 群組 ID
1. 到 [developers.line.biz](https://developers.line.biz) 建立 LINE Messaging API Channel
2. 把 Bot 加入你的 LINE 群組
3. 設定 Webhook URL 指向你的 Apps Script 部署網址
4. 在群組裡發一則訊息
5. 執行 `查看群組ID` 函式取得群組 ID
6. 填入 `LINE_GROUP_ID`

### 第四步：設定觸發條件
到 **Apps Script > 時鐘圖示 > 新增觸發條件**：

| 函式 | 事件來源 | 事件類型 |
|------|---------|---------|
| `onFormSubmit` | 試算表 | 表單送出時 |
| `onEdit` | 試算表 | 編輯時 |
| `每日報名統計通知` | 時間驅動 | 日計時器（午夜） |

### 第五步：初次設定
執行 `初次設定` 函式，自動建立所有必要的工作表。

---

## 📁 工作表結構

| 工作表名稱 | 說明 |
|-----------|------|
| ⚔ 傳說_詳細資料 | 傳說對決隊伍詳細報名資料（含個資） |
| 🎯 特戰_詳細資料 | 特戰英豪隊伍詳細報名資料（含個資） |
| ⚔ 傳說_驗證結果 | 傳說對決資料驗證結果 |
| 🎯 特戰_驗證結果 | 特戰英豪資料驗證結果 |
| ⚔ 傳說_公開名單 | 傳說對決已通過審核的公開名單 |
| 🎯 特戰_公開名單 | 特戰英豪已通過審核的公開名單 |
| 🏟 賽區分配 | 賽區分配表 |

---

## ⚙ 設定修改速查

| 要改什麼 | 在哪裡改 |
|---------|---------|
| 屆次、年份 | `var CONFIG` 和 `var EMAIL_CONFIG`（兩個都要改） |
| 寄件人名稱、信箱 | `var EMAIL_CONFIG` |
| Discord 連結 | `EMAIL_CONFIG.DC連結` |
| 重新報名表單連結 | `EMAIL_CONFIG.表單連結` |
| Logo 圖片 | `EMAIL_CONFIG.Logo網址` + 三個信件函式裡的 `YOUR_LOGO_FILE_ID` |
| LINE Token | `var LINE_TOKEN` |
| LINE 群組 | `var LINE_GROUP_ID`（執行 `查看群組ID` 取得新 ID） |
| 表單欄位對應 | `var F`（從0開始的欄位編號） |
| 工作表欄位標題 | `var HEADERS`（改完後需重建工作表） |

---

## 🔄 審核流程

```
隊伍填寫並送出表單
    ↓
自動：寫入工作表 + 寄出「收到報名」通知信
    ↓
工作人員逐一審核每位成員的資料
    ↓
設定每位成員的審核狀態：
  ✓ 審核通過 ✓ = 通過
  ✗ 資料有誤 ✗ = 未通過（在 V 欄填寫未通過原因）
    ↓
把「是否寄信通知」改成「已寄 ✓」
    ↓
自動：根據審核結果寄送對應信件
  - 全部通過 → 寄審核通過信（含 Discord QR Code）
  - 有人未通過 → 寄審核未通過信（含原因）
```

---

## ⚠ 注意事項

- **寄件帳號**：實際寄信的是**執行腳本的 Google 帳號**，不是 `EMAIL_CONFIG` 裡設定的信箱。要換寄件帳號需用新帳號重新登入並授權部署。
- **LINE Token**：重新發行後舊 Token 立刻失效，請馬上更新 `LINE_TOKEN`。
- **重建工作表**：執行 `重建工作表` 會清空所有審核狀態，審核期間請勿執行。
- **Logo 圖片**：Google Drive 圖片必須設為「知道連結的人都可以檢視」才能在信件中顯示。
- **doPost + 查看群組ID**：這兩個函式請保留，換 LINE 群組時需要用到。

---

## 📄 授權

本專案為開源專案，歡迎自由使用和修改用於你自己的活動管理。

---

## 👥 作者

**f0nazj**  
GitHub：[github.com/f0nazj](https://github.com/f0nazj)
