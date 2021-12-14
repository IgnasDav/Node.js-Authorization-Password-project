"use strict";
const logoutButton = document.querySelector(".logout");

const isUserLoggedIn = () => {
  const token = localStorage.getItem("token");
  return Boolean(token);
};

const getUserInfo = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:3000/userInfo", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const status = response.status;
  const responseJSON = await response.json();

  if (status === 401) {
    return;
  } else {
    return responseJSON;
  }
};

const getAndDisplayUserInfo = async () => {
  const userInfo = await getUserInfo();
  if (userInfo) {
    displayUserInfo(userInfo);
  } else {
    logout();
  }
};

const displayUserInfo = (userInfo) => {
  const wrapperElement = document.querySelector(".userInfoWrapper");
  const emailElement = document.createElement("p");
  emailElement.innerText = "Email: " + userInfo.email;
  wrapperElement.append(emailElement);
};

const init = async () => {
  // ar useris prisijunges
  if (isUserLoggedIn()) {
    await getAndDisplayUserInfo();
    logoutButton.addEventListener("click", logout);
    document
      .querySelector(".showPosts")
      .addEventListener("click", changeToPosts);
  } else {
    location.replace("./login.html");
  }
};

const logout = () => {
  localStorage.removeItem("token");
  location.replace("./login.html");
};
const changeToPosts = () => {
  location.replace("./posts.html");
};
init();
