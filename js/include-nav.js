function setActiveLink() {
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".site-nav__links a");

  links.forEach((link) => {
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("is-active");
    }
  });
}

fetch("partials/nav.html")
  .then((response) => response.text())
  .then((html) => {
    document.getElementById("nav-placeholder").innerHTML = html;
    setActiveLink();
    window.dispatchEvent(new Event("navLoaded"));
  })
  .catch((error) => {
    console.error("Failed to load nav:", error);
  });
