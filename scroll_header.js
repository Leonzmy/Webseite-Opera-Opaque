document.addEventListener("scroll", function() {
  const triggerHeight = window.innerHeight * 0.1; 
  if (window.scrollY > triggerHeight) {
    document.body.classList.add("scrolled");
  } else {
    document.body.classList.remove("scrolled");
  }
});
