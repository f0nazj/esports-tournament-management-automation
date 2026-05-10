// ================================================================
//  高校盃電競錦標賽  ──  Google Apps Script  完整自動化腳本
//  Esports Tournament Registration Management System
//
//  作者/Author: f0nazj
//  GitHub: [github.com/f0nazj](https://github.com/f0nazj)
//
//  版本/Version: v6 Final
//
// ================================================================
//
//  ╔══════════════════════════════════════════════════════════════╗
//  ║  ⚙ 設定目錄 ── 使用前請先填寫以下設定                        ║
//  ╠══════════════════════════════════════════════════════════════╣
//  ║                                                              ║
//  ║  【1. 屆次 / 年份】                                          ║
//  ║     位置：var CONFIG = { ... }                               ║
//  ║     位置：var EMAIL_CONFIG = { ... }                         ║
//  ║     ⚠ 兩個地方都要改                                         ║
//  ║                                                              ║
//  ║  【2. Gmail 寄件設定】                                        ║
//  ║     位置：var EMAIL_CONFIG = { 寄件人名稱, 寄件信箱 }         ║
//  ║     ⚠ 實際寄信用的是「執行者的 Gmail」                        ║
//  ║       要換寄件帳號需重新用新帳號登入並授權部署                 ║
//  ║                                                              ║
//  ║  【3. Discord / 表單 / Logo 設定】                           ║
//  ║     位置：var EMAIL_CONFIG = { DC連結, 表單連結, Logo網址 }   ║
//  ║     DC連結   → 換成你的 Discord 伺服器邀請連結               ║
//  ║     表單連結 → 換成你的 Google 表單連結                       ║
//  ║     Logo網址 → 換成你上傳到 Google Drive 的圖片連結           ║
//  ║              （需設為「知道連結的人都可以檢視」）              ║
//  ║                                                              ║
//  ║  【4. Line 群組通知設定】                                     ║
//  ║     位置：var LINE_TOKEN = "YOUR_LINE_CHANNEL_ACCESS_TOKEN"  ║
//  ║           var LINE_GROUP_ID = "YOUR_LINE_GROUP_ID"          ║
//  ║     取得方式：                                               ║
//  ║       TOKEN → https://developers.line.biz > 你的Channel     ║
//  ║               > Messaging API > Channel access token > Issue ║
//  ║       GROUP_ID → 把Bot加入群組後執行「查看群組ID」函式        ║
//  ║                                                              ║
//  ║  【5. 表單欄位對應】                                          ║
//  ║     位置：var F = { ... }                                    ║
//  ║     如果表單題目順序有改變，修改對應的欄位編號（從0開始）      ║
//  ║                                                              ║
//  ╠══════════════════════════════════════════════════════════════╣
//  ║  🔄 觸發條件設定（Apps Script > 時鐘圖示）                    ║
//  ╠══════════════════════════════════════════════════════════════╣
//  ║  onFormSubmit → 來源=試算表, 事件=表單送出時                  ║
//  ║  onEdit       → 來源=試算表, 事件=編輯時                     ║
//  ║  每日報名統計通知 → 來源=時間, 類型=日計時器, 時間=午夜       ║
//  ╚══════════════════════════════════════════════════════════════╝
//
// ================================================================

// ── 基本設定 ─────────────────────────────────────────────────────
var CONFIG = {
  屆次:    "第六屆",        // ← 修改這裡
  年份:    "2026",          // ← 修改這裡
  聯絡信箱: "YOUR_EMAIL@gmail.com",  // ← 修改這裡
};

// ── 表單欄位對應（從0開始，對應試算表的欄位順序）────────────────
var F = {
  timestamp:   0,  email:       1,  game:        2,
  school:      3,  team_name:   4,
  coach_name:  5,  coach_phone: 6,
  cap_name:    7,  cap_gender:  8,  cap_id:      9,
  cap_grade:   10, cap_line:    11, cap_phone:   12,
  cap_address: 13, cap_gid:     14,
  m1_name: 15, m1_gender: 16, m1_id: 17, m1_grade: 18, m1_phone: 19, m1_gid: 20,
  m2_name: 21, m2_gender: 22, m2_id: 23, m2_grade: 24, m2_phone: 25, m2_gid: 26,
  m3_name: 27, m3_gender: 28, m3_id: 29, m3_grade: 30, m3_phone: 31, m3_gid: 32,
  m4_name: 33, m4_gender: 34, m4_id: 35, m4_grade: 36, m4_phone: 37, m4_gid: 38,
  sub_name: 39, sub_gender: 40, sub_id: 41, sub_grade: 42, sub_phone: 43, sub_gid: 44,
  cap_img_f: 45, cap_img_b: 46,
  m1_img_f:  47, m1_img_b:  48,
  m2_img_f:  49, m2_img_b:  50,
  m3_img_f:  51, m3_img_b:  52,
  m4_img_f:  53, m4_img_b:  54,
  sub_img_f: 55, sub_img_b: 56,
};

// ── 詳細資料工作表欄位標題 ────────────────────────────────────────
var HEADERS = [
  "遊戲","學校（全名）","戰隊名稱","身份",
  "姓名","性別","身分證字號","年級","LINE ID",
  "電話","遊戲 ID","Email","地址",
  "學生證正面","學生證反面",
  "審核狀態","備註",
  "第一次聯絡","第二次聯絡","第三次聯絡",
  "是否寄信通知","未通過原因","報名時間",
];

// ── 顏色常數 ──────────────────────────────────────────────────────
var C = {
  NAVY:"#1A2744",    GRN_MID:"#2E7D32",  GRN_LT:"#E8F5E9",
  PUR_MID:"#6A1B9A", PUR_LT:"#F3E5F5",
  RED_MID:"#C62828", RED_LT:"#FFEBEE",
  ORG_LT:"#FFF3E0",  GOLD_LT:"#FFFDE7",
  BLU_LT:"#E3F2FD",  TEA_LT:"#E0F2F1",
  GRY_H:"#F5F5F5",   WHT:"#FFFFFF",
  AMB:"#FF8F00",     GRN2_LT:"#F1F8E9",
};

// ════════════════════════════════════════════════════════════════
//  自動找到表單回應工作表（不管叫什麼名字）
// ════════════════════════════════════════════════════════════════
function getFormResponseSheet(ss) {
  var sheets = ss.getSheets();
  var best = null;
  var bestCols = 0;

  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    var name = sh.getName();
    if (name.indexOf("詳細資料") !== -1) continue;
    if (name.indexOf("驗證結果") !== -1) continue;
    if (name.indexOf("公開名單") !== -1) continue;
    if (name.indexOf("賽區分配") !== -1) continue;
    if (name.indexOf("統計") !== -1) continue;
    var lastCol = sh.getLastColumn();
    var lastRow = sh.getLastRow();
    if (lastRow < 2 || lastCol < 10) continue;
    var header1 = String(sh.getRange(1, 1).getValue());
    if (header1.indexOf("時間") !== -1 || header1.indexOf("Timestamp") !== -1 || lastCol >= 50) {
      if (lastCol > bestCols) { bestCols = lastCol; best = sh; }
    }
  }
  if (!best) {
    for (var j = 0; j < sheets.length; j++) {
      var cols = sheets[j].getLastColumn();
      if (cols > bestCols) { bestCols = cols; best = sheets[j]; }
    }
  }
  Logger.log("找到表單回應工作表：" + (best ? best.getName() : "找不到") + "（" + bestCols + " 欄）");
  return best;
}

