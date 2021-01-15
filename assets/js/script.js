var APIKey = "a1d4b5bd4b337a47ecafc89a2bd320c8";

let cities = [];
let latitude = 0;
let longitude = 0;

function getLatLon(cityName) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        console.log("This one: ");
        console.log(response);
        latitude = response.coord.lat;
        longitude = response.coord.lon;

        getCity(latitude, longitude, cityName);
    });
}

$( document ).ready(function() {

    // console.log(window);
    // console.log("Loading saved cities: " + cities);
    cities = JSON.parse(localStorage.getItem("savedCities"));
    // console.log("Cities loaded: " + cities);
    // If there is persistent data, query city at the end of the array
    if (cities) { 
        getLatLon(cities[cities.length - 1])
        // getCity(cities[cities.length - 1]);
        // fiveDayForecast(cities[cities.length - 1]);
        renderButtons(cities);  
    }
    // if there is none query current city
    else { getLatLon("Minneapolis") }
        
});        

function renderButtons(cityList) {
    // Erase current city buttons
    var cityHistory = $("#city-history");
    cityHistory.html("");
    
    // render buttons for all cities in the cityList
    if (cityList) {
        for (let i = 0; i < cityList.length; i++) {
            // Create button
            let button = $("<button>");
            button.attr("class", "city-button");
            button.attr("data-name", cities[i]);
            // Add text to button
            button.text(cityList[i]);
            // Add button to cityHistory
            cityHistory.prepend(button);
         }
    }
}

// Search button function
$("#searchBtn").on("click", function(event) {
    // event.preventDefault() prevents submit button from trying to send a form.
    // Using a submit button instead of a regular button allows the user to hit
    // "Enter" instead of clicking the button if desired
    event.preventDefault();

    // Grab the user input
    let searchText = $(".form-control").val().trim();
    // If user input is there and city is not already in the array
    if(cities) {
        if(searchText && (cities.indexOf(searchText) === -1)) {
            // Push city into array
            cities.push(searchText);
        }
    }
    else {
        cities = [searchText];
    }    
    getLatLon(searchText);
    localStorage.setItem("savedCities", JSON.stringify(cities));
    renderButtons(cities);
});

function getCity(lat, lon, city) {
    // Database query
    var queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${APIKey}`;

    // Ajax call for the DB
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        
        // Populate current city, date into card
        $("#city").text(`${ city } (${ dayjs().format('MM/DD/YYYY') })`);
        
        // Add a weather icon
        let imgIcon = $("<img>");
        imgIcon.attr("src", "https://openweathermap.org/img/w/" + response.current.weather[0].icon + ".png");
        // Append it to the city id
        $("#city").append(imgIcon);

        // Convert temperature to fahrenheit from Kelvin
        var fahrenheit = ((response.current.temp - 273.15) * 9/5 + 32).toFixed(2);
        // Display temperature
        $("#temp").text(`Temperature: ${ fahrenheit } °F`);
        
        // Display wind speed
        $("#wind-speed").text(`Wind Speed: ${ response.current.wind_speed } MPH`);

        // Display humidity
        $("#humidity").text(`Humidity: ${ response.current.humidity }%`);
        
        // Display UV Index
        let UVI = response.daily[0].uvi;
        $("#uv-index").text(`${ UVI }`);
    
        let background;
        // White font work better on most colors
        let font = "white";
        // Change the background color and font color based on the UV Index colors
        if (UVI < 3)        { background = "green"; }
        else if (UVI < 6)   { background = "yellow"; font = "black";}
        else if (UVI < 8)   { background = "orange"; }
        else if (UVI < 11)  { background = "red"; }
        else                { background = "purple"; }

        $("#uv-index").attr("style", `background-color: ${ background }; color: ${ font };`);
        // Send latitude, longitude, and city name to 5-Day forecast
        fiveDayForecast(lat, lon, city);
    });
}

// Function to allow the search history to be used 
function displayCityInfo(event) {
    event.preventDefault();
    let city = $(this).attr("data-name");
    getLatLon(city);
    // Switch button order if time permits
} 
// Add ability to click the city buttons in the history using DELEGATION
$("#city-history").on("click", ".city-button", displayCityInfo);

// Populating the 5-Day forecast cards
function fiveDayForecast(fcLat, fcLon, fcCity) {

    var queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${fcLat}&lon=${fcLon}&exclude=hourly,minutely&appid=${APIKey}`;
    
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {

        // Populate the forecast cards
        for (let i = 1; i < 6; i++) {

            // Dates
            let date = $(`#date-${i}`);
            date.text( dayjs().add(i, 'day').format('MM/DD/YYYY') );

            // Icons
            let fcIcon = $(`#fc-icon-${i}`);
            fcIcon.attr("src", "https://openweathermap.org/img/w/" + response.daily[i].weather[0].icon + ".png");

            // Temperature
            let fcTemp = $(`#fc-temp-${i}`);
            var fcFahrenheit = ((response.daily[i].temp.day - 273.15) * 9/5 + 32).toFixed(2);
            fcTemp.text(`Temp:  ${ fcFahrenheit } °F`);

            // Humidity
            let fcHumidity = $(`#fc-humidity-${i}`);
            fcHumidity.text(`Humidity: ${ response.daily[i].humidity }%`);
        }      
    });    
}










// Nice to haves
    // switch button order based on selection from history
    // write the card in javascript