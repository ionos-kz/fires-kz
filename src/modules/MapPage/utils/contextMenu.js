import ContextMenu from "ol-contextmenu";
import { transform } from 'ol/proj';

import { showToast } from "src/shared/utils/showToast";
import { flyHome } from "./flyHome";

function flyTo(view, location, zoom = null, done = () => {}) {
  if (!view || !location) {
    console.error('Invalid view or location provided to flyTo');
    done(false);
    return;
  }

  const currentZoom = view.getZoom();
  const targetZoom = zoom || (currentZoom < 12 ? 12 : currentZoom);
  const duration = 1500;
  
  view.animate({
    center: location,
    zoom: targetZoom,
    duration: duration,
  }, (complete) => {
    done(complete);
  });
}

// Weather API integration
async function getWeatherInfo(coordinate) {
  try {
    const [lon, lat] = transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    
    const API_KEY = '59b43714fd1eb5528d8cab44041c7067';
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`
    );
    
    if (!response.ok) {
      throw new Error('Weather API request failed');
    }
    
    const data = await response.json();
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed);
    
    showToast(`Погода: ${temp}°C, ${description}, влажность ${humidity}%, ветер ${windSpeed} м/с`, 'success', 5000);
  } catch (error) {
    console.error('Weather fetch error:', error);
    showToast('Не удалось получить данные о погоде', 'error');
  }
}

async function findNearestFire(coordinate, map) {
  try {
    showToast('Поиск ближайших очагов возгорания...', 'info');
    
    const [lon, lat] = transform(coordinate, 'EPSG:3857', 'EPSG:4326');
    
    // Mock fire data
    const mockFires = [
      { lat: lat + 0.01, lon: lon + 0.01, intensity: 'high', distance: 1.2 },
      { lat: lat - 0.005, lon: lon + 0.015, intensity: 'medium', distance: 2.1 },
    ];
    
    if (mockFires.length > 0) {
      const nearestFire = mockFires[0];
      const fireCoordinate = transform([nearestFire.lon, nearestFire.lat], 'EPSG:4326', 'EPSG:3857');
      
      const view = map.getView();
      flyTo(view, fireCoordinate, 14, (complete) => {
        if (complete) {
          showToast(`Найден очаг возгорания в ${nearestFire.distance} км (интенсивность: ${nearestFire.intensity})`, 'warning', 4000);
        }
      });
    } else {
      showToast('Очагов возгорания в радиусе 50 км не найдено', 'success');
    }
  } catch (error) {
    console.error('Fire search error:', error);
    showToast('Ошибка при поиске очагов возгорания', 'error');
  }
}

function formatCoordinates(coordinate, precision = 5) {
  if (!coordinate || coordinate.length !== 2) return 'Invalid coordinates';
  return `${coordinate[1].toFixed(precision)}, ${coordinate[0].toFixed(precision)}`;
}

async function copyCoordinates(coordinate, isWGS84 = false) {
  try {
    let coords = coordinate;
    let coordSystem = 'Web Mercator';
    
    if (isWGS84) {
      coords = transform(coordinate, 'EPSG:3857', 'EPSG:4326');
      coordSystem = 'WGS84';
    }
    
    const formattedCoords = formatCoordinates(coords);
    const textToCopy = `${coords[1].toFixed(6)}, ${coords[0].toFixed(6)}`;
    
    await navigator.clipboard.writeText(textToCopy);
    showToast(`Координаты скопированы (${coordSystem}): ${formattedCoords}`, 'success');
  } catch (error) {
    console.error('Copy coordinates error:', error);
    showToast('Не удалось скопировать координаты', 'error');
  }
}

// #TODO
function addMeasurementTool(map) {
  showToast('Инструмент измерения активирован', 'info');
}

export const createContextMenu = (map, view, DEFAULT_POSITION, styles) => {
  const contextMenuItems = [
    {
      text: `<div class="context-menu-item">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair">
                 <circle cx="12" cy="12" r="10"/>
                 <line x1="22" x2="18" y1="12" y2="12"/>
                 <line x1="6" x2="2" y1="12" y2="12"/>
                 <line x1="12" x2="12" y1="6" y2="2"/>
                 <line x1="12" x2="12" y1="22" y2="18"/>
               </svg> 
               <span>Центрировать карту здесь</span>
             </div>`,
      classname: styles.contextmenu__style,
      callback: function (event) {
        flyTo(view, event.coordinate, null, (complete) => {
          if (complete) {
            showToast('Карта отцентрирована', 'success');
          }
        });
      },
    },
    
    {
      text: `<div class="context-menu-item">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scan-eye">
                 <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
                 <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
                 <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
                 <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
                 <circle cx="12" cy="12" r="1"/>
                 <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"/>
               </svg> 
               <span>Приблизить к точке</span>
             </div>`,
      classname: styles.contextmenu__style,
      callback: function (event) {
        flyTo(view, event.coordinate, 14, (complete) => {
          if (complete) {
            showToast('Приближено к точке', 'success');
          }
        });
      },
    },
    
    {
      text: `<div class="context-menu-item">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pinned">
                 <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"/>
                 <circle cx="12" cy="8" r="2"/>
                 <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"/>
               </svg> 
               <span>Вернуться на главную позицию</span>
             </div>`,
      classname: styles.contextmenu__style,
      callback: function () {
        try {
          flyHome(view);
          showToast('Возвращение к главной позиции', 'success');
        } catch (error) {
          console.error('Error returning home:', error);
          showToast('Ошибка при возвращении к главной позиции', 'error');
        }
      },
    },
    
    '-',
    
    {
      text: `<div class="context-menu-item">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy">
                 <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                 <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
               </svg> 
               <span>Копировать координаты</span>
             </div>`,
      classname: styles.contextmenu__style,
      callback: function (event) {
        copyCoordinates(event.coordinate, false);
      },
    },
    
    {
      text: `<div class="context-menu-item">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe">
                 <circle cx="12" cy="12" r="10"/>
                 <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                 <path d="M2 12h20"/>
               </svg> 
               <span>Копировать координаты (WGS84)</span>
             </div>`,
      classname: styles.contextmenu__style,
      callback: function (event) {
        copyCoordinates(event.coordinate, true);
      },
    },
    
    '-',

    {
      text: `<div class="context-menu-item">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun">
                 <path d="M12 2v2"/>
                 <path d="m4.93 4.93 1.41 1.41"/>
                 <path d="M20 12h2"/>
                 <path d="m19.07 4.93-1.41 1.41"/>
                 <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/>
                 <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/>
               </svg> 
               <span>Погода в этом месте</span>
             </div>`,
      classname: styles.contextmenu__style,
      callback: function (event) {
        getWeatherInfo(event.coordinate);
      },
    },
    
    {
      text: `<div class="context-menu-item">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8494A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame">
                 <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
               </svg> 
               <span>Найти ближайшие очаги</span>
             </div>`,
      classname: styles.contextmenu__style,
      callback: function (event) {
        findNearestFire(event.coordinate, map);
      },
    },
    
    '-',
    
    {
      text: `<div class="context-menu-item">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ruler">
                 <path d="M21.3 8.7l-9.6-9.6c-.4-.4-1.1-.4-1.4 0L8.7 0.7c-.4.4-.4 1.1 0 1.4l9.6 9.6c.4.4 1.1.4 1.4 0l1.6-1.6c.4-.4.4-1.1 0-1.4z"/>
                 <path d="m5 11 4 4"/>
                 <path d="m19 15-4 4"/>
                 <path d="m2 12 10 10"/>
                 <path d="m16 6 4 4"/>
               </svg> 
               <span>Измерить расстояние</span>
             </div>`,
      classname: styles.contextmenu__style,
      callback: function (event) {
        addMeasurementTool(map);
      },
    },
    
    {
      text: `<div class="context-menu-item">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info">
                 <circle cx="12" cy="12" r="10"/>
                 <path d="M12 16v-4"/>
                 <path d="M12 8h.01"/>
               </svg> 
               <span>Информация о местности</span>
             </div>`,
      classname: styles.contextmenu__style,
      callback: async function (event) {
        try {
          const [lon, lat] = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326');
          const coords = formatCoordinates([lon, lat]);
          
          showToast(`Координаты: ${coords}`, 'info', 4000);
        } catch (error) {
          showToast('Не удалось получить информацию о местности', 'error');
        }
      },
    },
  ];

  return new ContextMenu({
    width: 250,
    defaultItems: false,
    items: contextMenuItems,
  });
};
