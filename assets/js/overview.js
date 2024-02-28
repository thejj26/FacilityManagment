document.querySelectorAll(".logout").forEach(el => {
    el.addEventListener("click", () => {
        localStorage.removeItem("userID")
        window.location.replace("../../index.html")
    })
})
