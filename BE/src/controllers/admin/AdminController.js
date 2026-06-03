const { sql, adminPoolPromise, poolPromise } = require("../../config/connect");
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

const backUpFolder = "C:/Backup_ShopeeVip";

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
        TO DISK = 'C:/Backup_ShopeeVip/Full/ShopeeVipDB_AUTO_FULL_${ts}.bak' WITH INIT;
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
        TO DISK = 'C:/Backup_ShopeeVip/Diff/ShopeeVipDB_AUTO_DIFF_${ts}.bak' WITH DIFFERENTIAL, INIT;
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
        TO DISK = 'C:/Backup_ShopeeVip/Log/ShopeeVip_AUTO_LOG_${ts}.trn' WITH INIT;
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

  // [GET] /admin/thongke (Chưa xong)
  async layThongKe(req, res) {
    try {
      const pool = await adminPoolPromise;
      const result = await pool.request().execute("sp_Admin_LayThongKe");
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

  async fullBackup(req, res) {
    try {
      const pool = await adminPoolPromise;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      const targetPath = path.join(backUpFolder, "Full");
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      const filePath = path.join(
        targetPath,
        `ShopeeVip_MANUAL_FULL_${timestamp}.bak`,
      );

      const result = await pool
        .request()
        .query(`BACKUP DATABASE ShopeeVipDB TO DISK = '${filePath}' WITH INIT`);
      return res.status(200).json({
        success: true,
        message: `Tạo file FULL BACKUP thành công: ${filePath}`,
      });
    } catch (error) {
      console.log("Lỗi Full backup: ", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async diffBackup(req, res) {
    try {
      const pool = await adminPoolPromise;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      const targetPath = path.join(backUpFolder, "Diff");
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      const filePath = path.join(
        targetPath,
        `ShopeeVip_MANUAL_DIFF_${timestamp}.bak`,
      );
      const result = await pool
        .request()
        .query(
          `BACKUP DATABASE ShopeeVipDB TO DISK = '${filePath}' WITH DIFFERENTIAL, INIT`,
        );
      return res.status(200).json({
        success: true,
        message: `Tạo file DIFF BACKUP thành công: ${filePath}`,
      });
    } catch (error) {
      console.log("Lỗi Diff backup: ", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async logBackup(req, res) {
    try {
      const pool = await adminPoolPromise;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      const targetPath = path.join(backUpFolder, "Log");
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      const filePath = path.join(
        targetPath,
        `ShopeeVip_MANUAL_LOG_${timestamp}.trn`,
      );
      const result = await pool
        .request()
        .query(`BACKUP LOG ShopeeVipDB TO DISK = '${filePath}' WITH INIT`);
      return res.status(200).json({
        success: true,
        message: `Trích xuất TRANSACTION LOG thành công: ${filePath}`,
      });
    } catch (error) {
      console.log("Lỗi Log backup: ", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async phucHoi(req, res) {
    try {
      const pool = await poolPromise;

      const fullPath = path.join(backUpFolder, "Full");
      const diffPath = path.join(backUpFolder, "Diff");
      const logPath = path.join(backUpFolder, "Log");

      const getLatestFile = (folderPath, ex) => {
        if (!fs.existsSync(folderPath)) return;
        const files = fs
          .readdirSync(folderPath)
          .filter((file) => file.toLowerCase().endsWith(ex))
          .map((file) => ({
            name: file,
            path: path.join(folderPath, file).replace(/\\/g, "/"),
            time: fs.statSync(path.join(folderPath, file)).mtime.getTime(),
          }));

        if (files.length === 0) return null;
        files.sort((a, b) => b.time - a.time);
        return files[0];
      };

      const latestFull = getLatestFile(fullPath, ".bak");
      if (!latestFull)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy file FULL BACKUP" });

      const latestDiff = getLatestFile(diffPath, ".bak");
      const logStartTime = latestDiff ? latestDiff.time : latestFull.time;

      let logFiles = [];
      if (fs.existsSync(logPath)) {
        logFiles = fs
          .readdirSync(logPath)
          .filter((file) => file.toLowerCase().endsWith(".trn"))
          .map((file) => ({
            name: file,
            path: path.join(logPath, file).replace(/\\/g, "/"),
            time: fs.statSync(path.join(logPath, file)).mtime.getTime(),
          }))
          .filter((file) => file.time > logStartTime)
          .sort((a, b) => a.time - b.time);
      }

      console.log("[Auto Restore] Đang backup Tail-Log Backup...");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const tailLogFilePath = path
        .join(logPath, `ShopeeVip_TailLog_${timestamp}.trn`)
        .replace(/\\/g, "/");

      const tailLogQuery = `
        USE master;
        BACKUP LOG ShopeeVipDB TO DISK = '${tailLogFilePath}' WITH NORECOVERY, NO_TRUNCATE, INIT;`;

      let hasTailLog = false;
      try {
        await pool.request().query(tailLogQuery);
        hasTailLog = true;
      } catch (error) {
        console.log("Warning: Không thể tạo file Tail-Log");
      }

      const restoreChain = [];
      restoreChain.push(latestFull.path);
      if (latestDiff) restoreChain.push(latestDiff.path);
      logFiles.forEach((log) => restoreChain.push(log.path));
      if (fs.existsSync(tailLogFilePath)) restoreChain.push(tailLogFilePath);

      console.log(`[Auto Restore] Chuỗi file tự động tìm được: `, restoreChain);
      console.log("[Auto Restore] Đang ngắt kết nối máy chủ để phục hồi!!");

      if (!hasTailLog) {
        console.log(
          "[Auto Restore] Backup Tail-Log thất bại, ngắt kết nối Database bằng SINGLE_USER",
        );

        try {
          await pool.request().query(`
      USE master;
      ALTER DATABASE ShopeeVipDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    `);
        } catch (error) {
          console.log(
            "Bỏ qua lỗi SINGLE_USER nếu kết nối bị kẹt: ",
            error.message,
          );
        }
      }

      for (let i = 0; i < restoreChain.length; i++) {
        const filePath = restoreChain[i];
        const isLast = i === restoreChain.length - 1;
        const recoveryOption = isLast ? "RECOVERY" : "NORECOVERY";

        let sqlQuery = "";
        if (filePath.toLocaleLowerCase().endsWith(".bak")) {
          const replaceOption = i === 0 ? ", REPLACE" : "";
          sqlQuery = `RESTORE DATABASE ShopeeVipDB FROM DISK = '${filePath}' WITH ${recoveryOption}${replaceOption}`;
        } else if (filePath.toLocaleLowerCase().endsWith(".trn")) {
          sqlQuery = `RESTORE LOG ShopeeVipDB FROM DISK = '${filePath}' WITH ${recoveryOption}`;
        }

        console.log(
          `[Auto Restore] [Bước ${i + 1}/${restoreChain.length}] Thực thi: ${sqlQuery}`,
        );
        await pool.request().query(sqlQuery);
      }
      await pool.request().query("ALTER DATABASE ShopeeVipDB SET MULTI_USER;");
      return res.status(200).json({
        success: true,
        message: "Phục hồi thành công!!",
        details: restoreChain,
      });
    } catch (error) {
      console.log("Lỗi phục hổi: ", error);

      try {
        const pool = await poolPromise;
        pool
          .request()
          .query("USE master; ALTER DATABASE ShopeeVipDB SET MULTI_USER");
      } catch (error) {
        console.log("Không thể mở database: ", error.message);
      }
      return res
        .status(500)
        .json({ success: false, message: "Lỗi Server: " + error.message });
    }
  }
}

module.exports = new AdminController();
