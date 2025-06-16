import { memo, useEffect, useCallback } from "react";
import {
  ChevronDown,
} from "lucide-react";

import tileList from './emit_list.json';

import Options from "../Options/Options";
import { newDD } from "./DropDownData";
import useFireStore from "src/app/store/fireStore";
import SatelliteInputForm from "./SatelliteInputForm";
import Sentinel2Controls from "./Sentinel2Controls";
import MethaneControls from "./MethaneControls";
import MethaneLegend from "./MethaneLegend";
import EmitControls from "./EmitControls";

import styles from "./DropDown.module.scss";
import dayjs from "dayjs";

import useAdminBoundaryStore from "src/app/store/adminBoundaryStore";
import useMethaneStore from "src/app/store/methaneStore";
import { useSatelliteData } from "./useSatelliteData";
import AdministrativeBoundaries from "./AdminBoundaryControls";
import SentinelControrls from "./SentinelControls";

let exampleGeometry = { "type": "Polygon", "coordinates": [[[7.637799974419459, 52.01332193589061], [7.62398169352488, 52.00969307661495], [7.619823829597119, 52.00158245346181], [7.590738404820496, 52.00730662092496], [7.563811834154673, 52.001308616165645], [7.573636346303766, 51.992180777860874], [7.569855884060181, 51.98545643508868], [7.543540879611669, 51.96991821995572], [7.577623151858387, 51.93997003636344], [7.559435909709811, 51.931123434089656], [7.556625867211423, 51.92504156203243], [7.564681636267283, 51.9188162156423], [7.577387619476905, 51.9233317429785], [7.588347839936553, 51.918646814268996], [7.595284932021921, 51.92479589461621], [7.621031519108772, 51.917243800385535], [7.656038175955233, 51.91943727698611], [7.67194795756578, 51.92238830466648], [7.686556925502693, 51.9290516727655], [7.690291911499357, 51.93671875429201], [7.699225443980613, 51.936707107569255], [7.687961904959071, 51.94731673700126], [7.675211564663383, 51.94964649247447], [7.678202838213879, 51.976670456099136], [7.667564910410129, 51.97853371878003], [7.660981470643656, 51.98621447362924], [7.660952980726099, 52.00839143191412], [7.652037968822863, 52.01317315906101], [7.637799974419459, 52.01332193589061]]] };

