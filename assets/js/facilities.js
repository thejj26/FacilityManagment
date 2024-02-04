sessionStorage.removeItem("getStartedCached")   //removes the cached redirection to this site if it exists

document.querySelectorAll(".logout").forEach(el=>{  //log out buttons
    el.addEventListener("click",()=>{
        localStorage.removeItem("userID")   //removes current user id
        window.location="../../index.html"
    })
})