// ════════════════════════════════════════════════════════════════
//  表單送出自動觸發
// ════════════════════════════════════════════════════════════════
function onFormSubmit(e) {
  try {
    var ss   = SpreadsheetApp.getActiveSpreadsheet();
    var rSh  = getFormResponseSheet(ss);
    if (!rSh) { Logger.log("找不到表單回應工作表"); return; }
    var last = rSh.getLastRow();
    var row  = rSh.getRange(last, 1, 1, rSh.getLastColumn()).getValues()[0];
    var game = String(row[F.game] || "");
    if (game.indexOf("傳說對決") !== -1) writeTeam(ss, row, "傳說對決");
    if (game.indexOf("特戰英豪") !== -1) writeTeam(ss, row, "特戰英豪");
    寄送收到報名通知(String(row[F.email]), String(row[F.team_name]), String(row[F.cap_name]), String(row[F.game]));
  } catch(err) {
    Logger.log("onFormSubmit 錯誤：" + err);
    try { MailApp.sendEmail(Session.getActiveUser().getEmail(), "⚠ 高校盃報名系統：資料寫入失敗", "錯誤：" + err); } catch(e2) {}
  }
}

// ════════════════════════════════════════════════════════════════
//  寫入一支隊伍
// ════════════════════════════════════════════════════════════════
function writeTeam(ss, row, game) {
  var sName  = game === "傳說對決" ? "⚔ 傳說_詳細資料" : "🎯 特戰_詳細資料";
  var hColor = game === "傳說對決" ? C.GRN_MID : C.PUR_MID;
  var lColor = game === "傳說對決" ? C.GRN_LT  : C.PUR_LT;
  var ws = ss.getSheetByName(sName);
  if (!ws) { ws = ss.insertSheet(sName); setupDetailSheet(ws, game); }

  var g = function(col) {
    var v = row[col];
    if (v === undefined || v === null) return "";
    var s = String(v).trim();
    return s === "NaN" || s === "nan" ? "" : s;
  };

  var now   = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy/MM/dd HH:mm");
  var email = g(F.email);
  var sch   = g(F.school);
  var team  = g(F.team_name);
  var members = [];

  members.push({
    role:"隊長", name:g(F.cap_name), gender:g(F.cap_gender), id:g(F.cap_id),
    grade:g(F.cap_grade), line:g(F.cap_line), phone:g(F.cap_phone),
    gid:g(F.cap_gid), addr:g(F.cap_address), imgF:g(F.cap_img_f), imgB:g(F.cap_img_b),
  });

  var mf = [
    [F.m1_name,F.m1_gender,F.m1_id,F.m1_grade,F.m1_phone,F.m1_gid,F.m1_img_f,F.m1_img_b],
    [F.m2_name,F.m2_gender,F.m2_id,F.m2_grade,F.m2_phone,F.m2_gid,F.m2_img_f,F.m2_img_b],
    [F.m3_name,F.m3_gender,F.m3_id,F.m3_grade,F.m3_phone,F.m3_gid,F.m3_img_f,F.m3_img_b],
    [F.m4_name,F.m4_gender,F.m4_id,F.m4_grade,F.m4_phone,F.m4_gid,F.m4_img_f,F.m4_img_b],
  ];
  for (var i = 0; i < mf.length; i++) {
    if (g(mf[i][0])) members.push({
      role:"隊員 "+(i+1), name:g(mf[i][0]), gender:g(mf[i][1]), id:g(mf[i][2]),
      grade:g(mf[i][3]), line:"", phone:g(mf[i][4]), gid:g(mf[i][5]),
      addr:"", imgF:g(mf[i][6]), imgB:g(mf[i][7]),
    });
  }
  if (g(F.sub_name)) members.push({
    role:"候補", name:g(F.sub_name), gender:g(F.sub_gender), id:g(F.sub_id),
    grade:g(F.sub_grade), line:"", phone:g(F.sub_phone), gid:g(F.sub_gid),
    addr:"", imgF:g(F.sub_img_f), imgB:g(F.sub_img_b),
  });
  if (g(F.coach_name)) members.push({
    role:"指導老師", name:g(F.coach_name), gender:"", id:"", grade:"",
    line:"", phone:g(F.coach_phone), gid:"", addr:"", imgF:"", imgB:"",
  });

  var startRow = ws.getLastRow() < 4 ? 4 : ws.getLastRow() + 1;

  for (var mi = 0; mi < members.length; mi++) {
    var m       = members[mi];
    var r       = startRow + mi;
    var isCoach = m.role === "指導老師";
    var isCap   = m.role === "隊長";
    var isSub   = m.role === "候補";
    var imgFVal = m.imgF ? '=HYPERLINK("'+m.imgF+'","📷 正面")' : "";
    var imgBVal = m.imgB ? '=HYPERLINK("'+m.imgB+'","📷 反面")' : "";
    var vals = [
      game, sch, team, m.role, m.name, m.gender, m.id, m.grade, m.line,
      m.phone, m.gid, email, m.addr, imgFVal, imgBVal,
      "待審核", "", "", "", "", "否", "", now,
    ];
    ws.getRange(r, 1, 1, vals.length).setValues([vals]);
    ws.setRowHeight(r, 22);
    applyRowStyle(ws, r, isCoach, isCap, isSub, mi % 2 === 0, hColor, lColor);
  }

  ws.getRange(startRow + members.length - 1, 1, 1, HEADERS.length)
    .setBorder(null,null,true,null,null,null,"#000000",SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  if (members.length > 1) {
    ws.getRange(startRow, 21, members.length, 1).merge()
      .setValue("否").setBackground("#FFF9C4")
      .setFontFamily("微軟正黑體").setFontSize(9)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
    ws.getRange(startRow, 22, members.length, 1).merge()
      .setBackground("#FFFFFF").setFontFamily("微軟正黑體").setFontSize(9)
      .setHorizontalAlignment("left").setVerticalAlignment("middle");
    ws.getRange(startRow, 12, members.length, 1).merge()
      .setFontFamily("微軟正黑體").setFontSize(9)
      .setHorizontalAlignment("left").setVerticalAlignment("middle");
    ws.getRange(startRow, 2, members.length, 1).merge()
      .setFontFamily("微軟正黑體").setFontSize(9)
      .setHorizontalAlignment("left").setVerticalAlignment("middle");
    ws.getRange(startRow, 3, members.length, 1).merge()
      .setFontFamily("微軟正黑體").setFontSize(9)
      .setHorizontalAlignment("left").setVerticalAlignment("middle");
  }

  Logger.log("✓ " + team + "（" + game + "）" + members.length + " 列完成");
}

// ════════════════════════════════════════════════════════════════
//  列樣式
// ════════════════════════════════════════════════════════════════
function applyRowStyle(ws, r, isCoach, isCap, isSub, alt, hColor, lColor) {
  var base = alt ? "#EEF6FF" : C.WHT;
  if (isSub) base = "#F3F0FF";
  ws.getRange(r, 1, 1, HEADERS.length)
    .setFontFamily("微軟正黑體").setFontSize(9)
    .setVerticalAlignment("middle").setBackground(base)
    .setBorder(true,true,true,true,true,true,"#CCCCCC",SpreadsheetApp.BorderStyle.SOLID);
  var styles = [
    [1,  hColor, C.WHT, true, false, "center"],
    [2,  isCoach?C.GOLD_LT:(alt?"#EEF6FF":C.BLU_LT), null, true, false, "left"],
    [3,  isCoach?C.GOLD_LT:(alt?"#EEF6FF":C.BLU_LT), null, true, false, "left"],
    [4,  isCoach?C.GOLD_LT:(isCap?"#FFF9C4":(isSub?"#EDE7F6":C.GRY_H)),
         isCoach?C.AMB:(isCap?"#F9A825":(isSub?"#6A1B9A":"#616161")),
         (!isCoach), isCoach, "center"],
    [7,  C.ORG_LT,  "#E65100", false, false, "center"],
    [9,  "#DCFFE9", "#06A63A", true,  false, "center"],
    [14, C.BLU_LT, "#1565C0", false, false, "center"],
    [15, C.BLU_LT, "#1565C0", false, false, "center"],
    [16, C.GOLD_LT, C.AMB,    true,  false, "center"],
    [18, C.TEA_LT,  null,     false, false, "left"],
    [19, C.TEA_LT,  null,     false, false, "left"],
    [20, C.TEA_LT,  null,     false, false, "left"],
    [21, C.GRN2_LT, null,     false, false, "center"],
  ];
  for (var i = 0; i < styles.length; i++) {
    var s = styles[i], cell = ws.getRange(r, s[0]);
    if (s[1]) cell.setBackground(s[1]);
    if (s[2]) cell.setFontColor(s[2]);
    if (s[3]) cell.setFontWeight("bold");
    if (s[4]) cell.setFontStyle("italic");
    cell.setHorizontalAlignment(s[5]||"center");
  }
}

// ════════════════════════════════════════════════════════════════
//  初次設定
// ════════════════════════════════════════════════════════════════
function 初次設定() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rSh = getFormResponseSheet(ss);
  var msg = rSh
    ? "✅ 找到表單回應工作表：「" + rSh.getName() + "」\n共 " + rSh.getLastColumn() + " 欄，" + (rSh.getLastRow()-1) + " 筆資料\n\n"
    : "⚠ 找不到表單回應工作表，請確認表單已連結\n\n";
  var pairs = [
    ["⚔ 傳說_詳細資料","傳說對決","⚔ 傳說_驗證結果"],
    ["🎯 特戰_詳細資料","特戰英豪","🎯 特戰_驗證結果"],
  ];
  for (var i = 0; i < pairs.length; i++) {
    var det = ss.getSheetByName(pairs[i][0]);
    if (!det) { det = ss.insertSheet(pairs[i][0]); setupDetailSheet(det, pairs[i][1]); }
    else { rebuildDetailHeader(det, pairs[i][1]); }
    var val = ss.getSheetByName(pairs[i][2]);
    if (!val) { val = ss.insertSheet(pairs[i][2]); setupValidationSheet(val, pairs[i][1], pairs[i][0]); }
    else { rebuildValidationHeader(val, pairs[i][1], pairs[i][0]); }
  }
  SpreadsheetApp.getUi().alert("✅ 初次設定完成", msg + "接下來請執行「重新處理所有回應」重新整理資料。", SpreadsheetApp.getUi().ButtonSet.OK);
}

