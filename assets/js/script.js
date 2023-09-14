const getBooks = () => JSON.parse(localStorage.getItem("books")) || [];
const setBooks = (b) => localStorage.setItem("books", JSON.stringify(b));

const allBooksBtn = document.getElementById("allBooksBtn");
const notCompletedBtn = document.getElementById("notCompletedBtn");
const completedBtn = document.getElementById("completedBtn");
const completedBooksWrapper = document.getElementById("completedBooksWrapper");
const uncompletedBooksListWrapper = document.getElementById("uncompletedBooksWrapper");

const main = document.getElementById("main");
const completedBooksList = document.getElementById("completedBooksList");
const uncompletedBooksList = document.getElementById("uncompletedBooksList");
const bookModal = document.getElementById("bookModal");
const searchInput = document.getElementById("searchInput");

const addBookButtons = document.querySelectorAll(".add-btn");
const bookForm = bookModal.querySelector("#bookForm");

document.addEventListener("DOMContentLoaded", () => {
  renderBooksFromLocalStorage();
});

allBooksBtn.addEventListener("click", toggleSideItems);

notCompletedBtn.addEventListener("click", toggleSideItems);

completedBtn.addEventListener("click", toggleSideItems);

searchInput.addEventListener("input", (e) => {
  if (e.target.value == "") {
    renderBooksFromLocalStorage();
  } else {
    renderBooksFromSearch(e.target.value);
  }
});

main.addEventListener("click", (e) => {
  const books = getBooks();
  if (e.target.classList.contains("edit-btn")) {
    const bookId = e.target.closest("article").id;
    const idx = books.findIndex((b) => b.id === Number(bookId));

    showModal("edit", false, books[idx]);
  } else if (e.target.classList.contains("delete-btn")) {
    const bookId = e.target.closest("article").id;

    setBooks(books.filter((b) => b.id !== Number(bookId)));
    renderBooksFromLocalStorage();
  }
});

completedBooksList.addEventListener("click", (e) => {
  if (e.target.classList.contains("unread-btn")) {
    const books = getBooks();
    const bookId = e.target.closest("article").id;
    const idx = books.findIndex((b) => Number(b.id) === Number(bookId));
    books[idx].isComplete = false;

    setBooks(books);
    renderBooksFromLocalStorage();
  }
});

uncompletedBooksList.addEventListener("click", (e) => {
  if (e.target.classList.contains("read-btn")) {
    const books = getBooks();
    const bookId = e.target.closest("article").id;
    const idx = books.findIndex((b) => Number(b.id) === Number(bookId));
    books[idx].isComplete = true;

    setBooks(books);
    renderBooksFromLocalStorage();
  }
});

addBookButtons.forEach((b) => {
  b.addEventListener("click", (e) => {
    if (e.target.dataset.completed === "true") {
      showModal("create", true);
    } else {
      showModal("create", false);
    }
  });
});

bookForm.addEventListener("reset", (e) => {
  bookModal.classList.add("hidden");
  bookModal.classList.remove("grid");
});

bookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = bookForm.elements["type"].value;
  const books = getBooks();
  const book = {};

  book.id = Number(bookForm.elements["id"].value) || "";
  book.title = bookForm.elements["title"].value;
  book.author = bookForm.elements["author"].value;
  book.year = bookForm.elements["year"].value;
  book.isComplete = bookForm.elements["completed"].checked;

  if (type === "create") {
    book.id = +new Date();
    books.push(book);
  } else if (type === "edit") {
    const idx = books.findIndex((b) => b.id === Number(book.id));
    books[idx] = book;
  }

  setBooks(books);
  renderBooksFromLocalStorage();
  bookForm.reset();
});

function toggleSideItems(e) {
  switch (e.target.id) {
    case "allBooksBtn":
      allBooksBtn.children[1].classList.remove("-translate-x-[125%]");
      notCompletedBtn.children[1].classList.add("-translate-x-[125%]");
      completedBtn.children[1].classList.add("-translate-x-[125%]");

      completedBooksWrapper.classList.remove("hidden");
      uncompletedBooksListWrapper.classList.remove("hidden");
      break;
    case "notCompletedBtn":
      allBooksBtn.children[1].classList.add("-translate-x-[125%]");
      notCompletedBtn.children[1].classList.remove("-translate-x-[125%]");
      completedBtn.children[1].classList.add("-translate-x-[125%]");

      completedBooksWrapper.classList.add("hidden");
      uncompletedBooksListWrapper.classList.remove("hidden");
      break;
    case "completedBtn":
      allBooksBtn.children[1].classList.add("-translate-x-[125%]");
      notCompletedBtn.children[1].classList.add("-translate-x-[125%]");
      completedBtn.children[1].classList.remove("-translate-x-[125%]");

      completedBooksWrapper.classList.remove("hidden");
      uncompletedBooksListWrapper.classList.add("hidden");
      break;
  }
}

