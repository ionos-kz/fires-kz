import { memo, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";

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
import FireControls from "./Controls/FireControls/FireControls";
import FireRisk from "./Controls/FireRisk";
import FireModelling from "./Controls/FireControls/FireModelling";

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
  } = useAdminBoundaryStore();

  // console.log(layerVisibility, layerOpacity)
  const satelliteHookData = useSatelliteData();

  const getOpacityValue = useCallback(
    (optionId) => opacityValues[optionId] || 100,
    [opacityValues]
  );
  const getToggleState = useCallback(
    (optionId) => toggleStates[optionId] || false,
    [toggleStates]
  );

  const handleToggleChange = useCallback(
    (optionId) => {
      if (optionId === "fire_pinpoints") setFireLayerVisible();
      if (optionId === "country_boundaries") {
        changeFirst();
      } else if (optionId === "region_boundaries") {
        changeSecond();
      } else if (optionId === "district_boundaries") {
        changeThird();
      }
      toggleOption(optionId);
    },
    [setFireLayerVisible, toggleOption]
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
      setOpacityValue,
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