export const newDD = [
  {
    id: 0,
    key: 'methane',
    items: [
      {
        id: 'methane_main',
        label_ru: 'Area Flux Mappers',
        options: [
          {
            id: 'sp',
            label: 'Super Emitters 2019',
          },
        ]
      },
      {
        id: 'methane_instances',
        label_ru: 'Point source imagers',
        options: [
          {
            id: 'sp_sn2',
            label: 'Super Emitters 2019',
          },
          {
            id: 'sp_instances',
            label: 'Super Emitters 2019',
          },
        ]
      }
    ]
  },
  {
    id: 1,
    key: 'tools',
    items: [
      {
        id: 'admin_boundaries',
        label_ru: 'Админстративные границы',
        options: [
          {
            id: 'country_boundaries',
            label: 'Границы Казахстана',
          },
          {
            id: 'region_boundaries',
            label: 'Границы областей',
          },
          {
            id: 'district_boundaries',
            label: 'Границы районов',
          },
          {
            id: 'settlement_boundaries',
            label: 'Границы поселков',
          },
          {
            id: 'settlements_pinpoints',
            label: 'Местоположения населенных пунктов',
          }
        ]
      },
      // {
      //   id: 'copernicusImages',
      //   label_ru: 'Космоснимки',
      //   isExpanded: false,
      //   options: [
      //     {
      //       id: 'copernicus_image',
      //       layer: 'satellite-image',
      //       type: 'raster',
      //       labelDate: 'Даты',
      //       startDate: 0,
      //       endDate: 0,
      //       labelBands: 'Каналы',
      //       bands: [],
      //       isOn: false,
      //       value: 100,
      //       url: null,
      //       labelSatellite: 'Спутник',
      //       satellite: 'SENTINEL1_GRD'
      //     },
      //   ]
      // }
    ]
  },
  {
    id: 2,
    key: 'fire',
    items: [
      {
        id: 'fire',
        label_ru: 'Мониторинг пожаров',
        isExpanded: true,
        options: [
          {
            id: 'fire_pinpoints',
            label: 'Горячие точки',
          },
          // {
          //   id: "firm-date"
          // }
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