// ════════════════════════════════════════════════════════════════
//  建立詳細資料工作表
// ════════════════════════════════════════════════════════════════
function setupDetailSheet(ws, game) {
  rebuildDetailHeader(ws, game);
  var widths=[90,220,160,80,100,65,130,70,140,120,200,260,280,160,160,110,200,120,120,120,110,130];
  for (var i=0;i<widths.length&&i<HEADERS.length;i++) ws.setColumnWidth(i+1,widths[i]);
  ws.setFrozenRows(3);
  ws.getRange(4,16,500).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["待審核","審核通過 ✓","資料有誤 ✗","補件中"],true)
      .setAllowInvalid(false).build());
  ws.getRange(4,21,500).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["否","已寄 ✓"],true).setAllowInvalid(false).build());
  ws.getRange(4,6,500).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["男生","女生"],true).setAllowInvalid(true).build());
  ws.getRange(4,8,500).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(["一年級","二年級","三年級"],true).setAllowInvalid(true).build());
  var rng = ws.getRange("A4:V600");
  ws.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$P4="資料有誤 ✗"')
      .setBackground("#FFF0F0").setFontColor(C.RED_MID).setRanges([rng]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$P4="審核通過 ✓"')
      .setBackground("#4CAF50").setFontColor("#FFFFFF").setRanges([rng]).build(),
  ]);
}

function rebuildDetailHeader(ws, game) {
  var hColor = game === "傳說對決" ? C.GRN_MID : C.PUR_MID;
  ws.getRange(1,1,1,HEADERS.length).merge()
    .setValue(CONFIG.年份+"年"+CONFIG.屆次+"高校盃電競錦標賽 ── "+game+" 戰隊詳細報名資料表")
    .setBackground(hColor).setFontColor(C.WHT).setFontFamily("微軟正黑體")
    .setFontSize(13).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  ws.setRowHeight(1,38);
  ws.getRange(2,1,1,HEADERS.length).merge()
    .setValue("⚠ 含個人資料 ── 僅限內部審核使用，請勿對外公開｜教練設「審核通過 ✓」= 全隊通過")
    .setBackground(C.RED_MID).setFontColor(C.WHT).setFontFamily("微軟正黑體")
    .setFontSize(9).setFontStyle("italic")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  ws.setRowHeight(2,18);
  ws.getRange(3,1,1,HEADERS.length).setValues([HEADERS])
    .setBackground(C.NAVY).setFontColor(C.WHT).setFontFamily("微軟正黑體")
    .setFontSize(9).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true)
    .setBorder(true,true,true,true,true,true,C.WHT,SpreadsheetApp.BorderStyle.SOLID);
  ws.setRowHeight(3,34);
}

// ════════════════════════════════════════════════════════════════
//  建立驗證結果工作表
// ════════════════════════════════════════════════════════════════
function setupValidationSheet(ws, game, detailName) {
  rebuildValidationHeader(ws, game, detailName);
  var widths=[40,160,160,80,100,110,110,140,120,120,100,110,100,120,240];
  for (var i=0;i<widths.length;i++) ws.setColumnWidth(i+1,widths[i]);
  var dRng = ws.getRange("F3:M503");
  ws.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith("✗")
      .setBackground(C.RED_LT).setFontColor(C.RED_MID).setFontWeight("bold").setRanges([dRng]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextStartsWith("✓")
      .setBackground(C.GRN_LT).setFontColor(C.GRN_MID).setRanges([dRng]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("—")
      .setBackground(C.GRY_H).setFontColor("#9E9E9E").setRanges([dRng]).build(),
  ]);
  ws.setFrozenRows(2);
}

