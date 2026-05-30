const { sql, adminPoolPromise } = require("../../config/connect");
const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const configPath = path.join(
  __dirname,
  "..",
  "..",
  "config",
  "backupConfig.json",
);

function docCauHinh() {
  try {
    if (fs.existsSync(configPath)) {
      const rawData = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(rawData);
    }
  } catch (error) {
    console.log("Không thể đọc dữ liệu từ file cấu hình: ", error);
  }
  return {
    enabled: true,
    fullTime: "00:00",
    diffIntervalHours: 6,
    logIntervalMinutes: 30,
  };
}

let autoBackupConfig = {
  ...docCauHinh(),
  fullJobInstance: null,
  diffJobInstance: null,
  logJobInstance: null,
};

function capNhatLichTrinhGiaoViec() {
  if (autoBackupConfig.fullJobInstance) {
    autoBackupConfig.fullJobInstance.stop();
    autoBackupConfig.fullJobInstance = null;
  }
  if (autoBackupConfig.diffJobInstance) {
    autoBackupConfig.diffJobInstance.stop();
    autoBackupConfig.diffJobInstance = null;
  }
  if (autoBackupConfig.logJobInstance) {
    autoBackupConfig.logJobInstance.stop();
    autoBackupConfig.logJobInstance = null;
  }

  if (!autoBackupConfig.enabled) {
    console.log("[Node-Cron] Toàn bộ lịch trình đã tắt");
    return;
  }

  const backUpFolder = "C:\Users\Lucaidau\Learning\DoAn\Ki4\HQT_CSDL\Backup";
  if (!fs.existsSync(backUpFolder))
    fs.mkdirSync(backUpFolder, { recursive: true });

  const [fHours, fMinutes] = autoBackupConfig.fullTime.split(":");
  const fullExpression = `${fMinutes} ${fHours} * * *`;

  autoBackupConfig.fullJobInstance = cron.schedule(fullExpression, async () => {
    console.log("[Automated Full] Bắt đầu tiến trình sao lưu toàn vẹn...");
    try {
      const pool = await adminPoolPromise;
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      await pool.request().query(`
        BACKUP DATABASE ShopeeVipDB
        TO DISK = 'C:\Users\Lucaidau\Learning\DoAn\Ki4\HQT_CSDL\Backup\Full\ShopeeVipDB_AUTO_FULL_${ts}.bak' WITH INIT;
      `);
      console.log("[Automated Full] Sao lưu thành công.");
    } catch (err) {
      console.error("Lỗi Auto Full:", err.message);
    }
  });

  const diffExpression = `0 */${autoBackupConfig.diffIntervalHours} * * *`;

  autoBackupConfig.diffJobInstance = cron.schedule(diffExpression, async () => {
    console.log("[Automated Diff] Bắt đầu sao lưu phần thay đổi...");
    try {
      const pool = await adminPoolPromise;
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      await pool.request().query(`
        BACKUP DATABASE ShopeeVipDB
        TO DISK = 'C:\Users\Lucaidau\Learning\DoAn\Ki4\HQT_CSDL\Backup\Diff\ShopeeVipDB_AUTO_DIFF_${ts}.bak' WITH DIFFERENTIAL, INIT;
      `);
      console.log("[Automated Diff] Sao lưu thành công.");
    } catch (err) {
      console.error("Lỗi Auto Diff:", err.message);
    }
  });

  const logExpression = `*/${autoBackupConfig.logIntervalMinutes} * * * *`;

  autoBackupConfig.logJobInstance = cron.schedule(logExpression, async () => {
    console.log("[Automated Log] Đang trích xuất nhật ký giao dịch ngầm...");
    try {
      const pool = await adminPoolPromise;
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      await pool.request().query(`
        BACKUP LOG ShopeeVipDB
        TO DISK = 'C:\Users\Lucaidau\Learning\DoAn\Ki4\HQT_CSDL\Backup\Log\ShopeeVip_AUTO_LOG_${ts}.trn' WITH INIT;
      `);
      console.log("[Automated Log] Trích xuất nhật ký giao dịch thành công.");
    } catch (err) {
      console.error("Lỗi Auto Log:", err.message);
    }
  });

  console.log(
    `[Node-Cron Agent] Thiết lập ma trận thành công! Full: ${autoBackupConfig.fullTime} hằng ngày | Diff: Mỗi ${autoBackupConfig.diffIntervalHours}h | Log: Mỗi ${autoBackupConfig.logIntervalMinutes} phút.`,
  );
}

