// ================================================================
//  表單生成.gs  ──  建立高校盃電競錦標賽 Google 報名表單
// ================================================================
//
//  ╔══════════════════════════════════════════════════════════════╗
//  ║  📌 使用前必讀                                               ║
//  ╠══════════════════════════════════════════════════════════════╣
//  ║                                                              ║
//  ║  【使用步驟】                                                 ║
//  ║  1. 確認 程式碼.gs 裡的 CONFIG 已填好屆次和年份               ║
//  ║  2. 修改本檔案的【可修改設定區】（賽事資訊、獎金等）           ║
//  ║  3. 執行「建立高校盃報名表單」函式                            ║
//  ║  4. 看執行記錄取得表單連結                                    ║
//  ║  5. 進入表單編輯頁，手動加入學生證上傳題目（共12題）           ║
//  ║  6. 把表單連結填到 程式碼.gs 的 EMAIL_CONFIG.表單連結         ║
//  ║                                                              ║
//  ╠══════════════════════════════════════════════════════════════╣
//  ║  📋 執行後需手動完成的事項                                    ║
//  ╠══════════════════════════════════════════════════════════════╣
//  ║                                                              ║
//  ║  執行後需進入表單編輯頁，在以下每個段落末尾手動加入            ║
//  ║  「檔案上傳」題目（Apps Script 不支援自動建立）：              ║
//  ║                                                              ║
//  ║  段落3 隊長末尾：                                            ║
//  ║    ➕ 隊長 學生證正面（必填，檔案上傳）                        ║
//  ║    ➕ 隊長 學生證反面（必填，檔案上傳）                        ║
//  ║                                                              ║
//  ║  段落4 隊員1末尾：                                           ║
//  ║    ➕ 隊員1 學生證正面（必填，檔案上傳）                       ║
//  ║    ➕ 隊員1 學生證反面（必填，檔案上傳）                       ║
//  ║                                                              ║
//  ║  段落5~7 隊員2~4（同上，各2題，必填）                        ║
//  ║                                                              ║
//  ║  段落8 候補末尾：                                            ║
//  ║    ➕ 候補 學生證正面（選填，檔案上傳）                        ║
//  ║    ➕ 候補 學生證反面（選填，檔案上傳）                        ║
//  ║                                                              ║
//  ║  共 12 題檔案上傳                                             ║
//  ║                                                              ║
//  ╠══════════════════════════════════════════════════════════════╣
//  ║  ⚙ 可修改設定區說明                                          ║
//  ╠══════════════════════════════════════════════════════════════╣
//  ║                                                              ║
//  ║  FORM_CONFIG 裡可修改：                                      ║
//  ║    規章連結 → 傳說對決和特戰英豪的規章連結                     ║
//  ║    獎金設定 → 各名次獎金金額                                  ║
//  ║    報名截止 → 報名截止日期                                     ║
//  ║    線上賽日期 → 線上賽日期區間                                 ║
//  ║    線下賽日期 → 線下賽日期                                     ║
//  ║    線下賽地點 → 線下賽地點                                     ║
//  ║    主辦單位等 → 主辦、指導、協辦、執行單位名稱                 ║
//  ║    候補必填 → true=必填 / false=選填                          ║
//  ║                                                              ║
//  ╚══════════════════════════════════════════════════════════════╝

// ── 可修改設定區 ──────────────────────────────────────────────────
var FORM_CONFIG = {
  // 規章連結（填好後會顯示在表單說明裡）
  lol規章連結: "（請填入傳說對決規章連結）",   // ← 修改
  val規章連結: "（請填入特戰英豪規章連結）",    // ← 修改

  // 獎金
  冠軍獎金: "3 萬",       // ← 修改
  亞軍獎金: "1 萬 5 千",  // ← 修改
  季軍獎金: "8 千",       // ← 修改
  殿軍獎金: "5 千",       // ← 修改

  // 賽事日程
  報名截止: "2026/10/13 23:59",          // ← 修改
  線上賽日期: "11/1（六）至 12/15（一）", // ← 修改
  線下賽日期: "12/19（五）",              // ← 修改
  線下賽地點: "華山文創園區（台北市中正區八德路一段1號）", // ← 修改

  // 主辦相關單位
  主辦單位: "中華民國電子競技運動協會",    // ← 修改
  指導單位: "運動部",                      // ← 修改
  協辦單位: "ROG 玩家共和國、Gamforce 電競嘉年華、欣亞數位", // ← 修改
  執行單位: "臺北城市科技大學 電腦與通訊工程系",             // ← 修改

  // 候補是否必填
  候補必填: false,  // ← true=必填 / false=選填
};

