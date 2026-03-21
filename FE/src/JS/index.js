const toggleAuth = () => {
  const loginBox = document.getElementById("login-box");
  const registerBox = document.getElementById("register-box");
  let isLogin = loginBox.style.display !== "none";
  loginBox.style.display = isLogin ? "none" : "block";
  registerBox.style.display = isLogin ? "block" : "none";
};

const backToLogin = () => {
  const registerBox = document.getElementById("register-box");
  const loginBox = document.getElementById("login-box");

  try {
    register();
    registerBox.style.display = "none";
    loginBox.style.display = "block";
  } catch (error) {
    console.log("err: ", error);

    for (let i = 0; i < 5; i++) {
      registerBox[i].style.borderColor = "red";
    }
  }
};

const login = () => {
  const userName = document.getElementById("login-username").value;
  const pass = document.getElementById("login-password").value;

  const loginData = {
    username: userName,
    password: pass,
  };

  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");

  fetch(`${API_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  })
    .then((res) => {
      if (!res.ok) {
        usernameInput.style.borderColor = "red";
        passwordInput.style.borderColor = "red";
        throw new Error("Sai tài khoản hoặc mật khẩu");
      }
      return res.json();
    })
    .then((data) => {
      console.log("Đăng nhập thành công: ", data);
      localStorage.setItem("userID", data.user.IDTaiKhoan);
      window.location = "home.html";
    })
    .catch((err) => {
      console.log("Lỗi hệ thống: ", err);
    });
};

document.querySelector(".login-btn .btn-main").addEventListener("click", login);

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/dangKi' // URL khi bạn chạy máy nhà
    : 'https://sv-da-hqtcsdl-shopee-vip.vercel.app/'; // URL sau khi bạn deploy BE lên Vercel

const register = () => {


  const userName = document.getElementById("reg-username").value;
  const fullName = document.getElementById("reg-name").value;
  const password = document.getElementById("reg-pass").value;
  const phone = document.getElementById("reg-phone").value;
  const email = document.getElementById("reg-mail").value;
  const role = document.getElementById("reg-role").value;
  const gender = document.getElementById("reg-gender").value;

  const registerBox = document.getElementById("register-box");
  const loginBox = document.getElementById("login-box");

  const regData = {
    name: fullName,
    username: userName,
    email: email,
    phone: phone,
    gender: gender,
    password: password,
    role: role,
  };

  fetch(`${REG_API_URL}/dangKi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(regData),
  })
    .then((res) => {
      if (!res.ok) {
        for (let i = 0; i < 5; i++) {
          registerBox[i].style.borderColor = "red";
        }
        throw new Error("Tài khoản đã tồn tại!");
      }
      registerBox.style.display = "none";
      loginBox.style.display = "block";
      return res.json();
    })
    .then((data) => console.log("Đăng kí thành công!", data))
    .catch((err) => {
      console.log("Lỗi Server!", err);
    });
};
