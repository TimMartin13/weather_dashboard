var APIKey = "a1d4b5bd4b337a47ecafc89a2bd320c8";

var cities = ["Boston", "London"];

$( document ).ready(function() {

    // console.log(window);
    var cities = JSON.parse(localStorage.getItem("savedCities"));
    // If there is persistent data, query city at the end of the array
    if (cities) { 
        getCity(cities[cities.length - 1]); 
        console.log(cityList);
        renderButtons(cities);
    }
    // if there is none query current city
    else { getCity("London"); }
        
});        

function renderButtons(cityList) {
    var cityHistory = $("#cityHistory");
    cityHistory.html("");
    console.log(cityList);
    // render buttons for all cities in the cityList
    if (cityList) {
        // for (let i = 0; i < movies.length; i++) {
            //   let button = $( "<button>");
            //   button.text(movies[i]);
            //   buttonsView.append(button);
            //   console.log(movies[i]);
            // }
    }
    else {
        console.log("Empty list");
    }
    

}

$("#searchBtn").on("click", function(event) {
    // event.preventDefault() prevents submit button from trying to send a form.
    // Using a submit button instead of a regular button allows the user to hit
    // "Enter" instead of clicking the button if desired
    event.preventDefault();

    let searchText = $(".form-control").val().trim();
    // If user input is there and city is not already in the array
    if(searchText && (cities.indexOf(searchText) === -1)) {
        // Push city into array
        cities.push(searchText);
        console.log(`Cities: ${ cities[0] } `);
    }
    localStorage.setItem("savedCities", JSON.stringify(cities));
    renderButtons();
});

function getCity(cityName) {
    // Here we are building the URL we need to query the database
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;

    // We then created an AJAX call
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        
        // Create CODE HERE to log the resulting object
        console.log(response);
        
        // Function to get an icon
        // let currentIcon = response.weather[0].icon;

        $("#city").text(`${ cityName } (${ dayjs().format('MM/DD/YYYY') })`);

        // Convert temperature to fahrenheit from Kelvin
        var fahrenheit = ((response.main.temp - 273.15) * 9/5 + 32).toFixed(2);
        // Display temperature
        $("#temp").text(`Temperature: ${ fahrenheit } °F`);
        
        // Display wind speed
        $("#wind-speed").text(`Wind Speed: ${ response.wind.speed } MPH`);

        // Display humidity
        $("#humidity").text(`Humidity: ${ response.main.humidity }%`);
        
        // Figure out how to UV index
        
    });
}
