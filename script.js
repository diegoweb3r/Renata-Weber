const menuToggle = document.querySelector(".toggleMenu");
const menu = document.getElementById("menu");
const nav = document.getElementById("nav");


menuToggle.addEventListener("click", () => {
  menu.classList.toggle("active");
});
