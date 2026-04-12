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

const register = () => {
  const userName = document.getElementById("reg-username");
  const fullName = document.getElementById("reg-name");
  const password = document.getElementById("reg-pass");
  const phone = document.getElementById("reg-phone");
  const email = document.getElementById("reg-mail");
  const role = document.getElementById("reg-role");
  const gender = document.getElementById("reg-gender");

  const registerBox = document.getElementById("register-box");
  const loginBox = document.getElementById("login-box");

  const regData = {
    name: fullName.value,
    username: userName.value,
    email: email.value,
    phone: phone.value,
    gender: gender.value,
    password: password.value,
    role: role.value,
  };

  const validate =
    fullName.value === "" ||
    userName.value === "" ||
    email.value === "" ||
    phone.value === "" ||
    password.value === "";

  if (validate) {
    for (let i = 0; i < 5; i++) {
      registerBox[i].style.borderColor = "red";
    }
    console.log("Đăng kí không hợp lệ!");
  } else {
    fetch(`http://localhost:3000/dangKi`, {
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


  }
};
