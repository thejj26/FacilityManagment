const user = localStorage.getItem("userID") //fetches user id
const validUserNav = document.querySelectorAll(".user") //elements that are visible only to a logged in user
const invalidUserNav = document.querySelectorAll(".no-user")    //elements visible only to a guest user
if (!!user) {   //checks if user is logged in
    validUserNav.forEach(div => {   //displays all required elements
        div.classList.remove("d-none")
        div.classList.add("d-flex")
    })
    invalidUserNav.forEach(div=>{   //hides all elements that are not required
        div.classList.remove("d-flex")
        div.classList.add("d-none")
    })
}