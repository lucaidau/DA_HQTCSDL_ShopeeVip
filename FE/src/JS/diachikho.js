const initialWarehouses = [
  {
    id: 1,
    name: "Kho Hà Nội 1",
    contact: "Nguyễn Văn A",
    phone: "0912345678",
    detail: "Số 1, Ngõ 2, Đường Láng",
    province: "Hà Nội",
    isDefault: true,
  },
  {
    id: 2,
    name: "Kho TP.HCM 2",
    contact: "Lê Thị B",
    phone: "0987654321",
    detail: "123 Cách Mạng Tháng Tám",
    province: "TPHCM",
    isDefault: false,
  },
];

const warehouseTable = document.getElementById("warehouseTable");
const selectAllCheckbox = document.getElementById("selectAll");
const addAddressBtn = document.getElementById("addAddressBtn");
const cancelBtn = document.getElementById("cancelBtn");

const fields = {
  warehouseName: document.getElementById("warehouseName"),
  contactName: document.getElementById("contactName"),
  phone: document.getElementById("phone"),
  province: document.getElementById("province"),
  district: document.getElementById("district"),
  ward: document.getElementById("ward"),
  houseNumber: document.getElementById("houseNumber"),
  street: document.getElementById("street"),
  defaultWarehouse: document.getElementById("defaultWarehouse"),
};

let warehouses = [...initialWarehouses];

const renderWarehouseTable = () => {
  if (!warehouseTable) return;
  warehouseTable.innerHTML = warehouses
    .map(
      (warehouse) => `
      <tr>
        <td><input type="checkbox" class="row-checkbox" data-id="${warehouse.id}" /></td>
        <td>${warehouse.name}</td>
        <td>${warehouse.contact}</td>
        <td>${warehouse.phone}</td>
        <td>${warehouse.detail}</td>
        <td>${warehouse.province}</td>
        <td>${warehouse.isDefault ? '<span class="default-pill">Mặc định</span>' : ""}</td>
        <td>
          <div class="action-buttons">
            <button class="action-button edit" data-action="edit" data-id="${warehouse.id}">✎</button>
            <button class="action-button delete" data-action="delete" data-id="${warehouse.id}">🗑</button>
          </div>
        </td>
      </tr>
    `
    )
    .join("");

  const editButtons = document.querySelectorAll(".action-button.edit");
  const deleteButtons = document.querySelectorAll(".action-button.delete");

  editButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      loadWarehouseToForm(id);
    });
  });

  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      removeWarehouse(id);
    });
  });
};

const loadWarehouseToForm = (id) => {
  const warehouse = warehouses.find((item) => item.id === id);
  if (!warehouse) return;

  fields.warehouseName.value = warehouse.name;
  fields.contactName.value = warehouse.contact;
  fields.phone.value = warehouse.phone;
  fields.province.value = warehouse.province;
  fields.district.value = "";
  fields.ward.value = "";
  fields.houseNumber.value = "";
  fields.street.value = warehouse.detail;
  fields.defaultWarehouse.checked = warehouse.isDefault;
};

const removeWarehouse = (id) => {
  warehouses = warehouses.filter((item) => item.id !== id);
  renderWarehouseTable();
};

const clearForm = () => {
  fields.warehouseName.value = "";
  fields.contactName.value = "";
  fields.phone.value = "";
  fields.province.value = "";
  fields.district.value = "";
  fields.ward.value = "";
  fields.houseNumber.value = "";
  fields.street.value = "";
  fields.defaultWarehouse.checked = false;
};

const validateForm = () => {
  return (
    fields.warehouseName.value.trim() &&
    fields.contactName.value.trim() &&
    fields.phone.value.trim() &&
    fields.province.value &&
    fields.district.value &&
    fields.ward.value &&
    fields.houseNumber.value.trim() &&
    fields.street.value.trim()
  );
};

const handleAddAddress = () => {
  if (!validateForm()) {
    alert("Vui lòng điền đầy đủ thông tin địa chỉ.");
    return;
  }

  const newWarehouse = {
    id: Date.now(),
    name: fields.warehouseName.value.trim(),
    contact: fields.contactName.value.trim(),
    phone: fields.phone.value.trim(),
    detail: `${fields.houseNumber.value.trim()}, ${fields.street.value.trim()}, ${fields.ward.value}, ${fields.district.value}`,
    province: fields.province.value,
    isDefault: fields.defaultWarehouse.checked,
  };

  if (newWarehouse.isDefault) {
    warehouses = warehouses.map((item) => ({ ...item, isDefault: false }));
  }

  warehouses.push(newWarehouse);
  renderWarehouseTable();
  clearForm();
};

selectAllCheckbox?.addEventListener("change", (event) => {
  const checkboxes = document.querySelectorAll(".row-checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = event.target.checked;
  });
});

addAddressBtn?.addEventListener("click", handleAddAddress);

cancelBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  clearForm();
});

window.addEventListener("DOMContentLoaded", () => {
  renderWarehouseTable();
});
