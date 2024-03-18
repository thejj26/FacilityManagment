import db from './firebase.mjs'
import { collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'

const facilitiesCollection = collection(db, "facilities")

const facilityList = document.querySelector("#facilityList")

const facName = document.querySelector("#inputFacName")
const facType = document.querySelector("#selectType")
const facCity = document.querySelector("#inputFacCity")
const facAdd1 = document.querySelector("#inputFacAdd1")
const facAdd2 = document.querySelector("#inputFacAdd2")

let revenue;

document.querySelector("#btnClear").addEventListener("click", () => {  //reverts data to the default (unchanged) state
    facName.value = ""
    facType.value = 1
    facCity.value = ""
    facAdd1.value = ""
    facAdd2.value = ""
})
sessionStorage.removeItem("getStartedCached")
document.querySelector("#btnAdd").addEventListener("click", addNewFacility)

document.querySelectorAll(".logout").forEach(el => {    //logout functionality
    el.addEventListener("click", () => {
        localStorage.removeItem("userID")
        window.location.replace("../../index.html")
    })
})

let facilities = []

fetchFacilities(localStorage.getItem("userID")).then(() => {  //fetches user's facilities when the site loads
    if (facilities.length > 0) {    //checks if there are any facilities and removes the after element if so
        facilityList.classList.add("hide-after")
    } else {
        facilityList.classList.remove("hide-after")
    }
})

async function fetchFacilities(userID) {    //fetches facilities that belong to the current user
    const facilitiesQuery = query(facilitiesCollection, //query that checks for the facility owner
        where("owner", "==", userID)
    )
    const queryResult = await getDocs(facilitiesQuery)  //gets coresponding docs
    queryResult.forEach(doc => {
        facilities.push(doc)
        addFacilityCard(doc)//adds docs to the html
    })
}

function calculateRevenue(expenses, earnings){

}

function generateFacilityCard(facility) {   //generates a html element with all the needed info from the facility
    return `
   <div class="facility row">
        <div class="info row col-11" id="fac-${facility.id}">
            <div class="col-2 icon">
                <span class="material-symbols-outlined">
                    home
                </span>
            </div>
            <div class="col-4">
                <p class="name">${facility.data().name}</p>
            </div>
            <div class="col-4">
                <p class="address">${facility.data().city}, ${facility.data().address1}</p>
            </div>
            <div class="col-2 revenue">
                <p class="revenue">${calculateRevenue(facility.data().expenses, facility.data().earnings)}€</p>
            </div>
        </div>
        <div class="manage d-flex flex-column col-1">
            <div class="edit d-flex" id="edit-${facility.id}">
                <span class="material-symbols-outlined">
                    edit
                </span>
                <p>Edit</p>
            </div>
            <div class="delete d-flex" id="delete-${facility.id}">
                <span class="material-symbols-outlined">
                    delete
                </span>
                <p>Delete</p>
            </div>
        </div>
</div>
   `
}

function addFacilityCard(facility) {    //adds the generated cards to the site and adds event listeners where needed
    facilityList.insertAdjacentHTML("beforeend", generateFacilityCard(facility))
    document.querySelector(`#edit-${facility.id}`).addEventListener("click", () => {
        editFacility(facility)  //editing the specific facility
    })
    document.querySelector(`#delete-${facility.id}`).addEventListener("click", () => {
        deleteFacility(facility.id) //deleting the specific facility
    })
    document.querySelector(`#fac-${facility.id}`).addEventListener("click", () => {
        window.location = `../../facility.html#${facility.id}`    //redirecting the user on click
    })
}

function deleteFacility(id) {   //facility deletion
    const userResponse = confirm("Are you sure you want to delete this facility? This action cannot be undone.")
    if (!userResponse) return   //if user has  canceled
    deleteDoc(doc(db, "facilities", id)).then(() => {   //user has agreed -> attepmting deletion
        window.location.reload()    //realoading to refresh the data
    }).catch(() => {
        alert("Error deleting facility, try again or refresh the page.")    //error
    })
}

function editFacility(facility) {   //facility edit
    document.querySelector("#hidden").click()   //opening of the modal
    //needed DOM elements
    const e_facName = document.querySelector("#editFacName")
    const e_facType = document.querySelector("#editType")
    const e_facCity = document.querySelector("#editFacCity")
    const e_facAdd1 = document.querySelector("#editFacAdd1")
    const e_facAdd2 = document.querySelector("#editFacAdd2")

    document.querySelector("#btnRevert").addEventListener("click", () => {  //reverts data to the default (unchanged) state
        e_facName.value = facility.data().name
        e_facType.value = facility.data().type
        e_facCity.value = facility.data().city
        e_facAdd1.value = facility.data().address1
        e_facAdd2.value = facility.data().address2
    })
    document.querySelector("#btnRevert").click()    //lodaing data
    document.querySelector("#facName").innerHTML = facility.data().name //facility name at the top
    //attepting to save the data and update the facility doc
    document.querySelector("#btnSave").addEventListener("click", () => {
        switch (true) { //checks if the entred data is valid
            case (e_facName.value.trim().length < 1): //no name
                alert("Enter facility name")
                break
            case (e_facCity.value.trim().length < 1): //no city
                alert("Alert city/town")
                break
            case (e_facAdd1.value.trim().length < 1): //no address
                alert("Enter address")
                break
            default:    //data is valid
                const facilityObject = {    //object used to update the doc
                    name: e_facName.value.trim(),
                    type: e_facType.value,
                    city: e_facCity.value.trim(),
                    address1: e_facAdd1.value.trim(),
                    address2: e_facAdd2.value.trim() ?? "",
                    revenue: revenue,
                    owner: facility.data().owner,
                    expenses: facility.data().expenses,
                    earnings: facility.data().earnings
                }
                const facilityDocRef = doc(db, "facilities", facility.id)    //document reference to the current facility+

                updateDoc(facilityDocRef, facilityObject).then(() => {    //updating the doc
                    window.location.reload()
                }).catch(() => alert("Error updating information, try again or refresh the page."))
        }
    })
}

function addNewFacility() { //adds a new facility to the collection
    switch (true) { //checks if the entred data is valid
        case (facName.value.trim().length < 1): //no name
            alert("Enter facility name")
            break
        case (facCity.value.trim().length < 1): //no city
            alert("Alert city/town")
            break
        case (facAdd1.value.trim().length < 1): //no address
            alert("Enter address")
            break
        default:
            const newFacility = doc(facilitiesCollection)   //new doc
            const facilityObject = {    //object with the needed data
                name: facName.value.trim(),
                type: facType.value,
                city: facCity.value.trim(),
                address1: facAdd1.value.trim(),
                address2: facAdd2.value.trim() ?? "",
                revenue: 0, //default
                owner: localStorage.getItem("userID"),
                expenses: { //troskovi
                    "monthly": [], //mjesecni
                    "discrete": [],    //vanredni
                    "regular": []  //stalni (reguralni)
                },
                earnings: []
            }
            setDoc(newFacility, facilityObject).then(() => window.location.reload())
                .catch(() => { alert("Error adding facility, try again or refresh the page.") })
    }
}
// TODO:
// -responsive