const DropDown = memo(({ openTabIndex }) => {
  // Store hooks
  const {
    opacityValues,
    setOpacityValue,
    toggleStates,
    toggleOption,
    expandedItems,
    toggleExpandedItem,
    setFireLayerVisible,
  } = useFireStore();

  const {
    setMethaneYear,
    setMethaneLayerVisible,
    setMethaneOpacity,
    methaneYear,
    methaneLayerVisible,
    methaneOpacity,
    emmitLayerVisible,
    emmitLayerIds,
    beginDateEmmit,
    endDateEmmit,
    setEmmitLayerIds,
    setEmmitLayerVisible,
    setBeginDateEmmit,
    setEndDateEmmit,
    emitSn2LayerVisible,
    emitSn2Opacity,
    setEmitSn2LayerVisible,
    setEmitSn2Opacity,
  } = useMethaneStore();

  const {
    layerVisibility,
    layerOpacity,
    changeFirst,
    changeSecond,
    changeThird
  } = useAdminBoundaryStore();
  
  // console.log(layerVisibility, layerOpacity)
  const satelliteHookData = useSatelliteData();

  useEffect(() => {
    if (!beginDateEmmit || !endDateEmmit) return;

    const matchingIds = tileList
      .filter(item => {
        const itemDate = dayjs(item.date);
        return itemDate.isAfter(dayjs(beginDateEmmit).subtract(1, 'day')) &&
               itemDate.isBefore(dayjs(endDateEmmit).add(1, 'day'));
      })
      .map(item => item.full_string);

    setEmmitLayerIds(matchingIds);
  }, [beginDateEmmit, endDateEmmit, setEmmitLayerIds]);

  const getOpacityValue = useCallback((optionId) => opacityValues[optionId] || 100, [opacityValues]);
  const getToggleState = useCallback((optionId) => toggleStates[optionId] || false, [toggleStates]);

  const handleToggleChange = useCallback((optionId) => {
    if (optionId === "fire_pinpoints") setFireLayerVisible();
    if (optionId === 'country_boundaries') {
      changeFirst();
    } else if (optionId === 'region_boundaries') {
      changeSecond();
    } else if (optionId === 'district_boundaries') {
      changeThird()
    }
    toggleOption(optionId);
  }, [setFireLayerVisible, toggleOption]);

  const renderOption = useCallback((option) => {
    switch (option.id) {
      case "copernicus_image":
        return <SatelliteInputForm key={option.id} {...satelliteHookData} />;
      
      case "sp":
        return (
          <MethaneControls
            key={option.id}
            methaneLayerVisible={methaneLayerVisible}
            setMethaneLayerVisible={setMethaneLayerVisible}
            methaneYear={methaneYear}
            setMethaneYear={setMethaneYear}
            methaneOpacity={methaneOpacity}
            setMethaneOpacity={setMethaneOpacity}
          />
        );
      
      case "sp_sn2":
        return (
          <Sentinel2Controls
            key={option.id}
            emitSn2LayerVisible={emitSn2LayerVisible}
            setEmitSn2LayerVisible={setEmitSn2LayerVisible}
            emitSn2Opacity={emitSn2Opacity}
            setEmitSn2Opacity={setEmitSn2Opacity}
          />
        );
      
      case "sp_instances":
        return (
          <EmitControls
            key={option.id}
            emmitLayerVisible={emmitLayerVisible}
            setEmmitLayerVisible={setEmmitLayerVisible}
            beginDateEmmit={beginDateEmmit}
            endDateEmmit={endDateEmmit}
            setBeginDateEmmit={setBeginDateEmmit}
            setEndDateEmmit={setEndDateEmmit}
            emmitLayerIds={emmitLayerIds}
          />
        );

      case 'sentinel2':
        return (
          <SentinelControrls 
            
          />
        )
      
      // case "boundaries":
      //   console.log(option.types)
      //   return (
      //     <AdministrativeBoundaries
      //       key={option.id}
      //       option={option}
      //       getToggleState={getToggleState}
      //       handleToggleChange={handleToggleChange}
      //       getOpacityValue={getOpacityValue}
      //       setOpacityValue={setOpacityValue}

      //     />
      //   )
      
      default:
        return (
          <Options
            key={option.id}
            option={option}
            getToggleState={getToggleState}
            handleToggleChange={handleToggleChange}
            getOpacityValue={getOpacityValue}
            setOpacityValue={setOpacityValue}
          />
        );
    }
  }, [
    satelliteHookData,
    methaneLayerVisible,
    setMethaneLayerVisible,
    methaneYear,
    setMethaneYear,
    methaneOpacity,
    setMethaneOpacity,
    emitSn2LayerVisible,
    setEmitSn2LayerVisible,
    emitSn2Opacity,
    setEmitSn2Opacity,
    emmitLayerVisible,
    setEmmitLayerVisible,
    beginDateEmmit,
    endDateEmmit,
    setBeginDateEmmit,
    setEndDateEmmit,
    emmitLayerIds,
    getToggleState,
    handleToggleChange,
    getOpacityValue,
    setOpacityValue,
  ]);

  const currentSection = newDD.find((section) => section.id === openTabIndex);

  if (!currentSection) {
    return <div className={styles.dropdown__empty}>No data available</div>;
  }

  return (
    <div className={styles.dropdown}>
      <MethaneLegend
        methaneLayerVisible={methaneLayerVisible}
        emitSn2LayerVisible={emitSn2LayerVisible}
        emmitLayerVisible={emmitLayerVisible}
      />
      
      {currentSection.items.map((item) => (
        <div key={item.id} className={styles.dropdown__item}>
          <div
            className={styles.dropdown__heading}
            onClick={() => toggleExpandedItem(item.id)}
            aria-expanded={expandedItems[item.id]}
          >
            <h3>{item.label_ru}</h3>
            <ChevronDown
              size={18}
              className={`${styles.dropdown__icon} ${
                expandedItems[item.id] ? styles["dropdown__icon--rotated"] : ""
              }`}
            />
          </div>

          {expandedItems[item.id] && (
            <div className={styles.dropdown__options}>
              {item.options.map(renderOption)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});


DropDown.displayName = "DropDown";

export default DropDown;
