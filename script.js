const menuToggle = document.querySelector(".toggleMenu");
const menu = document.getElementById("menu");

menuToggle.addEventListener("click", () => {
  menu.classList.toggle("active");
});