function rebuildValidationHeader(ws, game, detailName) {
  var DET = "'"+detailName+"'";
  ws.getRange(1,1,1,15).merge()
    .setValue("✅ "+game+" 驗證結果 ── 紅=需確認 綠=通過｜教練欄「同隊有問題?」顯示✓才可設審核通過")
    .setBackground(C.RED_MID).setFontColor(C.WHT).setFontFamily("微軟正黑體")
    .setFontSize(11).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  ws.setRowHeight(1,30);
  var hdrs=["列","學校","戰隊","身份","姓名",
    "身分證格式","電話格式","遊戲ID格式","LINE ID(隊長)","Email(隊長)",
    "戰隊名重複?","身分證跨欄重複?","同隊有問題?","審核狀態","備註"];
  ws.getRange(2,1,1,hdrs.length).setValues([hdrs])
    .setBackground(C.NAVY).setFontColor(C.WHT).setFontFamily("微軟正黑體")
    .setFontSize(8).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle").setWrap(true);
  ws.setRowHeight(2,30);
  var MAX=500;
  if (ws.getLastRow() > 2)
    ws.getRange(3,1,Math.max(ws.getLastRow()-2,1),15).clearContent();
  var formulas=[];
  for (var r=3;r<3+MAX;r++) {
    var dr=r+1;
    var id  ='=IF(OR('+DET+'!G'+dr+'="",'+DET+'!D'+dr+'="指導老師"),"—",IF(AND(LEN('+DET+'!G'+dr+')=10,OR(AND(CODE(UPPER(LEFT('+DET+'!G'+dr+',1)))>=65,CODE(UPPER(LEFT('+DET+'!G'+dr+',1)))<=90)),OR(MID('+DET+'!G'+dr+',2,1)="1",MID('+DET+'!G'+dr+',2,1)="2"),ISNUMBER(VALUE(RIGHT('+DET+'!G'+dr+',8)))),"✓ OK","✗ 格式錯誤"))';
    var ph  ='=IF(OR('+DET+'!J'+dr+'="",'+DET+'!J'+dr+'=0),"—",IF(AND(LEN(TEXT('+DET+'!J'+dr+',"0000000000"))=10,LEFT(TEXT('+DET+'!J'+dr+',"0000000000"),2)="09",ISNUMBER(VALUE(TEXT('+DET+'!J'+dr+',"0000000000")))),"✓ OK","✗ 格式錯誤"))';
    var gid ='=IF(OR('+DET+'!K'+dr+'="",'+DET+'!D'+dr+'="指導老師"),"—",IF(OR(AND(LEN(TEXT('+DET+'!K'+dr+',"@"))=10,LEFT(TEXT('+DET+'!K'+dr+',"@"),2)="09",ISNUMBER(VALUE('+DET+'!K'+dr+'))),AND(LEN('+DET+'!K'+dr+')=10,ISNUMBER(VALUE(RIGHT('+DET+'!K'+dr+',8))),OR(MID('+DET+'!K'+dr+',2,1)="1",MID('+DET+'!K'+dr+',2,1)="2"))),"✗ 疑似電話/身分證","✓ OK"))';
    var line='=IF(OR('+DET+'!I'+dr+'="",'+DET+'!D'+dr+'<>"隊長"),"—",IF(OR(AND(LEN(TEXT('+DET+'!I'+dr+',"@"))=10,LEFT(TEXT('+DET+'!I'+dr+',"@"),2)="09",ISNUMBER(VALUE('+DET+'!I'+dr+'))),AND(LEN('+DET+'!I'+dr+')=10,ISNUMBER(VALUE(RIGHT('+DET+'!I'+dr+',8))),OR(MID('+DET+'!I'+dr+',2,1)="1",MID('+DET+'!I'+dr+',2,1)="2"))),"✗ 疑似填錯","✓ OK"))';
    var mail='=IF(OR('+DET+'!L'+dr+'="",'+DET+'!D'+dr+'<>"隊長"),"—",IF(ISNUMBER(FIND("@",'+DET+'!L'+dr+')),"✓ OK","✗ 無@符號"))';
    var tdup='=IF('+DET+'!C'+dr+'="","—",IF(COUNTIFS('+DET+'!A$4:A$600,'+DET+'!A'+dr+','+DET+'!C$4:C$600,'+DET+'!C'+dr+','+DET+'!D$4:D$600,"隊長")>1,"✗ 重複","✓ OK"))';
    var idup='=IF(OR('+DET+'!G'+dr+'="",'+DET+'!D'+dr+'="指導老師"),"—",IF(COUNTIF('+DET+'!G$4:G$600,'+DET+'!G'+dr+')>1,"✗ 有重複","✓ OK"))';
    var terr='=IF(OR('+DET+'!C'+dr+'="",'+DET+'!D'+dr+'<>"指導老師"),"—",IF(COUNTIFS('+DET+'!B$4:B$600,'+DET+'!B'+dr+','+DET+'!C$4:C$600,'+DET+'!C'+dr+','+DET+'!P$4:P$600,"資料有誤 ✗")>0,"✗ 有隊員未通過","✓ 可審核"))';
    formulas.push([r-2,'='+DET+'!B'+dr,'='+DET+'!C'+dr,'='+DET+'!D'+dr,'='+DET+'!E'+dr,
      id,ph,gid,line,mail,tdup,idup,terr,'='+DET+'!P'+dr,'']);
  }
  ws.getRange(3,1,formulas.length,15).setValues(formulas);
  ws.setRowHeights(3,MAX,20);
}

// ════════════════════════════════════════════════════════════════
//  重新處理所有回應
// ════════════════════════════════════════════════════════════════
function 重新處理所有回應() {
  var ss  = SpreadsheetApp.getActiveSpreadsheet();
  var rSh = getFormResponseSheet(ss);
  if (!rSh) { SpreadsheetApp.getUi().alert("❌ 找不到表單回應工作表，請確認表單已連結到此試算表。"); return; }
  var last = rSh.getLastRow();
  if (last < 2) { SpreadsheetApp.getUi().alert("目前沒有回應資料。"); return; }
  Logger.log("使用工作表：" + rSh.getName() + "，共 " + (last-1) + " 筆");
  ["⚔ 傳說_詳細資料","🎯 特戰_詳細資料"].forEach(function(name){
    var ws = ss.getSheetByName(name);
    if (ws && ws.getLastRow() > 3)
      ws.getRange(4,1,ws.getLastRow()-3,HEADERS.length).clearContent().clearFormat();
  });
  var data  = rSh.getRange(2,1,last-1,rSh.getLastColumn()).getValues();
  var count = 0;
  for (var i=0;i<data.length;i++){
    if (!data[i][F.school]) continue;
    if (data[i].length < 45) { Logger.log("第" + (i+2) + "列欄數不足，跳過"); continue; }
    var game = String(data[i][F.game]||"");
    if (game.indexOf("傳說對決")!==-1) writeTeam(ss,data[i],"傳說對決");
    if (game.indexOf("特戰英豪")!==-1) writeTeam(ss,data[i],"特戰英豪");
    count++;
  }
  try { SpreadsheetApp.getUi().alert("✅ 完成！共處理 "+count+" 筆報名資料。"); }
  catch(e) { Logger.log("✅ 完成！共處理 "+count+" 筆報名資料。"); }
}

