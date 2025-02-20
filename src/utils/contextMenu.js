import ContextMenu from "ol-contextmenu";
import { transform } from 'ol/proj';

import { showToast } from "./showToast";
import { flyHome } from "./flyHome";

// TODO separate
function flyTo(view, location, zoom, done) {
  const defaultZoom = view.getZoom();
  const duration = 2000;
  let parts = 1;
  let called = false;
  function callback(complete) {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0 || !complete) {
      called = true;
      done(complete);
    }
  }
  view.animate(
    {
      center: location,
      zoom: zoom ? 12 : defaultZoom,
      duration: duration,
    },
    callback,
  );
}

export const createContextMenu = (map, view, DEFAULT_POSITION, styles) => {
  return new ContextMenu({
    width: 220,
    defaultItems: true,
    items: [
      {
        text: `<div><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg> 
               <span>Center map here</span></div>`,
        classname: styles.contextmenu__style,
        callback: function (event) {
          showToast('Карта отцентрирована')
          flyTo(view, event.coordinate, false)
        },
      },
      {
        text: `<div><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pinned"><path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0"/><circle cx="12" cy="8" r="2"/><path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712"/></svg> 
               <span>Reset map center</span></div>`,
        classname: styles.contextmenu__style,
        callback: function () {
          flyHome(view)
        },
      },
      {
        text: `<div><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> 
               <span>Copy coordinates</span></div>`,
        classname: styles.contextmenu__style,
        callback: function (event) {
          const coords = event.coordinate
          showToast(`Координаты скоопированы: ${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}`);
          navigator.clipboard.writeText(`${coords}`);
        },
      },
      {
        text: `<div><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> 
               <span>Copy coordinates (WGS84)</span></div>`,
        classname: styles.contextmenu__style,
        callback: function (event) {
          const transformedCoords = transform(event.coordinate, 'EPSG:3857', 'EPSG:4326')
          showToast(`Координаты скоопированы: ${transformedCoords[1].toFixed(5)}, ${transformedCoords[0].toFixed(5)}`);
          navigator.clipboard.writeText(`${transformedCoords}`);
        },
      },
      {
        text: `<div><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scan-eye"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="1"/><path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0"/></svg> 
               <span>Zoom in to the point</span></div>`,
        classname: styles.contextmenu__style,
        callback: function (event) {
          showToast('Приближено');
          flyTo(view, event.coordinate)
        },
      },
      {
        text: `<div><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8D0801" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg> 
               <span>Find nearest fire</span></div>`,
        classname: styles.contextmenu__style,
        callback: function (event) {
          showToast('Функционал не готов');
        },
      },{
        text: `<div><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4999E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg> <span>Weather here</span></div>`,
        classname: styles.contextmenu__style,
        callback: function (event) {
          showToast('Погода');
          // TODO getWeatherInfo(event.coordinate);
        },
      },
      '-',
    ],
  });
};