function showModal(type, completed, book) {
  bookForm.reset();
  bookForm.elements["type"].value = type;
  bookForm.elements["completed"].checked = completed;

  if (type === "create") {
    bookModal.querySelector("#modalHeader").innerText = "Create Book";

    bookForm.elements["id"].value = "";
  } else if (type === "edit" && book.id) {
    bookModal.querySelector("#modalHeader").innerText = "Edit Book";

    bookForm.elements["id"].value = book.id;
    bookForm.elements["title"].value = book.title;
    bookForm.elements["author"].value = book.author;
    bookForm.elements["year"].value = book.year;
    bookForm.elements["completed"].checked = book.isComplete;
  }

  bookModal.classList.remove("hidden");
  bookModal.classList.add("grid");
}

function renderBooksFromLocalStorage() {
  completedBooksList.replaceChildren(completedBooksList.lastElementChild);
  uncompletedBooksList.replaceChildren(uncompletedBooksList.lastElementChild);
  searchInput.value = "";

  getBooks()?.forEach((b) => {
    const el = constructBookElement(b);
    if (b.isComplete) {
      completedBooksList.insertBefore(el, completedBooksList.querySelector(".add-btn"));
    } else {
      uncompletedBooksList.insertBefore(el, uncompletedBooksList.querySelector(".add-btn"));
    }
  });
}

function renderBooksFromSearch(input) {
  completedBooksList.replaceChildren(completedBooksList.lastElementChild);
  uncompletedBooksList.replaceChildren(uncompletedBooksList.lastElementChild);

  getBooks()
    ?.filter(
      (b) =>
        b.title.toLowerCase().includes(input.toLowerCase()) ||
        b.author.toLowerCase().includes(input.toLowerCase())
    )
    .forEach((b) => {
      const el = constructBookElement(b);
      if (b.isComplete) {
        completedBooksList.insertBefore(el, completedBooksList.querySelector(".add-btn"));
      } else {
        uncompletedBooksList.insertBefore(el, uncompletedBooksList.querySelector(".add-btn"));
      }
    });
}

function constructBookElement(b) {
  const article = document.createElement("article");
  article.id = b.id;
  article.className =
    "book-entry group relative w-full h-20 bg-zinc-700 text-white rounded-lg flex justify-between items-center overflow-hidden";
  article.innerHTML = `
  <div class="z-10 flex flex-col p-5">
    <span
      class="text-purple-400 group-hover:text-white font-semibold transition-all duration-200 ease-out"
      >${b.title}</span
    >
    <span class="text-sm">${b.author} - ${b.year}</span>
  </div>
  <div
    class="z-20 translate-x-full group-hover:translate-x-0 flex h-full transition-all duration-300 ease-in-out"
  >${
    b.isComplete
      ? `
  <button
      class="unread-btn bg-zinc-500 hover:bg-zinc-600 text-white h-full px-3 transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="bi bi-book w-6 pointer-events-none"
        viewBox="0 0 16 16"
      >
        <path
          d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"
        />
      </svg>
    </button>
  `
      : `
  <button
    class="read-btn bg-green-600 hover:bg-green-700 text-white h-full px-3 transition-all duration-200"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      class="bi bi-book-fill w-6 pointer-events-none"
      viewBox="0 0 16 16"
    >
      <path
        d="M8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"
      />
    </svg>
  </button>
  `
  }
    
    <button
      class="edit-btn bg-yellow-500 hover:bg-yellow-600 text-white h-full px-3 transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="bi bi-pencil-fill w-6 pointer-events-none"
        viewBox="0 0 16 16"
      >
        <path
          d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"
        />
      </svg>
    </button>
    <button
      class="delete-btn bg-red-600 hover:bg-red-700 text-white h-full px-3 transition-all duration-200"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="bi bi-trash3-fill w-6 pointer-events-none"
        viewBox="0 0 16 16"
      >
        <path
          d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"
        />
      </svg>
    </button>
  </div>
  <div
    class="absolute z-0 inset-0 w-full scale-125 bg-gradient-to-bl from-purple-500 to-purple-950 translate-x-full transition-all duration-300 ease-out group-hover:translate-x-0"
  ></div>
  `;
  return article;
}
