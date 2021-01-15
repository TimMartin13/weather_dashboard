var APIKey = "a1d4b5bd4b337a47ecafc89a2bd320c8";

let cities = [];
let latitude = 0;
let longitude = 0;

// Initial load of document
$( document ).ready(function() {
    // Grab the current array from local storage
    cities = JSON.parse(localStorage.getItem("savedCities"));
    
    // If there is persistent data, query city at the end of the array (Most recent search)
    if (cities) { getLatLon(cities[cities.length - 1]); }
    // if there is none query city base on IP address but I am not sure how to do that yet so we will just go with the default of Minneapolis
    else { getLatLon("Minneapolis"); }
        
}); 

// Main function that gets the latitude/longitude of a user entered city
// If that city is not found by the API, the user will be alerted to that fact
function getLatLon(cityName) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        // Store latitude and longitude for later queries
        latitude = response.coord.lat;
        longitude = response.coord.lon;

        // If the city array has something in it
        if(cities) {
            // If the cityName is valid and it isn't in the current array
            if(cityName && (cities.indexOf(cityName) === -1)) {
                // Push city into array
                cities.push(cityName);
                // Keep the last 15
                if (cities.length > 15) {
                    cities.shift();
                }
            }
        }
        else {
            // No local data
            cities = [searchText];
        }  
        // Populate the cards with the lat lon and city name
        getCity(latitude, longitude, cityName);
        // Render the history buttons
        renderButtons(cities);
        // Save the array to local storage
        localStorage.setItem("savedCities", JSON.stringify(cities));

    }, function() {
        // Query was unsuccessful
        alert("City not found");
    });
}

// Query the city using the latitude/longitude provided by getLatLon()
function getCity(lat, lon, city) {
    
    var queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&appid=${APIKey}`;

    // API query
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

// Populating the 5-Day forecast cards using the infomation from getCity()
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

// Function to render the search history buttons
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
    event.preventDefault();

    // Grab the user input
    let searchText = $(".form-control").val().trim();
    // Query the API with user text
    getLatLon(searchText);
    
});

// Function to clear the textbox when user click inside of it
$("#textBox").focus(function() { 
    $(this).val(""); 
} );

// Function to allow the search history to be used as buttons
function displayCityInfo(event) {
    event.preventDefault();
    let city = $(this).attr("data-name");
    getLatLon(city);
} 
// Add ability to click the city buttons in the history using DELEGATION
$("#city-history").on("click", ".city-button", displayCityInfo);


