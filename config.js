/* 韓國找路：共用金鑰（Link 同意於 2026-10-15 改為公開放在這裡，讓朋友打開網址就能用）
   - 兩把金鑰都會被任何打開網址的人看到；安全靠後台限制，不靠隱藏：
     Google：網站限制 https://onzala.github.io/* ＋ API 限制 ＋ 每日配額上限 ＋ 預算快訊
     Kakao：JavaScript SDK 도메인只登記 https://onzala.github.io
   - 換金鑰：改下面兩行 → commit → push。使用者重開 App 就會拿到新金鑰。
   - 留空字串＝不提供共用金鑰，使用者要在「設定」頁自己填。
   - 使用者在「設定」頁填了自己的金鑰時，以使用者的為準。 */
window.KROUTE_SHARED_KEYS = {
  google: 'AIzaSyDmstRNgwqoQj7MroiNXEMYnlDB97LoV2M',  // 貼上以 AIza 開頭的 Google 金鑰
  kakao: '8427566d759c9cdab614e8aa38af30a1'    // 貼上 Kakao「JavaScript 키」
};