// ════════════════════════════════════════════════════════════════
//  重建工作表
// ════════════════════════════════════════════════════════════════
function 重建工作表() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ["⚔ 傳說_詳細資料","🎯 特戰_詳細資料"].forEach(function(name){
    var ws = ss.getSheetByName(name);
    if (ws) ss.deleteSheet(ws);
  });
  var lol = ss.insertSheet("⚔ 傳說_詳細資料"); setupDetailSheet(lol, "傳說對決");
  var val = ss.insertSheet("🎯 特戰_詳細資料"); setupDetailSheet(val, "特戰英豪");
  SpreadsheetApp.getUi().alert("✅ 工作表重建完成，請再執行「重新處理所有回應」");
}

// ════════════════════════════════════════════════════════════════
//  重建公開名單
// ════════════════════════════════════════════════════════════════
function 重建公開名單() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configs = [
    { detailName:"⚔ 傳說_詳細資料", pubName:"⚔ 傳說_公開名單", game:"傳說對決", hColor:"#2E7D32", tabColor:"#1B5E20" },
    { detailName:"🎯 特戰_詳細資料", pubName:"🎯 特戰_公開名單", game:"特戰英豪", hColor:"#6A1B9A", tabColor:"#4A148C" },
  ];
  for (var ci = 0; ci < configs.length; ci++) {
    var old = ss.getSheetByName(configs[ci].pubName);
    if (old) ss.deleteSheet(old);
    buildPublicSheet(ss.insertSheet(configs[ci].pubName), configs[ci]);
  }
  try { SpreadsheetApp.getUi().alert("✅ 公開名單重建完成"); }
  catch(e) { Logger.log("✅ 公開名單重建完成"); }
}

function buildPublicSheet(ws, cfg) {
  var DET = "'" + cfg.detailName + "'";
  ws.clear(); ws.setTabColor(cfg.tabColor); ws.setHiddenGridlines(true);
  var pubHeaders = ["遊戲","學校","戰隊名稱","身份","姓名","遊戲 ID","連絡電話","審核狀態"];
  var pubWidths  = [90, 200, 160, 80, 100, 200, 130, 100];
  for (var i = 0; i < pubWidths.length; i++) ws.setColumnWidth(i + 1, pubWidths[i]);
  ws.getRange(1,1,1,8).merge()
    .setValue(CONFIG.年份+" 年"+CONFIG.屆次+"高校盃電競錦標賽 ── " + cfg.game + " 戰隊對戰資料表（公開版）")
    .setBackground(cfg.hColor).setFontColor("#FFFFFF").setFontFamily("微軟正黑體")
    .setFontSize(13).setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
  ws.setRowHeight(1, 40);
  ws.getRange(2,1,1,8).merge()
    .setValue("✅ 自動連動詳細資料 ── 指導老師審核通過且全隊無誤才顯示｜不含身分證、Email 等個資")
    .setBackground("#616161").setFontColor("#FFFFFF").setFontFamily("微軟正黑體")
    .setFontSize(9).setFontStyle("italic").setHorizontalAlignment("center").setVerticalAlignment("middle");
  ws.setRowHeight(2, 18);
  ws.getRange(3,1,1,8).setValues([pubHeaders])
    .setBackground("#1A2744").setFontColor("#FFFFFF").setFontFamily("微軟正黑體")
    .setFontSize(10).setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setBorder(true,true,true,true,true,true,"#FFFFFF",SpreadsheetApp.BorderStyle.SOLID);
  ws.setRowHeight(3, 28); ws.setFrozenRows(3);
  var colA=DET+"!A4:A600", colB=DET+"!B4:B600", colC=DET+"!C4:C600", colD=DET+"!D4:D600";
  var colE=DET+"!E4:E600", colJ=DET+"!J4:J600", colK=DET+"!K4:K600", colP=DET+"!P4:P600";
  var cond =
    "(COUNTIFS("+colC+","+colC+","+colD+",\"指導老師\","+colP+",\"審核通過 ✓\")>0)*" +
    "(COUNTIFS("+colC+","+colC+","+colP+",\"資料有誤 ✗\")=0)*" +
    "("+colE+"<>\"\")";
  ws.getRange(4,1).setFormula("=IFERROR(FILTER("+colA+","+cond+"),\"\")");
  ws.getRange(4,2).setFormula("=IFERROR(FILTER("+colB+","+cond+"),\"\")");
  ws.getRange(4,3).setFormula("=IFERROR(FILTER("+colC+","+cond+"),\"\")");
  ws.getRange(4,4).setFormula("=IFERROR(FILTER("+colD+","+cond+"),\"\")");
  ws.getRange(4,5).setFormula("=IFERROR(FILTER("+colE+","+cond+"),\"\")");
  ws.getRange(4,6).setFormula("=IFERROR(FILTER("+colK+","+cond+"),\"\")");
  ws.getRange(4,7).setFormula("=IFERROR(FILTER("+colJ+","+cond+"),\"\")");
  ws.getRange(4,8).setFormula("=IFERROR(FILTER("+colP+","+cond+"),\"\")");
  var allRange=ws.getRange("A4:H600"), audRange=ws.getRange("H4:H600"), gameRange=ws.getRange("A4:A600");
  ws.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$D4="指導老師"').setBackground("#FFF8E1").setFontColor("#FF8F00").setRanges([allRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$D4="隊長"').setBackground("#FFFDE7").setRanges([allRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$D4="候補"').setBackground("#F3E5F5").setFontColor("#6A1B9A").setRanges([allRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($D4<>"指導老師",$D4<>"隊長",$D4<>"候補",ISODD(COUNTIF($C$4:$C4,$C4)))').setBackground("#EEF6FF").setRanges([allRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($D4<>"指導老師",$D4<>"隊長",$D4<>"候補",ISEVEN(COUNTIF($C$4:$C4,$C4)))').setBackground("#FFFFFF").setRanges([allRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo("審核通過 ✓").setBackground("#E8F5E9").setFontColor("#2E7D32").setRanges([audRange]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=$A4<>""').setBackground(cfg.hColor).setFontColor("#FFFFFF").setRanges([gameRange]).build(),
  ]);
  allRange.setFontFamily("微軟正黑體").setFontSize(9).setVerticalAlignment("middle")
    .setBorder(true,true,true,true,true,true,"#E0E0E0",SpreadsheetApp.BorderStyle.SOLID);
  ws.getRange("B4:C600").setHorizontalAlignment("left");
  ws.getRange("E4:E600").setHorizontalAlignment("left");
  ws.getRange("F4:F600").setHorizontalAlignment("left");
  ws.getRange("A4:A600").setHorizontalAlignment("center");
  ws.getRange("D4:D600").setHorizontalAlignment("center");
  ws.getRange("G4:G600").setHorizontalAlignment("center");
  ws.getRange("H4:H600").setHorizontalAlignment("center");
}

