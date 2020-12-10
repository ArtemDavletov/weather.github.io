let refreshForm = document.forms.namedItem('refresh');
let addCityForm = document.forms.namedItem('addFavorite');

refreshForm.addEventListener('submit', (event) => {
    getLocation();
    event.preventDefault();
});

addCityForm.addEventListener('submit', (event) => {
    addNewCity();
    event.preventDefault();
});

function split(cityName) {
    return cityName.split(' ').join('-');
}

function request(params) {
    params.push('units=metric');
    params.push('appid=90ce88aa9b0fb76fbb80ec7191353a97');
    const url = 'https://api.openweathermap.org/data/2.5/weather' + '?' + params.join('&');
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    return fetch(url, { signal: abortSignal }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            alert('Something went wrong ' + url);
        }
    }).catch(() => {
        alert('Something went wrong');
    });
}

function getLocation() {
    fillCurrentCityLoader();
    let currentLocation = navigator.geolocation;
    if (currentLocation) {
        currentLocation.getCurrentPosition(
            (position) => {
                fillCurrentCity([`lat=${position.coords.latitude}`, `lon=${position.coords.longitude}`]);
            },
            (error) => {
                fillCurrentCity(['q=Saint Petersburg']);
            }
        );
        return;
    }
    fillCurrentCity(['q=Saint Petersburg']);
}

function addSavedCities() {
    for (let i=0; i < localStorage.length; i++) {
        const newCity = appendCityLoader();
        let key = localStorage.key(i);
        request(['q=' + key]).then((jsonResult) => {
            appendCity(jsonResult, newCity);
        });
    }
}

function addNewCity() {
    const formData = new FormData(addCityForm);
    const cityName = formData.get('addFavorite').toString();
    addCityForm.reset();
    if (localStorage.hasOwnProperty(cityName)) {
        return;
    }
    const newCity = appendCityLoader();
    request(['q=' + cityName]).then((jsonResult) => {
        if (jsonResult && !localStorage.hasOwnProperty(jsonResult.name)) {
            localStorage.setItem(jsonResult.name, '');
            appendCity(jsonResult, newCity);
        } else {
            newCity.remove();
        }
    });
}

function removeCity(cityName) {
    localStorage.removeItem(cityName);
    document.getElementById(split(cityName)).remove();
}

function fillCurrentCityLoader() {
    document.getElementsByClassName('currentCityBody')[0].innerHTML = '<div class="curr"></div>';
}

function fillCurrentCity(queryParams) {
    request(queryParams).then((jsonResult) => {
        document.getElementsByClassName('currentCityBody')[0].innerHTML = `
            <div class="currentCityBodyInfo">
                <h3 class="currentCityName">${jsonResult.name}</h3>
                <p class="currentCityTemperature">${Math.floor(jsonResult.main.temp)}˚C</p>
                <img class="currentCityPicture" src="https://openweathermap.org/img/wn/${jsonResult.weather[0]['icon']}@2x.png">
            </div>
            <ul class="currentCityItems">
                ${fillCityUl(jsonResult)}
            </ul>`;
    });
}

function appendCityLoader() {
    let newCity = document.createElement('li');
    newCity.className = 'favouriteCity';
    newCity.innerHTML = '<div class="curr"></div>';
    document.getElementsByClassName('favouritesCities')[0].appendChild(newCity);
    return newCity;
}

function appendCity(jsonResult, newCity) {
    const cityName = jsonResult.name;
    newCity.id = split(cityName);
    newCity.innerHTML = `<div class="favouriteCityHeader">
                             <h3 class="favouriteCityName">${cityName}</h3>
                             <p class="favouriteCityTemperature">${Math.floor(jsonResult.main.temp)}˚C</p>
                             <img class="favouriteCityPicture" src="https://openweathermap.org/img/wn/${jsonResult.weather[0]['icon']}@2x.png">
                             <button class="close" onclick="removeCity(\'${cityName}\');">&times;</button>
                         </div>
                         <ul class="favouriteCityMain">
                             ${fillCityUl(jsonResult)}
                         </ul>`;
}

function fillCityUl(params) {
    return `<li class="cityItemPoint">
                <p class="cityItemPointName">Ветер</p>
                <p class="cityItemPointValue">${params.wind.speed} m/s</p>
            </li>
            <li class="cityItemPoint">
                <p class="cityItemPointName">Облачность</p>
                <p class="cityItemPointValue">${params.clouds.all}%</p>
            </li>
            <li class="cityItemPoint">
                <p class="cityItemPointName">Давление</p>
                <p class="cityItemPointValue">${params.main.pressure} hpa</p>
            </li>
            <li class="cityItemPoint">
                <p class="cityItemPointName">Влажность</p>
                <p class="cityItemPointValue">${params.main.humidity}%</p>
            </li>
            <li class="cityItemPoint">
                <p class="cityItemPointName">Координаты</p>
                <p class="cityItemPointValue">[${params.coord.lat}, ${params.coord.lon}]</p>
            </li>`;
}

getLocation();
addSavedCities();
