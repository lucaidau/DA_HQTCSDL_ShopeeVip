const showOnShopCheckbox = document.getElementById("showOnShop");
const defaultSortSelect = document.getElementById("defaultSort");
const showSkuCheckbox = document.getElementById("showSku");
const showVideoPriceCheckbox = document.getElementById("showVideoPrice");
const manageWholesaleBtn = document.getElementById("manageWholesaleBtn");
const showGiftIconCheckbox = document.getElementById("showGiftIcon");
const stockThresholdInput = document.getElementById("stockThreshold");
const manageStockBtn = document.getElementById("manageStockBtn");
const manageAttributesBtn = document.getElementById("manageAttributesBtn");
const allowBuyerAddVariantCheckbox = document.getElementById("allowBuyerAddVariant");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const messageBox = document.getElementById("messageBox");

const SETTINGS_KEY = "caidatsanpham_settings";

const defaultSettings = {
  showOnShop: true,
  defaultSort: "Phổ biến",
  showSku: false,
  showVideoPrice: false,
  showGiftIcon: false,
  stockThreshold: 5,
  allowBuyerAddVariant: false,
};

const loadSettings = () => {
  const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
  return savedSettings ? { ...defaultSettings, ...savedSettings } : defaultSettings;
};

const applySettings = (settings) => {
  showOnShopCheckbox.checked = settings.showOnShop;
  defaultSortSelect.value = settings.defaultSort;
  showSkuCheckbox.checked = settings.showSku;
  showVideoPriceCheckbox.checked = settings.showVideoPrice;
  showGiftIconCheckbox.checked = settings.showGiftIcon;
  stockThresholdInput.value = settings.stockThreshold;
  allowBuyerAddVariantCheckbox.checked = settings.allowBuyerAddVariant;
};

const getSettingsFromForm = () => ({
  showOnShop: showOnShopCheckbox.checked,
  defaultSort: defaultSortSelect.value,
  showSku: showSkuCheckbox.checked,
  showVideoPrice: showVideoPriceCheckbox.checked,
  showGiftIcon: showGiftIconCheckbox.checked,
  stockThreshold: Number(stockThresholdInput.value) || 0,
  allowBuyerAddVariant: allowBuyerAddVariantCheckbox.checked,
});

const saveSettings = () => {
  const settings = getSettingsFromForm();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  messageBox.textContent = "Lưu cài đặt thành công.";
  messageBox.style.color = "#007d75";
  setTimeout(() => {
    messageBox.textContent = "";
  }, 2500);
};

const resetSettings = () => {
  window.location.href = "tatcasanpham.html";
};

saveBtn?.addEventListener("click", saveSettings);
cancelBtn?.addEventListener("click", resetSettings);
manageWholesaleBtn?.addEventListener("click", () => {
  alert("Chức năng quản lý giá sỉ sẽ được mở sau.");
});
manageStockBtn?.addEventListener("click", () => {
  alert("Chức năng quản lý lịch sử tồn kho sẽ được mở sau.");
});
manageAttributesBtn?.addEventListener("click", () => {
  alert("Chức năng quản lý thuộc tính sẽ được mở sau.");
});

window.addEventListener("DOMContentLoaded", () => {
  applySettings(loadSettings());
});