// ════════════════════════════════════════════════════════════════
//  重建賽區分配
// ════════════════════════════════════════════════════════════════
function 重建賽區分配() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var old = ss.getSheetByName("🏟 賽區分配");
  if (old) ss.deleteSheet(old);
  var ws = ss.insertSheet("🏟 賽區分配");
  ws.setTabColor("#37474F"); ws.setHiddenGridlines(true);
  var NAVY="#1A2744", GRN_MID="#2E7D32", GRN_LT="#E8F5E9", PUR_MID="#6A1B9A", PUR_LT="#F3E5F5", WHT="#FFFFFF";
  ws.setColumnWidth(1,40); ws.setColumnWidth(2,180); ws.setColumnWidth(3,160); ws.setColumnWidth(4,80);
  ws.setColumnWidth(5,20); ws.setColumnWidth(6,40); ws.setColumnWidth(7,180); ws.setColumnWidth(8,160); ws.setColumnWidth(9,80);
  ws.getRange(1,1,1,9).merge()
    .setValue("🏟  賽區分配 ── 審核通過的隊伍自動出現，填入位置編號即可")
    .setBackground(NAVY).setFontColor(WHT).setFontFamily("微軟正黑體").setFontSize(12).setFontWeight("bold")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  ws.setRowHeight(1,32);
  ws.getRange(1,5,200,1).setBackground(NAVY);
  ws.getRange(2,1,1,4).merge().setValue("⚔ 傳說對決").setBackground(GRN_MID).setFontColor(WHT)
    .setFontFamily("微軟正黑體").setFontSize(10).setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
  ws.setRowHeight(2,22);
  ws.getRange(3,1,1,4).setValues([["#","戰隊名稱","學校名稱","位置編號"]]).setBackground(GRN_MID).setFontColor(WHT)
    .setFontFamily("微軟正黑體").setFontSize(9).setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setBorder(true,true,true,true,true,true,WHT,SpreadsheetApp.BorderStyle.SOLID);
  ws.setRowHeight(3,26);
  ws.getRange(2,6,1,4).merge().setValue("🎯 特戰英豪").setBackground(PUR_MID).setFontColor(WHT)
    .setFontFamily("微軟正黑體").setFontSize(10).setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle");
  ws.getRange(3,6,1,4).setValues([["#","戰隊名稱","學校名稱","位置編號"]]).setBackground(PUR_MID).setFontColor(WHT)
    .setFontFamily("微軟正黑體").setFontSize(9).setFontWeight("bold").setHorizontalAlignment("center").setVerticalAlignment("middle")
    .setBorder(true,true,true,true,true,true,WHT,SpreadsheetApp.BorderStyle.SOLID);
  ws.setFrozenRows(3);
  function makeCond(det) {
    var colC=det+"!C4:C600", colD=det+"!D4:D600", colE=det+"!E4:E600", colP=det+"!P4:P600";
    return "("+colD+"=\"隊長\")*(COUNTIFS("+colC+","+colC+","+colD+",\"指導老師\","+colP+",\"審核通過 ✓\")>0)*(COUNTIFS("+colC+","+colC+","+colP+",\"資料有誤 ✗\")=0)*("+colE+"<>\"\")";
  }
  var lolDET="'⚔ 傳說_詳細資料'", lolCond=makeCond(lolDET), lolC=lolDET+"!C4:C600", lolB=lolDET+"!B4:B600";
  var valDET="'🎯 特戰_詳細資料'", valCond=makeCond(valDET), valC=valDET+"!C4:C600", valB=valDET+"!B4:B600";
  ws.getRange(4,2).setFormula("=IFERROR(FILTER("+lolC+","+lolCond+"),\"\")");
  ws.getRange(4,3).setFormula("=IFERROR(FILTER("+lolB+","+lolCond+"),\"\")");
  ws.getRange(4,1).setFormula("=IFERROR(ARRAYFORMULA(IF(B4:B200<>\"\",ROW(B4:B200)-ROW(B4)+1,\"\")),\"\")");
  ws.getRange(4,7).setFormula("=IFERROR(FILTER("+valC+","+valCond+"),\"\")");
  ws.getRange(4,8).setFormula("=IFERROR(FILTER("+valB+","+valCond+"),\"\")");
  ws.getRange(4,6).setFormula("=IFERROR(ARRAYFORMULA(IF(G4:G200<>\"\",ROW(G4:G200)-ROW(G4)+1,\"\")),\"\")");
  ws.getRange("A4:D200").setFontFamily("微軟正黑體").setFontSize(9).setVerticalAlignment("middle")
    .setBorder(true,true,true,true,true,true,"#CCCCCC",SpreadsheetApp.BorderStyle.SOLID);
  ws.getRange("A4:A200").setHorizontalAlignment("center").setFontColor("#9E9E9E");
  ws.getRange("B4:B200").setHorizontalAlignment("left"); ws.getRange("C4:C200").setHorizontalAlignment("left");
  ws.getRange("D4:D200").setHorizontalAlignment("center").setBackground("#FFFDE7");
  ws.getRange("F4:I200").setFontFamily("微軟正黑體").setFontSize(9).setVerticalAlignment("middle")
    .setBorder(true,true,true,true,true,true,"#CCCCCC",SpreadsheetApp.BorderStyle.SOLID);
  ws.getRange("F4:F200").setHorizontalAlignment("center").setFontColor("#9E9E9E");
  ws.getRange("G4:G200").setHorizontalAlignment("left"); ws.getRange("H4:H200").setHorizontalAlignment("left");
  ws.getRange("I4:I200").setHorizontalAlignment("center").setBackground("#FFFDE7");
  ws.setRowHeights(4,197,22);
  ws.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($B4<>"",ISODD(COUNTIF($B$4:$B4,$B4)))').setBackground(GRN_LT).setRanges([ws.getRange("A4:D200")]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied('=AND($G4<>"",ISODD(COUNTIF($G$4:$G4,$G4)))').setBackground(PUR_LT).setRanges([ws.getRange("F4:I200")]).build(),
  ]);
  try { SpreadsheetApp.getUi().alert("✅ 賽區分配重建完成\n請在「位置編號」欄手動填入每隊的位置編號。"); }
  catch(e) { Logger.log("✅ 賽區分配重建完成"); }
}

// ════════════════════════════════════════════════════════════════
//  寄信設定區
//  ← 修改這裡的設定來調整信件內容
// ════════════════════════════════════════════════════════════════
var EMAIL_CONFIG = {
  寄件人名稱: "YOUR_ORGANIZATION_NAME",           // ← 修改：寄件人顯示名稱
  寄件信箱:   "YOUR_EMAIL@gmail.com",             // ← 修改：寄件信箱（需重新授權才會生效）
  屆次:       "第六屆",                            // ← 修改：屆次（與 CONFIG 保持一致）
  年份:       "2026",                             // ← 修改：年份（與 CONFIG 保持一致）
  DC連結:     "YOUR_DISCORD_INVITE_URL",          // ← 修改：Discord 伺服器邀請連結
  表單連結:   "YOUR_GOOGLE_FORM_URL",             // ← 修改：Google 表單連結（重新報名用）
  Logo網址:   "YOUR_GOOGLE_DRIVE_LOGO_URL",       // ← 修改：Logo 圖片的 Google Drive 公開連結
                                                  //   圖片需設為「知道連結的人都可以檢視」
};

