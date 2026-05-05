// [Xử lí UI]
const toggleAuth = () => {
  const loginBox = document.getElementById("login-box");
  const registerBox = document.getElementById("register-box");
  let isLogin = loginBox.style.display !== "none";
  loginBox.style.display = isLogin ? "none" : "block";
  registerBox.style.display = isLogin ? "block" : "none";
};

// [Xử lí Logic]
// [POST] Đăng kí
const registerMethod = async (e) => {
  e.preventDefault();
  const userName = document.getElementById("reg-username");
  const fullName = document.getElementById("reg-name");
  const password = document.getElementById("reg-pass");
  const phone = document.getElementById("reg-phone");
  const email = document.getElementById("reg-mail");
  const role = document.getElementById("reg-role");
  const gender = document.getElementById("reg-gender");

  const registerBox = document.getElementById("register-box");
  const loginBox = document.getElementById("login-box");

  const inputs = [userName, fullName, password, phone, email];
  inputs.forEach((input) => (input.style.borderColor = ""));

  const validate = inputs.some((input) => input.value.trim() === "");

  if (validate) {
    inputs.forEach((input) => {
      if (input.value.trim() === "") input.style.borderColor = "red";
    });
    throw new Error("Đăng kí không hợp lệ!");
    return;
  }
  const regData = {
    name: fullName.value,
    username: userName.value,
    email: email.value,
    phone: phone.value,
    gender: gender.value,
    password: password.value,
    role: role.value,
  };

  try {
    const res = await fetch(`http://localhost:3000/dangKi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(regData),
    });
    const data = await res.json();
    if (!res.ok) {
      inputs.forEach((input) => (input.style.borderColor = "red"));

      throw new Error(data.message || "Đăng kí thất bại!");
    }

    console.log("Đăng kí thành công!", data);
    registerBox.style.display = "none";
    loginBox.style.display = "block";
  } catch (error) {
    console.log("Lỗi Server!", error);
  }
};

document.getElementById("btn-reg").addEventListener("click", registerMethod);

const loginMethod = async () => {
  try {
    const userName = document.getElementById("login-username");
    const pass = document.getElementById("login-password");

    const loginData = {
      username: userName.value,
      password: pass.value,
    };

    const res = await fetch("http://localhost:3000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!res.ok) {
      userName.style.borderColor = "red";
      pass.style.borderColor = "red";
      throw new Error("Sai tài khoản hoặc mật khẩu");
    }

    const data = await res.json();
    console.log("Đăng nhập thành công: ", data);
    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user.IDShop === null) window.location = "User/home.html";
    else window.location = "Shop/TestShop.html";
  } catch (error) {
    console.log("Lỗi hệ thống: ", error);
  }
};

document.getElementById("btn-login").addEventListener("click", loginMethod);
