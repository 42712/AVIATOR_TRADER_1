chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("keepAlive", { periodInMinutes: 1 });
  console.log("[BG] Extensao Sortenabet iniciada");
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive") {
    console.log("[BG] Alive");
  }
});

// Mantém o service worker ativo
setInterval(() => {
  fetch("https://aviator-trader.onrender.com/api/status").catch(() => {});
}, 4 * 60 * 1000);