// ════════════════════════════════════════════════════════════════
//  1. 收到報名通知（onFormSubmit 自動觸發）
// ════════════════════════════════════════════════════════════════
function 寄送收到報名通知(email, teamName, capName, game) {
  if (!email) return;
  var subject = EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽-" + game + "-收到報名通知";
  var body =
    teamName + " " + capName + " 隊長您好！\n\n" +
    "我們是 " + EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽-" + game + " 的承辦單位。\n\n" +
    "目前已經收到 " + teamName + " 報名申請，我們會盡速審核隊伍的資料，完成後將盡速以 E-mail 通知您審核結果，敬請耐心等候，謝謝！\n\n" +
    EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽-" + game + " 承辦單位敬上";
  var htmlBody =
    "<div style='font-family:微軟正黑體,Arial,sans-serif;font-size:14px;color:#222;'>" +
    "<p><b>" + teamName + " " + capName + " 隊長您好！</b></p>" +
    "<p>我們是 <b>" + EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽-" + game + "</b> 的承辦單位。</p>" +
    "<p>目前已經收到 <b>" + teamName + "</b> 報名申請，我們會盡速審核隊伍的資料，完成後將盡速以 E-mail 通知您審核結果，敬請耐心等候，謝謝！</p>" +
    "<hr><p style='color:#666;font-size:12px;'>" + EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽-" + game + " 承辦單位敬上</p>" +
    "<p><img src='https://drive.google.com/thumbnail?id=YOUR_LOGO_FILE_ID&sz=w200' width='150'></p>" +
    // ↑ 修改 YOUR_LOGO_FILE_ID 為你的 Google Drive 圖片 ID
    // 圖片 ID 在 Drive 連結中：drive.google.com/file/d/【這裡是ID】/view
    "</div>";
  try {
    MailApp.sendEmail({ to:email, subject:subject, body:body, htmlBody:htmlBody, name:EMAIL_CONFIG.寄件人名稱 });
    Logger.log("✅ 收到報名通知已寄出：" + email + " / " + teamName);
  } catch(e) { Logger.log("❌ 寄信失敗：" + e + " / " + email); }
}

// ════════════════════════════════════════════════════════════════
//  2. 審核通過通知
// ════════════════════════════════════════════════════════════════
function 寄送通過信(email, teamName, capName, game) {
  var subject = EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽-" + game + "-審核通過通知";
  var htmlBody =
    "<div style='font-family:微軟正黑體,Arial,sans-serif;font-size:14px;color:#222;'>" +
    "<p><b>" + teamName + " " + capName + " 您好！</b></p>" +
    "<p><b>" + teamName + "</b> 報名申請 <b>" + EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽-" + game + "</b> 審核結果：<span style='color:green;font-weight:bold;'>通過</span></p>" +
    "<p>請依照以下步驟完成加入賽事 DC 群：</p><hr>" +
    "<p><b>1.</b> 下載 Discord<br>" +
    "連結：<a href='https://discord.com/download'>https://discord.com/download</a><br>" +
    "<img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://discord.com/download' width='150' height='150'></p>" +
    "<p><b>2.</b> 加入 Discord 伺服器<br>" +
    "連結：<a href='" + EMAIL_CONFIG.DC連結 + "'>" + EMAIL_CONFIG.DC連結 + "</a><br>" +
    "<img src='https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + EMAIL_CONFIG.DC連結 + "' width='150' height='150'></p>" +
    "<p><b>3.</b> 更改暱稱格式：（隊伍名稱）-姓名（例：哈哈隊-王大明）</p>" +
    "<p><b>4.</b> 隊長確認所有選手都已加入 Discord 伺服器</p>" +
    "<p><b>5.</b> 隊長在選手報到區輸入報到格式</p>" +
    "<hr><p>謝謝！</p>" +
    "<p style='color:#666;font-size:12px;'>" + EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽 承辦單位敬上</p>" +
    "<p><img src='https://drive.google.com/thumbnail?id=YOUR_LOGO_FILE_ID&sz=w200' width='150'></p>" +
    // ↑ 修改 YOUR_LOGO_FILE_ID
    "</div>";
  try {
    MailApp.sendEmail({ to:email, subject:subject, htmlBody:htmlBody, name:EMAIL_CONFIG.寄件人名稱 });
    Logger.log("✅ 審核通過通知已寄出：" + email + " / " + teamName);
  } catch(e) { Logger.log("❌ 寄信失敗：" + e + " / " + teamName); }
}

// ════════════════════════════════════════════════════════════════
//  3. 審核未通過通知
// ════════════════════════════════════════════════════════════════
function 寄送未通過信(email, teamName, capName, game, reason) {
  var subject = EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽-" + game + "-審核未成功通知";
  var htmlBody =
    "<div style='font-family:微軟正黑體,Arial,sans-serif;font-size:14px;color:#222;'>" +
    "<p><b>" + teamName + " " + capName + " 您好！</b></p>" +
    "<p><b>" + teamName + "</b> 報名申請 <b>" + EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽-" + game +
    "</b> 經審核結果：<span style='color:red;font-weight:bold;'>未通過</span>，未通過理由如下：<br>" +
    "<span style='color:red;'>" + reason + "</span></p><hr>" +
    "<p><b>1.</b> 請修正未通過理由的異常資料。</p>" +
    "<p><b>2.</b> 點擊以下連結重新報名<br>" +
    "連結：<a href='" + EMAIL_CONFIG.表單連結 + "'>" + EMAIL_CONFIG.表單連結 + "</a></p><hr>" +
    "<p>謝謝！</p>" +
    "<p style='color:#666;font-size:12px;'>" + EMAIL_CONFIG.年份 + "年" + EMAIL_CONFIG.屆次 + "高校盃電競錦標賽 承辦單位敬上</p>" +
    "<p><img src='https://drive.google.com/thumbnail?id=YOUR_LOGO_FILE_ID&sz=w200' width='150'></p>" +
    // ↑ 修改 YOUR_LOGO_FILE_ID
    "</div>";
  try {
    MailApp.sendEmail({ to:email, subject:subject, htmlBody:htmlBody, name:EMAIL_CONFIG.寄件人名稱 });
    Logger.log("✅ 審核未通過通知已寄出：" + email + " / " + teamName);
  } catch(e) { Logger.log("❌ 寄信失敗：" + e + " / " + teamName); }
}

