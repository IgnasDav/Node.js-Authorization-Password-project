"use strict";

const isUserLoggedIn = () => {
  const token = localStorage.getItem("token");
  return Boolean(token);
};
const showUserPosts = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/posts/user", {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  const status = await response.status;
  const JSON = response.json();
  if (status === 401) {
    return;
  } else {
    return JSON;
  }
};
const getPosts = async () => {
  const response = await fetch("http://localhost:3000/posts");
  const responseJSON = await response.json();
  return responseJSON;
};
const displayPosts = (posts, showDeleteBtn) => {
  posts.forEach((post) => {
    //Creating elements
    const cardId = post._id;
    const card = document.createElement("div");
    const cardBody = document.createElement("p");
    const cardTitle = document.createElement("h2");
    const cardEmail = document.createElement("p");

    //Adding classes
    card.classList.add("main__card");
    //adding text content
    cardBody.textContent = post.body;
    cardTitle.textContent = post.title;
    cardEmail.textContent = post.email;

    //Inserting into html
    card.append(cardTitle, cardEmail, cardBody);
    document.querySelector(".main").append(card);
    console.log(showDeleteBtn);
    if (showDeleteBtn) {
      showDeleteBtn.forEach((entry) => {
        if (entry._id === post._id) {
          const deleteBtn = document.createElement("p");
          deleteBtn._id = entry._id;
          deleteBtn.innerHTML = `<i class="fas fa-trash"></i>`;
          card.append(deleteBtn);
          deleteBtn.addEventListener("click", async () => {
            document.querySelector("main").innerHTML = null;
            await deletePost(deleteBtn._id);
            checkItemState(post, cardId);
            await getAndDisplayPosts();
          });
        }
      });
    }
  });
};
const checkItemState = async (post, cardId) => {
  if (post._id !== cardId) {
    await getAndDisplayPosts();
  }
};
const deletePost = async (id) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`http://localhost:3000/posts/${id}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });
  const responseJSON = await response.json();
  return responseJSON;
};

const getAndDisplayPosts = async () => {
  const posts = await getPosts();
  const userPosts = await showUserPosts();
  if (posts) {
    displayPosts(posts, userPosts);
  } else {
    logout();
  }
};
const init = async () => {
  if (isUserLoggedIn()) {
    await getAndDisplayPosts();
    document.querySelector(".logout").addEventListener("click", logout);
  } else {
    location.replace("./login.html");
  }
};
function logout() {
  localStorage.removeItem("token");
  location.replace("./login.html");
}
init();
function createModalWindow() {
  //creating elements
  const modal = document.createElement("div");
  const modalWindow = document.createElement("div");
  const modalWindowHeading = document.createElement("h2");
  const modalWindowExitBtn = document.createElement("p");
  const modalWindowForm = document.createElement("form");
  const modalWindowFormTitle = document.createElement("div");
  const modalWindowFormTitleInput = document.createElement("input");
  const modalWindowFormTitleLabel = document.createElement("label");
  const modalWindowFormDescription = document.createElement("div");
  const modalWindowFormDescriptionInput = document.createElement("input");
  const modalWindowFormDescriptionLabel = document.createElement("label");
  const modalWindowFormSubmitBtn = document.createElement("button");
  //Adding classes
  modal.classList.add("modal");
  modalWindow.classList.add("modal__window");
  modalWindowHeading.classList.add("modal__window__heading");
  modalWindowForm.classList.add("modal__window__form");
  modalWindowFormTitle.classList.add("modal__window__form__title");
  modalWindowFormTitleInput.classList.add("modal__window__form__title__input");
  modalWindowFormTitleLabel.classList.add("modal__window__form__title__label");
  modalWindowFormDescription.classList.add("modal__window__form__description");
  modalWindowFormSubmitBtn.classList.add("modal__window__form__submit");
  modalWindowFormDescriptionInput.classList.add(
    "modal__window__form__description__input"
  );
  modalWindowExitBtn.classList.add("modal__window__exitBtn");
  modalWindowFormDescriptionLabel.classList.add(
    "modal__window__form__description__label"
  );
  //Adding text content
  modalWindowHeading.textContent = "Form";
  modalWindowExitBtn.innerHTML = `<i class="fas fa-times"></i>`;
  modalWindowFormTitleLabel.textContent = "Title:";
  modalWindowFormSubmitBtn.textContent = "Submit";
  modalWindowFormDescriptionLabel.textContent = "Description:";
  modalWindowFormTitleInput.type = "text";
  modalWindowFormDescriptionInput.type = "text";
  //Inserting into html
  modal.append(modalWindow);
  modalWindow.append(modalWindowHeading, modalWindowExitBtn, modalWindowForm);
  modalWindowForm.append(
    modalWindowFormTitle,
    modalWindowFormDescription,
    modalWindowFormSubmitBtn
  );
  modalWindowFormDescription.append(
    modalWindowFormDescriptionLabel,
    modalWindowFormDescriptionInput
  );
  modalWindowFormTitle.append(
    modalWindowFormTitleLabel,
    modalWindowFormTitleInput
  );
  document.querySelector(".main").append(modal);
  modalWindowExitBtn.addEventListener("click", () => {
    modal.remove();
  });
  modalWindowFormSubmitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const body = modalWindowFormDescriptionInput.value;
    const title = modalWindowFormTitleInput.value;
    await addPost({ title, body });
    document.querySelector(".main").textContent = null;
    getAndDisplayPosts();
  });

  return;
}
document
  .querySelector(".createPost")
  .addEventListener("click", createModalWindow);

const addPost = async (post) => {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/posts", {
    method: "POST",
    body: JSON.stringify(post),
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });
  const json = await response.json();
  return json;
};
