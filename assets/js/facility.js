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
//graph elements
const c_pie1 = document.querySelector("#pieCanvas1")
const c_pie2 = document.querySelector("#pieCanvas2")
const c_line = document.querySelector("#lineCanvas")
const date_pie = [document.querySelector("#date1_pie"), document.querySelector("#date2_pie")]
const months_line = [document.querySelector("#date1_line"), document.querySelector("#date2_line")]
const apply_pie = document.querySelector("#apply_pie")
const apply_line = document.querySelector("#apply_line")
const chartPie1 = new Chart(
    c_pie1,
    {
        type: 'doughnut',
        data: {}
    }
)
const chartPie2 = new Chart(
    c_pie2,
    {
        type: 'doughnut',
        data: {}
    }
)

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
apply_pie.addEventListener("click", loadPieCharts)
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
loadPieCharts()
//loadLineChart()

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

    const today_old = new Date(new Date().getTime() - 8035200000) //approx 3 monhts ago
    const year_old = today_old.getFullYear()
    const month_old = String(today_old.getMonth() + 1).padStart(2, '0')
    const formattedDate_month = `${year}-${month}`
    const formattedDate_month_old = `${year_old}-${month_old}`

    ex_date.value = formattedDate   //applies the date to the date pickers
    er_date.value = formattedDate
    date_pie[0].value = formattedDate
    date_pie[1].value = formattedDate
    months_line[0].value = formattedDate_month
    months_line[1].value = formattedDate_month_old
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
    return Math.round((sum_er - sum_ex) * 100) / 100    //calculates revenue
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
    let _expenses = [].concat(expenses.monthly, expenses.discrete, expenses.regular)
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
            "amount": Math.round(amount * 100) / 100,
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
            "amount": Math.round(amount * 100) / 100,
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
async function loadPieCharts() {
    const date_1 = new Date(date_pie[0].value).getTime()
    const date_2 = new Date(date_pie[1].value).getTime()

    const ex_monhtly = expenses.monthly.filter(x => (x.date <= date_1 && x.date >= date_2))
    const ex_discrete = expenses.discrete.filter(x => (x.date <= date_1 && x.date >= date_2))
    const ex_regular = expenses.regular.filter(x => (x.date <= date_1 && x.date >= date_2))
    const er_all = earnings.filter(x => (x.date <= date_1 && x.date >= date_2))

    const sum_monthly = ex_monhtly.reduce((sum, x) => sum + x.amount, 0)
    const sum_discrete = ex_discrete.reduce((sum, x) => sum + x.amount, 0)
    const sum_regular = ex_regular.reduce((sum, x) => sum + x.amount, 0)
    const sum_expenses = sum_monthly + sum_discrete + sum_regular
    const sum_earnings = er_all.reduce((sum, x) => sum + x.amount, 0)

    const data_1 = {
        labels: [
            'Monthly',
            'Discrete',
            'Regular'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [sum_monthly, sum_discrete, sum_regular],
            backgroundColor: [
                '#CD6155',
                '#EB984E',
                '#F4D03F'
            ],
            hoverOffset: 4
        }]
    }
    const data_2 = {
        labels: [
            'Expenses',
            'Earnings'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [sum_expenses, sum_earnings],
            backgroundColor: [
                '#E53935',
                '#239B56'
            ],
            hoverOffset: 4
        }]
    }

    chartPie1.config.data = data_1
    chartPie1.update()
    chartPie2.config.data = data_2
    chartPie2.update()
}
//loads the line graph
// async function loadLineChart() {
//     const labels = [1, 2, 3, 4, 5, 6, 7];
//     const data = {
//         labels: labels,
//         datasets: [{
//             label: 'My First Dataset',
//             data: [65, 59, 80, 81, 56, 55, 40],
//             fill: false,
//             borderColor: 'rgb(75, 192, 192)',
//             tension: 0.1
//         }]
//     };

//     new Chart(
//         document.getElementById('lineCanvas'),
//         {
//             type: 'line',
//             data: data
//         }
//     );
// }