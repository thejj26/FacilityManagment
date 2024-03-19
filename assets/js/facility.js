import db from './firebase.mjs'
import { doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'
//facility and firestore data
const facID = String(window.location).split("#")[1]
const facilityDocRef = doc(db, "facilities", facID)
const facDoc = await getDoc(facilityDocRef)
const facData = facDoc.data()
let earnings = facData.earnings
let expenses = facData.expenses
//facility info dom elements
const facName = document.querySelector("#facName")
const facLocation = document.querySelector("#facLocation")
const facType = document.querySelector("#facType")
const facRevenue = document.querySelector("#facRevenue")
//graph toggle elements
const togglePie = document.querySelector('a[href="#pieGraph"]')
const toggleLine = document.querySelector('a[href="#lineGraph"]')
//ex. adding elements
const ex_type = document.querySelector("#type_ex")
const ex_date = document.querySelector("#date_ex")
const ex_amount = document.querySelector("#amount_ex")
const ex_desc = document.querySelector("#description_ex")
const ex_btnClear = document.querySelector("#btnClear_ex")
const ex_btnAdd = document.querySelector("#btnAdd_ex")
//er. adding elements
const er_date = document.querySelector("#date_er")
const er_amount = document.querySelector("#amount_er")
const er_desc = document.querySelector("#description_er")
const er_btnClear = document.querySelector("#btnClear_er")
const er_btnAdd = document.querySelector("#btnAdd_er")
//list dom elements
const list_ex = document.querySelector("#expenses")
const list_er = document.querySelector("#earnings")
//graph control
//only allows one graph to be active at a time
togglePie.addEventListener("click", () => {
    if (!togglePie.classList.contains("active")) {  //if the button is not active
        togglePie.classList.add("active")   //receives active class
        if (toggleLine.classList.contains("active")) toggleLine.click() //if the other graph is active ig gets clicked, activating its listener
        toggleLine.classList.remove("active")   //removes the active class from the other button
    } else {
        togglePie.classList.remove("active")    //removes the active class
    }
})
toggleLine.addEventListener("click", () => {    //same thing but reversed for the other button
    if (!toggleLine.classList.contains("active")) {
        toggleLine.classList.add("active")
        if (togglePie.classList.contains("active")) togglePie.click()
        togglePie.classList.remove("active")
    } else {
        toggleLine.classList.remove("active")
    }
})
//clears the ex. info
ex_btnClear.addEventListener("click", () => {
    getDate()
    ex_type.value = 1
    ex_amount.value = 0
    ex_desc.value = ""
})
//clears the er. info
er_btnClear.addEventListener("click", () => {
    getDate()
    er_amount.value = 0
    er_desc.value = ""
})
//onclick listeners for adding earnings and expenses
er_btnAdd.addEventListener("click", addEarnings)
ex_btnAdd.addEventListener("click", addExpenses)
//loading fac data into the dom
try {
    facData.revenue = calculateRevenue(facData.expenses, facData.earnings)  //updates the revenue
    updateDoc(facilityDocRef, facData)  //updates the doc to update the revenue
    facName.innerHTML = facData.name
    facLocation.innerHTML = `<b>${facData.city}</b>, ${facData.address1}${facData.address2.length > 0 ? ", " + facData.address2 : ""}`
    facType.innerHTML = determineFacilityType(parseInt(facData.type))
    facRevenue.innerHTML = `Last month's revnue: <span>${facData.revenue}€</span>`
    loadEarnings()
    loadExpenses() 
} catch (e) {
    alert('Error loading facility data')
    console.error(e)
}

getDate()   //sets the current date in the date pickers
//loads the graphs
loadPieChart()
loadLineChart()

function determineFacilityType(num) {   //type (number) to a string
    switch (num) {
        case 1:
            return "Apartment"
            break
        case 2:
            return "House"
            break
    }
}

function getDate() {    //gets the current date and formats it
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`
    ex_date.value = formattedDate   //applies the date to the date pickers
    er_date.value = formattedDate
}

function calculateRevenue(expenses, earnings) { //calculates the revenue
    const currentDate = new Date().getTime()
    //filters out all of the data in the last 30 days
    earnings = earnings.filter(x => (currentDate - x.date) < 2592000000)
    expenses = [].concat(expenses.monthly, expenses.discrete, expenses.regular)
    expenses = expenses.filter(x => (currentDate - x.date) < 2592000000)
    //sums up all the data
    const sum_er = earnings.reduce((sum, current) => sum + current.amount, 0)
    const sum_ex = expenses.reduce((sum, current) => sum + current.amount, 0)
    return Math.round((sum_er - sum_ex)*100)/100    //calculates revenue
}

function loadEarnings() {    //loads all of the earnings using dom
    earnings.sort((a, b) => b.date - a.date)  //sorts the earnings
    earnings.forEach(er => {
        const markup = `
        <div class="container-er row">
            <div class="col-2 amount">${er.amount}€</div>
            <div class="col-3 date">${new Date(er.date).toLocaleDateString("en-GB")}</div>
            <div class="col-7 description">${er.description}</div>
        </div>
        `
        list_er.insertAdjacentHTML("beforeend", markup)
    })
}

function loadExpenses() {    //loads all of the expenses using dom
    let _expenses = expenses = [].concat(expenses.monthly, expenses.discrete, expenses.regular)
    _expenses.sort((a, b) => b.date - a.date)
    _expenses.forEach(ex => {
        const markup = `
        <div class="container-ex row">
            <div class="col-12 type">${ex.type == 1 ? "Monthly" : (ex.type == 2 ? "Discrete" : "Regular")}</div>
            <div class="col-2 amount">${ex.amount}€</div>
            <div class="col-3 date">${new Date(ex.date).toLocaleDateString("en-GB")}</div>
            <div class="col-7 description">${ex.description}</div>
        </div>
        `
        list_ex.insertAdjacentHTML("beforeend", markup)
    })
}

function addEarnings() {    //adds a new earning
    try {   //required values
        const currentDate = new Date().getTime()
        const date = new Date(er_date.value).getTime()
        const amount = Number(er_amount.value)
        const desc = er_desc.value
        if (currentDate < date) {   //checks if the date is in the past
            alert("Invalid date")
            return
        }
        if (isNaN(amount) || amount <= 0) { //checks for a positive/valid amount
            alert("Invalid amount")
            return
        }
        if (desc.length < 1) {  //chekcs for a description
            alert("Invalid description")
            return
        }
        const er_object = { //object that stores the data
            "date": date,
            "amount": Math.round(amount*100)/100,
            "description": desc
        }
        facData.earnings.push(er_object)    //appends the object to the other earnings, updates the facility data
        updateDoc(facilityDocRef, facData).then(() => { window.location.reload() }) //updating the firestore doc
    } catch (e) {
        alert("Error. Please try again.")
    }
}

function addExpenses() {    //adds a new expense
    try {   //almost the same function as before
        const currentDate = new Date().getTime()
        const date = new Date(ex_date.value).getTime()
        const amount = Number(ex_amount.value)
        const desc = ex_desc.value
        const type = Number(ex_type.value)
        if (currentDate < date) {
            alert("Invalid date")
            return
        }
        if (isNaN(amount) || amount <= 0) {
            alert("Invalid amount")
            return
        }
        if (desc.length < 1) {
            alert("Invalid description")
            return
        }
        const ex_object = {
            "date": date,
            "amount": Math.round(amount*100)/100,
            "description": desc,
            "type": type
        }
        switch (type) { //determines which field of the expenses object the expense will be appended to
            case 1:
                facData.expenses.monthly.push(ex_object)
                break
            case 2:
                facData.expenses.discrete.push(ex_object)
                break
            case 3:
                facData.expenses.regular.push(ex_object)
                break
        }
        updateDoc(facilityDocRef, facData).then(() => { window.location.reload() })
    } catch (e) {
        alert("Error. Please try again.")
    }
}
//loads the pie graph
async function loadPieChart() {
    const data = {
        labels: [
            'Red',
            'Blue',
            'Yellow'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
        }]
    };

    new Chart(
        document.getElementById('pieCanvas'),
        {
            type: 'doughnut',
            data: data
        }
    );
}
//loads the line graph
async function loadLineChart() {
    const labels = [1, 2, 3, 4, 5, 6, 7];
    const data = {
        labels: labels,
        datasets: [{
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    new Chart(
        document.getElementById('lineCanvas'),
        {
            type: 'line',
            data: data
        }
    );
}