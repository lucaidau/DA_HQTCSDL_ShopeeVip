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

const getStoredUsers = () => JSON.parse(localStorage.getItem('users') || '[]');
const findStoredUser = (username) => getStoredUsers().find((u) => u.username === username);

const saveCurrentUser = (user) => {
  const safeUser = {
    name: user.name || user.username || user.userName || '',
    username: user.username || user.userName || '',
    email: user.email || '',
    phone: user.phone || '',
    gender: user.gender || '',
    role: String(user.role || 'user').trim(),
    IDShop: user.IDShop || null,
    password: user.password || ''
  };
  localStorage.setItem('user', JSON.stringify(safeUser));
  return safeUser;
};

const isSellerRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase();
  return normalized === '2' || normalized === 'seller' || normalized.includes('bán');
};

const getRedirectTarget = (user) => {
  if (!user) return 'home.html';
  if (isSellerRole(user.role) || user.IDShop) {
    return 'kenhbanhang.html';
  }
  return 'home.html';
};

const login = () => {
  const userName = document.getElementById("login-username").value.trim();
  const pass = document.getElementById("login-password").value.trim();

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
      const userData = data.user || loginData;
      const storedUser = findStoredUser(userData.username);
      const user = saveCurrentUser(storedUser || userData);
      window.location = getRedirectTarget(user);
    })
    .catch((err) => {
      console.log("Lỗi hệ thống: ", err);
      const users = getStoredUsers();
      const foundUser = users.find((u) => u.username === userName && u.password === pass);
      if (foundUser) {
        const user = saveCurrentUser(foundUser);
        window.location = getRedirectTarget(user);
      } else {
        usernameInput.style.borderColor = "red";
        passwordInput.style.borderColor = "red";
      }
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
        return res.json();
      })
      .then((data) => {
        console.log("Đăng kí thành công!", data);
        const users = getStoredUsers();
        users.push(regData);
        localStorage.setItem('users', JSON.stringify(users));
        const user = saveCurrentUser(regData);
        window.location = getRedirectTarget(user);
      })
      .catch((err) => {
        console.log("Lỗi Server!", err);
        const users = getStoredUsers();
        const existingUser = users.find((u) => u.username === regData.username);
        if (existingUser) {
          for (let i = 0; i < 5; i++) {
            registerBox[i].style.borderColor = "red";
          }
          return;
        }
        users.push(regData);
        localStorage.setItem('users', JSON.stringify(users));
        const user = saveCurrentUser(regData);
        window.location = getRedirectTarget(user);
      });


  }
};
