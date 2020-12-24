const SPINNER = `<div class="lds-spinner">
                    <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                 </div>`;

let refreshForm = document.forms.namedItem('refresh');
let addCityForm = document.forms.namedItem('addFavorite');

refreshForm.addEventListener('submit', (event) => {
    getLocation();
    event.preventDefault();
});

addCityForm.addEventListener('submit', (event) => {
    addNewCity(event.target);
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
            alert('No such city with name ' + params[0].substr(2));
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

function addNewCity(target) {
    const value = target.addFavorite.value.replace(/\'/g, "\"").replace(/\"/g, '\\"');
    console.log(value);
    const cityName = value.toLowerCase();
    addCityForm.reset();
    if (localStorage.hasOwnProperty(cityName)) {
        alert('City exists in favorites');
        return;
    }
    const newCity = appendCityLoader();
    request(['q=' + cityName]).then((jsonResult) => {
        localStorage.setItem(jsonResult.name.toLowerCase(), '');
        appendCity(jsonResult, newCity);
    }).catch(() => {
        newCity.remove();
    });
}

function removeCity(cityName) {
    localStorage.removeItem(cityName.toLowerCase());
    document.getElementById(split(cityName)).remove();
}

function fillCurrentCityLoader() {
    document.getElementsByClassName('currentCityBody')[0].insertAdjacentHTML('beforebegin', SPINNER);
}

function fillCurrentCity(queryParams) {
    request(queryParams).then((jsonResult) => {
        document.querySelector(`.lds-spinner`).remove();
        document.getElementsByClassName('currentCityBody')[0].innerHTML = fillCurrentCityTemplate(jsonResult);
    });
}

function appendCityLoader() {
    let newCity = document.createElement('li');
    newCity.className = 'favouriteCity';
    newCity.innerHTML = SPINNER;
    document.getElementsByClassName('favouritesCities')[0].appendChild(newCity);
    return newCity;
}

function appendCity(jsonResult, newCity) {
    const cityName = jsonResult.name;
    newCity.id = split(cityName);
    newCity.innerHTML = appendCityTemplate(jsonResult);
}

function fillCurrentCityTemplate (params) {
    let currentItemElement = document.querySelector(`#currentCity`).content.cloneNode(true).querySelector(`.currentCityBodyInfo`);
    let currentCityItemsElement = document.querySelector(`#currentCity`).content.cloneNode(true).querySelector(`.currentCityItems`);

    currentItemElement.querySelector(`.currentCityName`).textContent = `${params.name}`;
    currentItemElement.querySelector(`.currentCityTemperature`).textContent = `${params.main.temp}°C`;
    currentItemElement.querySelector(`.currentCityPicture`).src = `https://openweathermap.org/img/wn/${params.weather[0]['icon']}@2x.png`;

    currentCityItemsElement = fillCurrentCityUlTemplate(currentCityItemsElement, params);

    return currentItemElement.outerHTML + currentCityItemsElement.outerHTML;
}

function appendCityTemplate (params) {
    let favoriteItemElement = document.querySelector(`#favourites`).content.cloneNode(true).querySelector(`.favouriteCity`);

    favoriteItemElement.querySelector(`.favouriteCityName`).textContent = `${params.name}`;
    favoriteItemElement.querySelector(`.favouriteCityTemperature`).textContent = `${params.main.temp}°C`;
    favoriteItemElement.querySelector(`.favouriteCityPicture`).src = `https://openweathermap.org/img/wn/${params.weather[0]['icon']}@2x.png`;
    favoriteItemElement.querySelector(`.close`).id = `${params.name}`;
    favoriteItemElement = fillCurrentCityUlTemplate(favoriteItemElement, params);

    return favoriteItemElement.outerHTML;
}

function fillCurrentCityUlTemplate(favoriteItemElement, params) {
    const detailsElements = favoriteItemElement.querySelectorAll(`.cityItemPoint`);

    detailsElements[0].querySelector(`.cityItemPointValue`).textContent = `${params.wind.speed} m/s`;
    detailsElements[1].querySelector(`.cityItemPointValue`).textContent = `${params.clouds.all} %`;
    detailsElements[2].querySelector(`.cityItemPointValue`).textContent = `${params.main.pressure} hpa`;
    detailsElements[3].querySelector(`.cityItemPointValue`).textContent = `${params.main.humidity} %`;
    detailsElements[4].querySelector(`.cityItemPointValue`).textContent = `[${params.coord.lat}, ${params.coord.lon}]`;

    return favoriteItemElement;
}

getLocation();
addSavedCities();
