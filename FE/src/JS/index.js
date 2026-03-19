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

  registerBox.style.display = "none";
  loginBox.style.display = "block";
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
  fetch("http://localhost:3000", {
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
      return (res.data);
    })
    .then((data) => {
      console.log("Đăng nhập thành công: ", data);
      window.location = "home.html"
    })
    .catch((err) => {
      console.log("Lỗi hệ thống: ", err);
    });
};

document.querySelector(".login-btn .btn-main").addEventListener("click", login);
