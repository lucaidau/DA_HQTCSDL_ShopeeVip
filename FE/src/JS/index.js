const toggleAuth = () => {
  const loginBox = document.getElementById("login-box");
  const registerBox = document.getElementById("register-box");
  let isLogin = loginBox.style.display !== "none";
  loginBox.style.display = isLogin ? "none" : "block";
  registerBox.style.display = isLogin ? "block" : "none";
};
