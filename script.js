document.addEventListener("DOMContentLoaded", () => {
    const weatherContainer = document.getElementById("weather");
    const cityInput = document.getElementById("cityInput");
    const searchBtn = document.getElementById("searchBtn");

    // Função para corrigir a caligrafia (primeira letra de cada palavra em maiúscula)
    function capitalizeCityName(city) {
        return city
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    function getCoordinates(city) {
        console.log(`Buscando coordenadas para ${city}...`);
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;

        return fetch(geoUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) throw new Error("Cidade não existente");
                return { lat: data[0].lat, lon: data[0].lon };
            });
    }

    function getWeatherData(city, latitude, longitude) {
        console.log(`Buscando clima para ${city}...`);
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,windspeed_10m&timezone=America/Sao_Paulo`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log("Dados recebidos:", data);
                const temperature = data.current_weather.temperature;
                const windSpeed = data.current_weather.windspeed;
                const humidity = data.hourly.relativehumidity_2m[0];

                weatherContainer.innerHTML = `
                    <div class="weather-header">
                        <h2 class="city-name">${capitalizeCityName(city)}</h2>
                    </div>
                    <div class="weather-main">
                        <div class="temperature-box">
                            <p class="temperature">${temperature}°C</p>
                        </div>
                    </div>
                    <div class="weather-details">
                        <div class="detail-item">
                            <span class="detail-icon">💧</span>
                            <div>
                                <p class="detail-value">${humidity}%</p>
                                <p class="detail-label">Umidade</p>
                            </div>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🌬️</span>
                            <div>
                                <p class="detail-value">${windSpeed} km/h</p>
                                <p class="detail-label">Vento</p>
                            </div>
                        </div>
                    </div>
                `;
            })
            .catch(error => {
                console.error("Erro na requisição:", error);
                weatherContainer.innerHTML = `<p>${error.message}</p>`;
            });
    }

    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            getCoordinates(city)
                .then(coords => getWeatherData(city, coords.lat, coords.lon))
                .catch(error => {
                    console.error("Erro:", error);
                    weatherContainer.innerHTML = `<p>${error.message}</p>`;
                });
        } else {
            weatherContainer.innerHTML = "<p>Digite uma cidade!</p>";
        }
    });

    cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") searchBtn.click();
    });
});
