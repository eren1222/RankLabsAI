'use strict';



/**
 * navbar toggle
 */

const header = document.querySelector("[data-header]");
const navToggleBtn = document.querySelector("[data-nav-toggle-btn]");

navToggleBtn.addEventListener("click", function () {
  header.classList.toggle("nav-active");
  this.classList.toggle("active");
});

/**
 * toggle the navbar when click any navbar link
 */

const navbarLinks = document.querySelectorAll("[data-nav-link]");

for (let i = 0; i < navbarLinks.length; i++) {
  navbarLinks[i].addEventListener("click", function () {
    header.classList.toggle("nav-active");
    navToggleBtn.classList.toggle("active");
  });
}

// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function() {
  // Get the input element
  let analyseInput = document.querySelector('#analyse');
  // Get the section with similar projects
  let risksContainer = document.querySelector('#risks_container');
  let loadingSpinner = document.querySelector('.loading-spinner');

  risksContainer.style.display = 'none';
  loadingSpinner.style.display = 'none';


  analyseInput.addEventListener('click', function() {
    loadingSpinner.style.display = 'block';


    fetch(`https://ranklabsapi-726f7ad5f033.herokuapp.com/find/${document.getElementById("question_bar").value}`) // Replace with your API endpoint URL
        .then(response => {

          return response.json()
        })
        .then(data => {
          let dataList = Object.values(data);
          dataList.sort(function(a, b) {
            if (a["similarity"] > b["similarity"]) return -1;
            if (a["similarity"] < b["similarity"]) return 1;
            return 0;
          });
          return dataList;
        })
        .then(data => {

          loadingSpinner.style.display = 'none';
          risksContainer.style.display = 'block';

          document.querySelector("#similar1 .list-logo").innerHTML = `<img class="logostartup" alt="${data[0]["startup_name"]}" src="${data[0]["logo_src"]}">`;
          document.querySelector("#similar1 .desc").innerHTML = `<p class="desctext">${data[0]["description"]}</p>`;
          document.querySelector("#similar1 .value").innerHTML = `<p class="valuetext">${data[0]["similarity"].toFixed(2)}</p>`;

          document.querySelector("#similar2 .list-logo").innerHTML = `<img class="logostartup" alt="${data[1]["startup_name"]}" src="${data[1]["logo_src"]}">`;
          document.querySelector("#similar2 .desc").innerHTML = `<p class="desctext">${data[1]["description"]}</p>`;
          document.querySelector("#similar2 .value").innerHTML = `<p class="valuetext">${data[1]["similarity"].toFixed(2)}</p>`;

          document.querySelector("#similar3 .list-logo").innerHTML = `<img class="logostartup" alt="${data[2]["startup_name"]}" src="${data[2]["logo_src"]}">`;
          document.querySelector("#similar3 .desc").innerHTML = `<p class="desctext">${data[2]["description"]}</p>`;
          document.querySelector("#similar3 .value").innerHTML = `<p class="valuetext">${data[2]["similarity"].toFixed(2)}</p>`;

          document.querySelector("#similar4 .list-logo").innerHTML = `<img class="logostartup" alt="${data[3]["startup_name"]}" src="${data[3]["logo_src"]}">`;
          document.querySelector("#similar4 .desc").innerHTML = `<p class="desctext">${data[3]["description"]}</p>`;
          document.querySelector("#similar4 .value").innerHTML = `<p class="valuetext">${data[3]["similarity"].toFixed(2)}</p>`;

          document.querySelector("#similar5 .list-logo").innerHTML = `<img class="logostartup" alt="${data[4]["startup_name"]}" src="${data[4]["logo_src"]}">`;
          document.querySelector("#similar5 .desc").innerHTML = `<p class="desctext">${data[4]["description"]}</p>`;
          document.querySelector("#similar5 .value").innerHTML = `<p class="valuetext">${data[4]["similarity"].toFixed(2)}</p>`;

          let potential_calculated = (Number(data[0]["sr_score"].replace(",", ""))/1000).toFixed().toString()

          document.querySelector("#risk-data").innerHTML = potential_calculated + "%";
          document.querySelector("#risk-bar").style.width = potential_calculated + "%";

        })
        .catch(error => {
          // Handle any errors
          console.error('Error:', error);
        });
  });
});





/**
 * back to top & header
 */

const backTopBtn = document.querySelector("[data-back-to-top]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});