capNhatLichTrinhGiaoViec();

class AdminController {
  // [GET] /admin
  async layTaiKhoan(req, res) {
    try {
      const pool = await adminPoolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM dbo.fn_Admin_LayTaiKhoan()");

      return res
        .status(200)
        .json({ success: true, danhsachTK: result.recordset });
    } catch (error) {
      console.log("Lỗi: ", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  //[PATCH] /admin/suataikhoan
  async suaTaiKhoan(req, res) {
    try {
      const { idAccount, userName, name, email, phone } = req.body;
      const pool = await adminPoolPromise;
      const result = await pool
        .request()
        .input("IDTaiKhoan", sql.Int, idAccount)
        .input("userName", sql.VarChar(50), userName)
        .input("name", sql.NVarChar(50), name)
        .input("email", sql.VarChar(255), email)
        .input("phone", sql.VarChar(10), phone)
        .execute("sp_Admin_SuaTaiKhoan");

      return res.status(200).json({ success: true, message: result.recordset });
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  //[PATCH] /admin/khoataikhoan/:id
  async khoaTaiKhoan(req, res) {
    try {
      const { id } = req.params;

      const pool = await adminPoolPromise;
      const result = await pool
        .request()
        .input("IDTaiKhoan", sql.Int, id)
        .execute("sp_Admin_KhoaTaiKhoan");

      const status = result.recordset[0];
      if (status.Success === 1) {
        return res.status(200).json({ success: true, message: status.Message });
      } else {
        return res
          .status(400)
          .json({ success: false, message: status.Message });
      }
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  //[GET] /admin/sanpham
  async laySanPham(req, res) {
    try {
      const pool = await adminPoolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM dbo.fn_Admin_LaySanPham()");

      return res.status(200).json({
        success: true,
        message: "Lấy sản phẩm thành công",
        danhSachSP: result.recordset,
      });
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  //[PATCH] /admin/khoasanpham/:id
  async khoaSanPham(req, res) {
    try {
      const { id } = req.params;
      const pool = await adminPoolPromise;
      const result = await pool
        .request()
        .input("IDBanSao", sql.Int, id)
        .execute("sp_Admin_KhoaSanPham");

      const status = result.recordset[0];
      if (status.Success) {
        return res.status(200).json({ success: true, message: status.Message });
      } else {
        return res
          .status(400)
          .json({ success: false, message: status.Message });
      }
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  // [GET] /admin/thongke
  async layThongKe(req, res) {
    try {
      const pool = await adminPoolPromise;
      const result = await pool.request();
    } catch (error) {
      console.log("Lỗi server: ", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi server: " + error.message });
    }
  }

  //[POST] /admin/saoluu/cauhinhtudong
  async cauHinhTuDong(req, res) {
    try {
      const { enabled, fullTime, diffTime, logTime } = req.body;

      if (!fullTime || !diffTime || !logTime)
        return res
          .status(400)
          .json({ success: false, message: "Khung giờ không hợp lệ" });

      autoBackupConfig.enabled = enabled;
      autoBackupConfig.fullTime = fullTime;
      autoBackupConfig.diffIntervalHours = diffTime;
      autoBackupConfig.logIntervalMinutes = logTime;

      fs.writeFileSync(
        configPath,
        JSON.stringify(
          {
            enabled: autoBackupConfig.enabled,
            fullTime: autoBackupConfig.fullTime,
            diffIntervalHours: autoBackupConfig.diffIntervalHours,
            logIntervalMinutes: autoBackupConfig.logIntervalMinutes,
          },
          null,
          2,
        ),
        "utf-8",
      );

      capNhatLichTrinhGiaoViec();

      return res.status(200).json({
        success: true,
        message: enabled
          ? `Hệ thống đã bật đặt lịch ma trận: Full lúc ${fullTime}, Diff mỗi ${diffTime} tiếng, Log mỗi ${logTime} phút.`
          : "Đã tắt toàn bộ lịch trình sao lưu tự động.",
      });
    } catch (error) {
      console.error("Lỗi sao lưu: ", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async fullBackup(req, res) {}

  async diffBackup(req, res) {}

  async logBackup(req, res) {}

  async phucHoi(req, res) {}
}

module.exports = new AdminController();