// ════════════════════════════════════════════════════════════════
//  測試寄信（用最後一筆報名資料測試）
// ════════════════════════════════════════════════════════════════
function 測試寄信() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rSh = getFormResponseSheet(ss);
  if (!rSh || rSh.getLastRow() < 2) { Logger.log("找不到表單回應資料"); return; }
  var row = rSh.getRange(rSh.getLastRow(), 1, 1, rSh.getLastColumn()).getValues()[0];
  var email = String(row[F.email]), teamName = String(row[F.team_name]);
  var capName = String(row[F.cap_name]), game = String(row[F.game]);
  Logger.log("準備寄信給：" + email + " / " + teamName);
  寄送收到報名通知(email, teamName, capName, game);
}

// ════════════════════════════════════════════════════════════════
//  Line 群組通知設定
//  ← 修改這兩個變數來設定 Line 通知
// ════════════════════════════════════════════════════════════════
var LINE_TOKEN    = "YOUR_LINE_CHANNEL_ACCESS_TOKEN";
// ↑ 取得方式：https://developers.line.biz > 你的Channel > Messaging API > Channel access token > Issue

var LINE_GROUP_ID = "YOUR_LINE_GROUP_ID";
// ↑ 取得方式：
//   1. 把 Line Bot 加入你的群組
//   2. 在群組裡發一則訊息
//   3. 執行「查看群組ID」函式取得
//   4. 換群組時重複以上步驟

function 發送Line群組通知(message) {
  var url = "https://api.line.me/v2/bot/message/push";
  var payload = JSON.stringify({ to:LINE_GROUP_ID, messages:[{type:"text",text:message}] });
  UrlFetchApp.fetch(url, {
    method:"POST",
    headers:{"Authorization":"Bearer "+LINE_TOKEN, "Content-Type":"application/json"},
    payload:payload, muteHttpExceptions:true
  });
}

// ════════════════════════════════════════════════════════════════
//  每日報名統計通知（Line 群組）
//  設定觸發條件：日計時器 → 午夜（0點至1點）
// ════════════════════════════════════════════════════════════════
function 每日報名統計通知() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var today = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy/MM/dd");
  var lolToday=0, lolTotal=0, valToday=0, valTotal=0;
  ["⚔ 傳說_詳細資料","🎯 特戰_詳細資料"].forEach(function(sheetName){
    var ws = ss.getSheetByName(sheetName);
    if(!ws || ws.getLastRow()<4) return;
    var isLol = sheetName.indexOf("傳說")!==-1;
    var data = ws.getRange(4,1,ws.getLastRow()-3,23).getValues();
    for(var i=0;i<data.length;i++){
      if(String(data[i][3])!=="指導老師") continue;
      // 報名時間在第23欄（W欄，index=22）
      // ⚠ 如果 HEADERS 順序有改，這裡的 index 要跟著改
      if(isLol){ lolTotal++; if(String(data[i][22]).indexOf(today)!==-1) lolToday++; }
      else      { valTotal++; if(String(data[i][22]).indexOf(today)!==-1) valToday++; }
    }
  });
  var msg =
    "📊 高校盃每日報名統計\n統計時間：" + today + " 00:00\n\n" +
    "今日新增：\n⚔ 傳說對決：" + lolToday + " 隊\n🎯 特戰英豪：" + valToday + " 隊\n\n" +
    "累計總報名：\n⚔ 傳說對決：" + lolTotal + " 隊\n🎯 特戰英豪：" + valTotal + " 隊";
  發送Line群組通知(msg);
  Logger.log("✅ Line 群組通知已發送");
}

// ════════════════════════════════════════════════════════════════
//  取得 Line 群組 ID（換群組時使用）
//  使用方式：
//  1. 確認 doPost 函式存在（必要）
//  2. 把 Line Bot 加入新群組
//  3. 在群組裡發一則訊息
//  4. 執行此函式查看群組 ID
//  5. 把 ID 填到 LINE_GROUP_ID 變數
// ════════════════════════════════════════════════════════════════
function doPost(e) {
  try {
    var contents = e.postData.contents;
    PropertiesService.getScriptProperties().setProperty("LAST_WEBHOOK", contents);
    var data = JSON.parse(contents);
    var events = data.events;
    for (var i = 0; i < events.length; i++) {
      var source = events[i].source;
      if (source && source.groupId) {
        PropertiesService.getScriptProperties().setProperty("LINE_GROUP_ID", source.groupId);
      }
    }
  } catch(err) {
    PropertiesService.getScriptProperties().setProperty("WEBHOOK_ERROR", err.toString());
  }
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}

function 查看群組ID() {
  var props = PropertiesService.getScriptProperties();
  Logger.log("群組ID：" + props.getProperty("LINE_GROUP_ID"));
  Logger.log("最後收到：" + props.getProperty("LAST_WEBHOOK"));
}

// ════════════════════════════════════════════════════════════════
//  onEdit 自動觸發寄信
//  觸發條件：U欄（是否寄信通知）改成「已寄 ✓」時自動寄信
//  規則：
//    - 審核通過 ✓ → 寄審核通過信
//    - 資料有誤 ✗ + 已填未通過原因 → 寄未通過信
//    - 資料有誤 ✗ + 未填原因 → 自動改回「否」並提醒
// ════════════════════════════════════════════════════════════════
function onEdit(e) {
  var sheet = e.range.getSheet();
  var sheetName = sheet.getName();
  if (sheetName !== "⚔ 傳說_詳細資料" && sheetName !== "🎯 特戰_詳細資料") return;
  if (e.range.getColumn() !== 21) return;
  if (e.value !== "已寄 ✓") return;
  var row = e.range.getRow();
  if (row < 4) return;

  var game = sheetName.indexOf("傳說") !== -1 ? "傳說對決" : "特戰英豪";
  var allData = sheet.getRange(4, 1, sheet.getLastRow()-3, 23).getValues();
  var triggerIdx = row - 4;

  var teamStart = triggerIdx;
  while (teamStart > 0 && String(allData[teamStart][2]) === "") teamStart--;
  var teamEnd = triggerIdx;
  while (teamEnd < allData.length-1 && String(allData[teamEnd+1][2]) === "") teamEnd++;

  var coachEmail="", capName="", coachStatus="", hasError=false;
  var teamName = String(allData[teamStart][2]);

  for (var k = teamStart; k <= teamEnd; k++) {
    if (String(allData[k][3]) === "指導老師") coachStatus = String(allData[k][15]);
    if (String(allData[k][3]) === "隊長") { capName = String(allData[k][4]); coachEmail = String(allData[k][11]); }
    if (String(allData[k][15]) === "資料有誤 ✗") hasError = true;
  }

  var status = hasError ? "資料有誤 ✗" : coachStatus;
  if (!coachEmail || coachEmail === "" || coachEmail === "undefined") return;

  var data = sheet.getRange(row, 1, 1, 23).getValues()[0];
  var reason = String(data[21]);  // V欄：未通過原因（index=21）

  if (status === "審核通過 ✓") {
    寄送通過信(coachEmail, teamName, capName, game);
  } else if (status === "資料有誤 ✗") {
    if (!reason || reason === "" || reason === "undefined") {
      sheet.getRange(row, 21).setValue("否");
      return;
    }
    寄送未通過信(coachEmail, teamName, capName, game, reason);
  }
}
