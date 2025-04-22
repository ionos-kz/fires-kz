export const newDD = [
  {
    id: 0,
    key: 'layers',
    header_ru: 'Слои',
    items: [
      {
        id: 'fires',
        label_ru: 'Пожары',
        isExpanded: true,
        options: [
          {
            id: 'firms1',
            label: 'FIRMS',
            layer: 'FIRMS',
            type: 'raster',
            isOn: true,
            value: 100,
            url: 'https://api.igmass.kz/fire/firebetweendate?',
          },
        ]
      },
      {
        id: 'weather',
        label_ru: 'Погода',
        isExpanded: false,
        options: [
          {
            id: 'temperature',
            label: 'Температура',
            layer: 'temperature',
            type: 'raster',
            isOn: false,
            value: 100,
            url: null, 
          },
          {
            id: 'humidity',
            label: 'Влажность',
            layer: 'humidity',
            type: 'raster',
            isOn: false,
            value: 100,
            url: null, 
          }
        ]
      },
      {
        id: 'admBoundaries',
        label_ru: 'Админ границы',
        isExpanded: false,
        options: [
          {
            id: 'region_border',
            label: 'Границы областей',
            layer: 'region_border',
            type: 'vector',
            isOn: false,
            value: 100,
            url: null, 
          },
          {
            id: 'region_district',
            label: 'Границы районов',
            layer: 'region_district',
            type: 'vector',
            isOn: false,
            value: 100,
            url: null, 
          }
        ]
      },
      {
        id: 'copernicusImages',
        label_ru: 'Космоснимки',
        isExpanded: false,
        options: [
          {
            id: 'copernicus_image',
            layer: 'satellite-image',
            type: 'raster',
            labelDate: 'Даты',
            startDate: 0,
            endDate: 0,
            labelBands: 'Каналы',
            bands: [],
            isOn: false,
            value: 100,
            url: null,
            labelSatellite: 'Спутник',
            satellite: 'SENTINEL1_GRD'
          },
        ]
      }
    ]
  },
  {
    id: 1,
    key: 'tools',
    header_ru: 'Инструменты',
    items: [
      {
        id: 'copy_coords',
        label_ru: 'Копировать координаты',
        isExpanded: false,
        options: [
          {
            id: 'copy_latlon',
            label: 'Координаты (Lat, Lon)',
            action: 'copyCoordinates',
            icon: 'copy',
            isActive: false,
            url: null, 
          }
        ]
      }
    ]
  },
  {
    id: 2,
    key: 'filter',
    header_ru: 'Фильтр',
    items: [
      {
        id: 'time_filter',
        label_ru: 'По времени',
        isExpanded: false,
        options: [
          {
            id: 'date_range',
            label: 'Диапазон дат',
            type: 'date-range',
            action: 'filterByDate',
            icon: 'calendar',
            isActive: false,
            url: null,
          }
        ]
      },
      {
        id: 'region_filter',
        label_ru: 'По региону',
        isExpanded: false,
        options: [
          {
            id: 'select_region',
            label: 'Выбрать регион',
            type: 'dropdown',
            action: 'filterByRegion',
            icon: 'map-pin',
            isActive: false,
            url: null,
          }
        ]
      },
    ]
  },
  {
    id: 3,
    key: 'analysis',
    header_ru: 'Анализ',
    items: [
      {
        id: 'fire_analysis',
        label_ru: 'Пожары',
        isExpanded: false,
        options: [
          {
            id: 'fire_cluster',
            label: 'Кластеризация пожаров',
            action: 'runFireCluster',
            icon: 'flame',
            isActive: false,
            url: null,
          }
        ]
      },
      {
        id: 'uhi',
        label_ru: 'Городское тепло',
        isExpanded: false,
        options: [
          {
            id: 'uhi_map',
            label: 'UHI карта',
            action: 'runUHI',
            icon: 'thermometer-sun',
            isActive: false,
            url: null,
          }
        ]
      }
    ]
  },
  {
    id: 4,
    key: 'statistics',
    header_ru: 'Статистика',
    items: [
      {
        id: 'fires_by_region',
        label_ru: 'Пожары по регионам',
        isExpanded: false,
        options: [
          {
            id: 'stat_fires',
            label: 'График по регионам',
            action: 'showFireStats',
            icon: 'bar-chart-2',
            isActive: false,
            url: null,
          }
        ]
      }
    ]
  },
  {
    id: 5,
    key: 'feedback',
    header_ru: 'Обратная связь',
    items: [
      {
        id: 'bug_report',
        label_ru: 'Сообщить об ошибке',
        isExpanded: false,
        options: [
          {
            id: 'report_bug',
            label: 'Форма ошибки',
            action: 'reportBug',
            icon: 'alert-triangle',
            isActive: false,
            url: null,
          }
        ]
      },
      {
        id: 'suggestion',
        label_ru: 'Предложение',
        isExpanded: false,
        options: [
          {
            id: 'suggest_feature',
            label: 'Предложить улучшение',
            action: 'suggestFeature',
            icon: 'message-circle',
            isActive: false,
            url: null,
          }
        ]
      }
    ]
  },
  {
    id: 6,
    key: 'learning',
    header_ru: 'Обучение',
    items: [
      {
        id: 'tutorial',
        label_ru: 'Руководство',
        isExpanded: false,
        options: [
          {
            id: 'start_tutorial',
            label: 'Пошаговое обучение',
            action: 'startTutorial',
            icon: 'book-open',
            isActive: false,
            url: null,
          }
        ]
      },
      {
        id: 'videos',
        label_ru: 'Видеоуроки',
        isExpanded: false,
        options: [
          {
            id: 'video_tips',
            label: 'Смотри видео',
            action: 'showVideoGuide',
            icon: 'video',
            isActive: false,
            url: null, 
          }
        ]
      }
    ]
  }
];