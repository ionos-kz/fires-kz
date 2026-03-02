import { memo, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

import tileList from "./emit_list.json";

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
import SentinelControls from "./SentinelControls/SentinelControls";
import SentinelControls3 from "./SentinelControls/SentinelControls3";
import SentinelControls5 from "./SentinelControls/SentinelControls5";
import SentinelControls1 from "./SentinelControls/SentinelControls1";
import HLSControls from "./SentinelControls/HLSControls";
import FireControls from "./Controls/FireControls/FireControls";
import FireRisk from "./Controls/FireRisk";
import FireModelling from "./Controls/FireControls/FireModelling";
import { useLayersStore } from "../../../../app/store/layersStore";

const DropDown = memo(({ openTabIndex }) => {
  // Store hooks
  const {
    toggleStates,
    toggleOption,
    expandedItems,
    toggleExpandedItem,
    setFireLayerVisible,
    fireLayerVisible,
    fireOpacity,
    setFireOpacity,
    fireIntensityFilter,
    setFireIntensityFilter,
    fireStartDate,
    fireEndDate,
    setFireStartDate,
    setFireEndDate,
    fireHeatmapMode,
    setFireHeatmapMode,
    autoRefresh,
    setAutoRefresh,
    fireLength,
    setDateHasChanged,
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
    changeThird,
    changeOpacity
  } = useAdminBoundaryStore();

  const { layers, updateLayer, changeVisibility } = useLayersStore();

  const satelliteHookData = useSatelliteData();

  useEffect(() => {
    if (!beginDateEmmit || !endDateEmmit) return;

    const matchingIds = tileList
      .filter((item) => {
        const itemDate = dayjs(item.date);
        return (
          itemDate.isAfter(dayjs(beginDateEmmit).subtract(1, "day")) &&
          itemDate.isBefore(dayjs(endDateEmmit).add(1, "day"))
        );
      })
      .map((item) => item.full_string);

    setEmmitLayerIds(matchingIds);
  }, [beginDateEmmit, endDateEmmit, setEmmitLayerIds]);

  const getOpacityValue = useCallback(
    (optionId) => {
      // Check if layer from useLayersStore
      const layer = layers.find(l => l.id === optionId);
      if (layer) {
        return layer.opacity || 1;
      }
      return layerOpacity[optionId];
    },
    [layerOpacity, layers]
  );

  const getToggleState = useCallback(
    (optionId) => {
      // Check if layer from useLayersStore
      const layer = layers.find(l => l.id === optionId);
      if (layer) {
        return layer.visible;
      }
      return toggleStates[optionId] || false;
    },
    [toggleStates, layers]
  );

  const handleOpacityValue = useCallback(
    (optionId, value) => {
      // Check if layer from useLayersStore
      const layer = layers.find(l => l.id === optionId);
      if (layer) {
        updateLayer(optionId, { opacity: value });
      } else {
        changeOpacity(optionId, value);
      }
    },
    [layers, updateLayer, changeOpacity]
  );

  const handleToggleChange = useCallback(
    (optionId) => {
      const layer = layers.find(l => l.id === optionId);
      if (layer) {
        changeVisibility(optionId);
        console.log(optionId)
        return;
      }

      if (optionId === "country_boundaries") {
        changeFirst();
      } else if (optionId === "region_boundaries") {
        changeSecond();
      } else if (optionId === "district_boundaries") {
        changeThird();
      }
      
      toggleOption(optionId);
    },
    [layers, changeVisibility, changeFirst, changeSecond, changeThird, toggleOption]
  );

  const renderOption = useCallback(
    (option) => {
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

        case "sentinel2":
          return <SentinelControls productType={'sentinel2'} />;

        case "sentinel3":
          return <SentinelControls3 />;

        case "sentinel5":
          return <SentinelControls5 />;

        case "sentinel1":
          return <SentinelControls1 />;

        case "hls_landsat":
          return <HLSControls key={option.id} />;

        case "fire_pinpoints":
          return (
            <FireControls
              key={option.id}
              fireLayerVisible={fireLayerVisible}
              setFireLayerVisible={setFireLayerVisible}
              fireOpacity={fireOpacity}
              setFireOpacity={setFireOpacity}
              fireIntensityFilter={fireIntensityFilter}
              setFireIntensityFilter={setFireIntensityFilter}
              fireStartDate={fireStartDate}
              fireEndDate={fireEndDate}
              setFireStartDate={setFireStartDate}
              setFireEndDate={setFireEndDate}
              fireHeatmapMode={fireHeatmapMode}
              setFireHeatmapMode={setFireHeatmapMode}
              autoRefresh={autoRefresh}
              setAutoRefresh={setAutoRefresh}
              fireLength={fireLength}
              setDateHasChanged={setDateHasChanged}
            />
          );    

        case "fire_risk":
          return (
            <FireRisk
              key={option.id}
            />
          );

        case "fire_modelling":
          return (
            <FireModelling
              key={option.id}
            />
          );

        default:
          return (
            <Options
              key={option.id}
              isOpacityOn={option.layerType}
              option={option}
              getToggleState={getToggleState}
              handleToggleChange={handleToggleChange}
              getOpacityValue={getOpacityValue}
              setOpacityValue={handleOpacityValue}
            />
          );
      }
    },
    [
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
      handleOpacityValue,
    ]
  );

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