const user = localStorage.getItem("userID") //fetches user id
const validUserNav = document.querySelectorAll(".user") //elements that are visible only to a logged in user
const invalidUserNav = document.querySelectorAll(".no-user")    //elements visible only to a guest user
const btnGetStarted = document.querySelector("#getStarted")

if (!!user) {   //checks if user is logged in
    validUserNav.forEach(div => {   //displays all required elements
        div.classList.remove("d-none")
        div.classList.add("d-flex")
    })
    invalidUserNav.forEach(div => {   //hides all elements that are not required
        div.classList.remove("d-flex")
        div.classList.add("d-none")
    })
}

document.querySelectorAll(".logout").forEach(el => {  //log out buttons
    el.addEventListener("click", () => {
        localStorage.removeItem("userID")   //removes current user id
        location.reload()
    })
})

btnGetStarted.addEventListener("click", () => {
    if (!!localStorage.getItem("userID")) window.location = "../../facilities.html"   //if user is logged in
    else {
        window.location = "../../login.html"
        sessionStorage.setItem("getStartedCached", "true")
    }
})