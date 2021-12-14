"use strict";

const formElement = document.querySelector("form");
const submitButton = document.querySelector("button");

const loginRequest = async (email, password) => {
  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
};

const isUserLoggedIn = () => {
  const token = localStorage.getItem("token");
  return Boolean(token);
};

const submitButtonClickHandler = async (event) => {
  event.preventDefault();

  const formData = new FormData(formElement);
  const email = formData.get("email");
  const password = formData.get("password");

  const loginResult = await loginRequest(email, password);

  if (loginResult.success) {
    localStorage.setItem("token", loginResult.token);
    location.replace("./index.html");
  } else {
    alert(loginResult.error);
  }
};

const init = () => {
  if (isUserLoggedIn()) {
    location.replace("./index.html");
  } else {
    submitButton.addEventListener("click", submitButtonClickHandler);
  }
};

init();