// ════════════════════════════════════════════════════════════════
//  建立報名表單
// ════════════════════════════════════════════════════════════════
function 建立高校盃報名表單() {

  // 表單標題用 程式碼.gs 裡的 CONFIG 設定
  var form = FormApp.create(CONFIG.年份 + "年" + CONFIG.屆次 + "高校盃電競錦標賽");

  // 表單說明
  form.setDescription(
    "【賽事項目 & 規章】\n" +
    "《傳說對決》規章連結：" + FORM_CONFIG.lol規章連結 + "\n" +
    "《特戰英豪》規章連結：" + FORM_CONFIG.val規章連結 + "\n" +
    "兩項目僅能選擇一報名，不得重複參賽。\n\n" +
    "【賽事獎金】\n" +
    "《傳說對決》：冠軍 " + FORM_CONFIG.冠軍獎金 +
    "、亞軍 " + FORM_CONFIG.亞軍獎金 +
    "、季軍 " + FORM_CONFIG.季軍獎金 +
    "、殿軍 " + FORM_CONFIG.殿軍獎金 + "\n" +
    "《特戰英豪》：冠軍 " + FORM_CONFIG.冠軍獎金 +
    "、亞軍 " + FORM_CONFIG.亞軍獎金 +
    "、季軍 " + FORM_CONFIG.季軍獎金 +
    "、殿軍 " + FORM_CONFIG.殿軍獎金 + "\n\n" +
    "【賽事日程】\n" +
    "報名截止：" + FORM_CONFIG.報名截止 + "\n" +
    "線上賽日期：" + FORM_CONFIG.線上賽日期 + "\n" +
    "線下賽日期：" + FORM_CONFIG.線下賽日期 + "\n" +
    "線下賽地點：" + FORM_CONFIG.線下賽地點 + "\n\n" +
    "【報名資格】\n" +
    "1. 參賽選手須為 114 學年度第一學期有註冊在學的高中職學生。\n" +
    "2. 年齡不得超過 19 歲，以 8/31 為基準。\n" +
    "3. 同一隊的成員必須皆來自同一所學校。\n\n" +
    "主辦單位：" + FORM_CONFIG.主辦單位 + "　指導單位：" + FORM_CONFIG.指導單位 + "\n" +
    "協辦單位：" + FORM_CONFIG.協辦單位 + "\n" +
    "執行單位：" + FORM_CONFIG.執行單位 + "\n\n" +
    "更多詳情請查看賽事規章\n或洽詢城市狂蜂幕後團隊 " + CONFIG.聯絡信箱
  );

  form.setCollectEmail(true);
  form.setAllowResponseEdits(false);

  // ── 第1段：基本資料 ──────────────────────────────────────────
  // 注意：這段沒有 PageBreak，是表單第一頁
  form.addMultipleChoiceItem()
    .setTitle("參賽項目")
    .setChoiceValues(["傳說對決", "特戰英豪"])
    .setRequired(true);

  form.addTextItem()
    .setTitle("學校名稱")
    .setHelpText("請填寫完整學校名稱，例：臺北市立中山高級中學")
    .setRequired(true);

  form.addTextItem()
    .setTitle("隊伍名稱")
    .setHelpText("請填寫隊伍名稱，不得與其他隊伍重複")
    .setRequired(true);

  // ── 第2段：指導老師 ──────────────────────────────────────────
  form.addPageBreakItem()
    .setTitle("隊伍指導老師／教練／領隊")
    .setHelpText("請填寫指導老師、教練或領隊姓名，請勿填寫隊長或隊員姓名");

  form.addTextItem()
    .setTitle("姓名")
    .setRequired(true);

  form.addTextItem()
    .setTitle("連絡電話")
    .setHelpText("請填寫可聯絡到的手機號碼")
    .setRequired(true);

  // ── 第3段：隊長 ──────────────────────────────────────────────
  form.addPageBreakItem()
    .setTitle("隊長")
    .setHelpText("隊長為隊伍代表人，所有聯絡事項以隊長 Email 為主");

  form.addTextItem().setTitle("姓名").setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("性別")
    .setChoiceValues(["男生", "女生"])
    .setRequired(true);

  form.addTextItem()
    .setTitle("身分證字號")
    .setHelpText("格式：1個英文字母 + 9個數字，例：A123456789")
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle("年級")
    .setChoiceValues(["一年級", "二年級", "三年級"])
    .setRequired(true);

  form.addTextItem()
    .setTitle("Line ID")
    .setHelpText("請填寫 LINE ID，方便賽事聯絡")
    .setRequired(true);

  form.addTextItem()
    .setTitle("連絡電話（手機）")
    .setHelpText("格式：09xxxxxxxx")
    .setRequired(true);

  form.addTextItem()
    .setTitle("收件地址")
    .setHelpText("如有贊助商獎品將統一寄送，填寫錯誤將視同放棄領獎")
    .setRequired(true);

  form.addTextItem()
    .setTitle("遊戲 ID（請填寫完整）")
    .setHelpText("請填寫遊戲內顯示的完整 ID")
    .setRequired(true);

  // ⚠ 執行後請手動在此段末尾加入：
  //   - 隊長 學生證正面（必填，檔案上傳）
  //   - 隊長 學生證反面（必填，檔案上傳）

  // ── 第4段：隊員1 ─────────────────────────────────────────────
  form.addPageBreakItem()
    .setTitle("隊員 1")
    .setHelpText("請確認隊員與隊長來自同一所學校");

  form.addTextItem().setTitle("姓名").setRequired(true);
  form.addMultipleChoiceItem().setTitle("性別").setChoiceValues(["男生", "女生"]).setRequired(true);
  form.addTextItem().setTitle("身分證字號").setHelpText("格式：1個英文字母 + 9個數字").setRequired(true);
  form.addMultipleChoiceItem().setTitle("年級").setChoiceValues(["一年級", "二年級", "三年級"]).setRequired(true);
  form.addTextItem().setTitle("連絡電話（手機）").setHelpText("格式：09xxxxxxxx").setRequired(true);
  form.addTextItem().setTitle("遊戲 ID（請填寫完整）").setRequired(true);
  // ⚠ 手動加：隊員1 學生證正面（必填）、隊員1 學生證反面（必填）

  // ── 第5段：隊員2 ─────────────────────────────────────────────
  form.addPageBreakItem().setTitle("隊員 2").setHelpText("請確認隊員與隊長來自同一所學校");
  form.addTextItem().setTitle("姓名").setRequired(true);
  form.addMultipleChoiceItem().setTitle("性別").setChoiceValues(["男生", "女生"]).setRequired(true);
  form.addTextItem().setTitle("身分證字號").setHelpText("格式：1個英文字母 + 9個數字").setRequired(true);
  form.addMultipleChoiceItem().setTitle("年級").setChoiceValues(["一年級", "二年級", "三年級"]).setRequired(true);
  form.addTextItem().setTitle("連絡電話（手機）").setHelpText("格式：09xxxxxxxx").setRequired(true);
  form.addTextItem().setTitle("遊戲 ID（請填寫完整）").setRequired(true);
  // ⚠ 手動加：隊員2 學生證正面（必填）、隊員2 學生證反面（必填）

  // ── 第6段：隊員3 ─────────────────────────────────────────────
  form.addPageBreakItem().setTitle("隊員 3").setHelpText("請確認隊員與隊長來自同一所學校");
  form.addTextItem().setTitle("姓名").setRequired(true);
  form.addMultipleChoiceItem().setTitle("性別").setChoiceValues(["男生", "女生"]).setRequired(true);
  form.addTextItem().setTitle("身分證字號").setHelpText("格式：1個英文字母 + 9個數字").setRequired(true);
  form.addMultipleChoiceItem().setTitle("年級").setChoiceValues(["一年級", "二年級", "三年級"]).setRequired(true);
  form.addTextItem().setTitle("連絡電話（手機）").setHelpText("格式：09xxxxxxxx").setRequired(true);
  form.addTextItem().setTitle("遊戲 ID（請填寫完整）").setRequired(true);
  // ⚠ 手動加：隊員3 學生證正面（必填）、隊員3 學生證反面（必填）

  // ── 第7段：隊員4 ─────────────────────────────────────────────
  form.addPageBreakItem().setTitle("隊員 4").setHelpText("請確認隊員與隊長來自同一所學校");
  form.addTextItem().setTitle("姓名").setRequired(true);
  form.addMultipleChoiceItem().setTitle("性別").setChoiceValues(["男生", "女生"]).setRequired(true);
  form.addTextItem().setTitle("身分證字號").setHelpText("格式：1個英文字母 + 9個數字").setRequired(true);
  form.addMultipleChoiceItem().setTitle("年級").setChoiceValues(["一年級", "二年級", "三年級"]).setRequired(true);
  form.addTextItem().setTitle("連絡電話（手機）").setHelpText("格式：09xxxxxxxx").setRequired(true);
  form.addTextItem().setTitle("遊戲 ID（請填寫完整）").setRequired(true);
  // ⚠ 手動加：隊員4 學生證正面（必填）、隊員4 學生證反面（必填）

  // ── 第8段：候補（選填）───────────────────────────────────────
  form.addPageBreakItem()
    .setTitle("候補")
    .setHelpText("候補為選填，若無候補請略過此頁");

  form.addTextItem().setTitle("姓名").setRequired(FORM_CONFIG.候補必填);
  form.addMultipleChoiceItem().setTitle("性別").setChoiceValues(["男生", "女生"]).setRequired(FORM_CONFIG.候補必填);
  form.addTextItem().setTitle("身分證字號").setHelpText("格式：1個英文字母 + 9個數字").setRequired(FORM_CONFIG.候補必填);
  form.addMultipleChoiceItem().setTitle("年級").setChoiceValues(["一年級", "二年級", "三年級"]).setRequired(FORM_CONFIG.候補必填);
  form.addTextItem().setTitle("連絡電話（手機）").setHelpText("格式：09xxxxxxxx").setRequired(FORM_CONFIG.候補必填);
  form.addTextItem().setTitle("遊戲 ID（請填寫完整）").setRequired(FORM_CONFIG.候補必填);
  // ⚠ 手動加：候補 學生證正面（選填）、候補 學生證反面（選填）

  // ── 連結到目前試算表 ──────────────────────────────────────────
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // ── 完成提示 ─────────────────────────────────────────────────
  var msg =
    "✅ 表單建立完成！\n\n" +
    "━━━ 表單連結 ━━━\n" +
    "【填寫網址（給選手用）】\n" + form.getPublishedUrl() + "\n\n" +
    "【編輯網址（管理用）】\n" + form.getEditUrl() + "\n\n" +
    "━━━ 接下來請做 ━━━\n" +
    "1. 進入表單編輯頁\n" +
    "2. 在以下段落末尾各加 2 題「檔案上傳」：\n" +
    "   - 段落3 隊長：學生證正面、反面（必填）\n" +
    "   - 段落4 隊員1：學生證正面、反面（必填）\n" +
    "   - 段落5 隊員2：學生證正面、反面（必填）\n" +
    "   - 段落6 隊員3：學生證正面、反面（必填）\n" +
    "   - 段落7 隊員4：學生證正面、反面（必填）\n" +
    "   - 段落8 候補：學生證正面、反面（選填）\n" +
    "   共 12 題\n\n" +
    "3. 把表單填寫網址填到 程式碼.gs 的 EMAIL_CONFIG.表單連結\n" +
    "4. 設定觸發條件：Apps Script > 時鐘圖示 > 新增 > onFormSubmit";

  Logger.log(msg);
  try {
    SpreadsheetApp.getUi().alert("表單建立完成", msg, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch(e) {}
}
