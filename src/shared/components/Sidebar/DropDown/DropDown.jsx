import { memo, useState } from "react";
import {
  Satellite,
  Calendar,
  Grid3x3,
  Search,
  Download,
  ChevronDown,
  Loader,
} from "lucide-react";

import GeoTIFF from "geotiff";

import { OpenEO, Formula } from "@openeo/js-client";
import { DatePicker } from "antd";

const { RangePicker } = DatePicker;

import Options from "../Options/Options";
import { newDD } from "./DropDownData";
import useFireStore from "src/app/store/fireStore";

import styles from "./DropDown.module.scss";
import dayjs from "dayjs";
import ToggleSwitch from "../ToggleSwitch/ToggleSwitch";

import useMethaneStore from "src/app/store/methaneStore";
import OpacityController from "./OpacityController";

let exampleGeometry = { "type": "Polygon", "coordinates": [[[7.637799974419459, 52.01332193589061], [7.62398169352488, 52.00969307661495], [7.619823829597119, 52.00158245346181], [7.590738404820496, 52.00730662092496], [7.563811834154673, 52.001308616165645], [7.573636346303766, 51.992180777860874], [7.569855884060181, 51.98545643508868], [7.543540879611669, 51.96991821995572], [7.577623151858387, 51.93997003636344], [7.559435909709811, 51.931123434089656], [7.556625867211423, 51.92504156203243], [7.564681636267283, 51.9188162156423], [7.577387619476905, 51.9233317429785], [7.588347839936553, 51.918646814268996], [7.595284932021921, 51.92479589461621], [7.621031519108772, 51.917243800385535], [7.656038175955233, 51.91943727698611], [7.67194795756578, 51.92238830466648], [7.686556925502693, 51.9290516727655], [7.690291911499357, 51.93671875429201], [7.699225443980613, 51.936707107569255], [7.687961904959071, 51.94731673700126], [7.675211564663383, 51.94964649247447], [7.678202838213879, 51.976670456099136], [7.667564910410129, 51.97853371878003], [7.660981470643656, 51.98621447362924], [7.660952980726099, 52.00839143191412], [7.652037968822863, 52.01317315906101], [7.637799974419459, 52.01332193589061]]] };
const iconSize = 16;

const DropDown = memo(({ openTabIndex }) => {
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
    setMethaneFlumesVisible,
    methaneYear,
    methaneLayerVisible,
    methaneOpacity,
    methaneFlumesVisible
  } = useMethaneStore();

  const handleDateChange = (date, dateString) => {
    console.log(dateString)
    setMethaneYear(dateString);
  };

  // State for satellite inputs
  const [satelliteInputs, setSatelliteInputs] = useState({
    collection: "COPERNICUS/S2_SR",
    startDate: "2019-06-23",
    endDate: "2019-06-30",
    bands: "B4,B3,B2",
    west: "71.21797",
    south: "50.85761",
    east: "71.78519",
    north: "51.35111",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setSatelliteInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchSatelliteData(satelliteInputs);
      setSearchResult(result);
    } catch (err) {
      console.error("Error searching satellite data:", err);
      setError(err.message || "Failed to search satellite data");
    } finally {
      setIsLoading(false);
    }
  };

  const disabledDateSP = (current) => {
    return current.year() < 2019 || current.year() > 2024;
  };

  const fetchSatelliteData = async (params) => {
    try {
      const con = await OpenEO.connect("https://earthengine.openeo.org");

      await con.authenticateBasic("group1", "test123");

      const bbox = {
        west: parseFloat(params.west),
        south: parseFloat(params.south),
        east: parseFloat(params.east),
        north: parseFloat(params.north),
      };

      const geometry = {
        type: "Polygon",
        coordinates: [
          [
            [bbox.west, bbox.north],
            [bbox.east, bbox.north],
            [bbox.east, bbox.south],
            [bbox.west, bbox.south],
            [bbox.west, bbox.north],
          ],
        ],
      };

      // Parse bands from input
      const bands = params.bands.split(",").map((band) => band.trim());
      const builder = await con.buildProcess();

      // Load collection
      let datacube = builder.load_collection(
        params.collection,
        geometry,
        [params.startDate, params.endDate],
        bands
      );

      // Reduce time dimension if multiple dates are present
      const reducer = function (data) {
        return this.max(data);
      };
      datacube = builder.reduce_dimension(datacube, reducer, "t");

      // Scale values for visualization
      const scale = function (x) {
        return this.linear_scale_range(x, 0, 3000, 0, 255);
      };
      datacube = builder.apply(datacube, scale);

      datacube = builder.save_result(datacube, "PNG");

      const capabilities = con.capabilities();
      const syncSupport = capabilities.hasFeature("computeResult");

      if (syncSupport) {
        const preview = await con.computeResult(datacube);

        // blob url from binary data
        const imagePath = URL.createObjectURL(preview.data);

        return {
          imagePath,
          metadata: {
            collection: params.collection,
            dateRange: `${params.startDate} to ${params.endDate}`,
            bands: params.bands,
          },
        };
      } else {
        throw new Error("Synchronous preview not supported by this backend");
      }
    } catch (error) {
      console.error("OpenEO processing error:", error);
      throw new Error("Failed to process satellite data: " + error.message);
    }
  };

  // temporary url to download
  const handleDownload = () => {
    if (searchResult && searchResult.imagePath) {
      const a = document.createElement("a");
      a.href = searchResult.imagePath;
      a.download = `satellite_${satelliteInputs.collection.replace("/", "_")}_${satelliteInputs.startDate
        }.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const currentSection = newDD.find((section) => section.id === openTabIndex);

  const getOpacityValue = (optionId) => opacityValues[optionId] || 100;
  const getToggleState = (optionId) => toggleStates[optionId] || false;

  const handleToggleChange = (optionId) => {
    if (optionId === "fire_pinpoints") setFireLayerVisible();
    // if (optionId === "sp")
    toggleOption(optionId);
  };

  if (!currentSection) {
    return <div className={styles.dropdown__empty}>No data available</div>;
  }

  return (
    <div className={styles.dropdown}>
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
              className={`${styles.dropdown__icon} ${expandedItems[item.id] ? styles["dropdown__icon--rotated"] : ""
                }`}
            />
          </div>

          {expandedItems[item.id] && (
            <div className={styles.dropdown__options}>
              {item.options.map((option) =>
                option.id === "copernicus_image" ? (
                  <div key={option.id} className={styles.satellite__container}>
                    <div className={styles.dropdown__input}>
                      <div className={styles.input__group}>
                        <Satellite size={iconSize} />
                        <label htmlFor="satellite-collection">
                          Collection:
                        </label>
                        <select
                          id="satellite-collection"
                          value={satelliteInputs.collection}
                          onChange={(e) =>
                            handleInputChange("collection", e.target.value)
                          }
                        >
                          <option value="COPERNICUS/S2_SR">
                            Sentinel-2 Surface Reflectance
                          </option>
                          <option value="SENTINEL1_GRD">Sentinel-1 GRD</option>
                          <option value="SENTINEL2_L2A">Sentinel-2 L2A</option>
                          <option value="SENTINEL3_OLCI">
                            Sentinel-3 OLCI
                          </option>
                        </select>
                      </div>
                      <div className={styles.input__row}>
                        <div className={styles.input__group}>
                          <Calendar size={iconSize} />
                          <label htmlFor="start-date">Start:</label>
                          <input
                            id="start-date"
                            type="date"
                            value={satelliteInputs.startDate}
                            onChange={(e) =>
                              handleInputChange("startDate", e.target.value)
                            }
                          />
                        </div>
                        <div className={styles.input__group}>
                          <Calendar size={iconSize} />
                          <label htmlFor="end-date">End:</label>
                          <input
                            id="end-date"
                            type="date"
                            value={satelliteInputs.endDate}
                            onChange={(e) =>
                              handleInputChange("endDate", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.input__group}>
                        <Grid3x3 size={iconSize} />
                        <label htmlFor="bands-input">Bands:</label>
                        <input
                          id="bands-input"
                          value={satelliteInputs.bands}
                          onChange={(e) =>
                            handleInputChange("bands", e.target.value)
                          }
                          placeholder="B2,B4,B8"
                        />
                      </div>
                      <div className={styles.input__row}>
                        <div className={styles.input__group}>
                          <label htmlFor="west-input">West:</label>
                          <input
                            id="west-input"
                            type="number"
                            step="0.01"
                            value={satelliteInputs.west}
                            onChange={(e) =>
                              handleInputChange("west", e.target.value)
                            }
                          />
                        </div>
                        <div className={styles.input__group}>
                          <label htmlFor="east-input">East:</label>
                          <input
                            id="east-input"
                            type="number"
                            step="0.01"
                            value={satelliteInputs.east}
                            onChange={(e) =>
                              handleInputChange("east", e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.input__row}>
                        <div className={styles.input__group}>
                          <label htmlFor="north-input">North:</label>
                          <input
                            id="north-input"
                            type="number"
                            step="0.01"
                            value={satelliteInputs.north}
                            onChange={(e) =>
                              handleInputChange("north", e.target.value)
                            }
                          />
                        </div>
                        <div className={styles.input__group}>
                          <label htmlFor="south-input">South:</label>
                          <input
                            id="south-input"
                            type="number"
                            step="0.01"
                            value={satelliteInputs.south}
                            onChange={(e) =>
                              handleInputChange("south", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.dropdown__buttons}>
                      <button
                        className={styles.button__search}
                        onClick={handleSearch}
                        disabled={isLoading}
                        title="Search for imagery"
                      >
                        {isLoading ? (
                          <Loader size={iconSize} className={styles.spinner} />
                        ) : (
                          <Search size={iconSize} />
                        )}
                        <span>{isLoading ? "Processing..." : "Search"}</span>
                      </button>
                      <button
                        className={`${styles.button__download} ${!searchResult && styles.button__disabled
                          }`}
                        onClick={handleDownload}
                        disabled={!searchResult}
                        title="Download imagery"
                      >
                        <Download size={iconSize} />
                        <span>Download</span>
                      </button>
                    </div>

                    {error && (
                      <div className={styles.error__message}>{error}</div>
                    )}

                    {searchResult && (
                      <div className={styles.result__container}>
                        <h4>Result Preview</h4>
                        <img
                          src={searchResult.imagePath}
                          alt="Satellite imagery result"
                          className={styles.result__image}
                        />
                        <div className={styles.result__metadata}>
                          <p>
                            <strong>Collection:</strong>{" "}
                            {searchResult.metadata.collection}
                          </p>
                          <p>
                            <strong>Date Range:</strong>{" "}
                            {searchResult.metadata.dateRange}
                          </p>
                          <p>
                            <strong>Bands:</strong>{" "}
                            {searchResult.metadata.bands}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
                  // : option.id === "firm-date" ? (
                  //   <DatePicker 
                  //     value={fireDate}
                  //     onChange={(date) => setFireDate(date)}
                  //     format="YYYY-MM-DD"
                  //     disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
                  //   />
                  // ) 
                  : option.id === "sp" ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>Растеровый слой выбросов </div>
                        <ToggleSwitch
                          isChecked={methaneLayerVisible}
                          onChange={setMethaneLayerVisible}
                        />
                      </div>
                      <DatePicker
                        value={dayjs(methaneYear)}
                        picker="year"
                        disabledDate={disabledDateSP}
                        onChange={handleDateChange}
                      />
                      <OpacityController
                        id="sp"
                        opacityValue={methaneOpacity}
                        setOpacityValue={setMethaneOpacity}
                      />
                      {methaneLayerVisible && (
                        <div className={styles["methane-legend"]}>
                          <img src="/map_attributes/methane_legend_2.png" width={250} />
                        </div>
                      )}
                      <hr color="gray"/>
                    </>
                  )

                    : option.id === 'sp_flumes' ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div> Шлейфы метановых выбросов </div>
                          <ToggleSwitch
                            isChecked={methaneFlumesVisible}
                            onChange={setMethaneFlumesVisible}
                          />
                        </div>
                      </>
                    )
                      : (
                        <Options
                          key={option.id}
                          option={option}
                          getToggleState={getToggleState}
                          handleToggleChange={handleToggleChange}
                          getOpacityValue={getOpacityValue}
                          setOpacityValue={setOpacityValue}
                        />
                      )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

DropDown.displayName = "DropDown";

export default DropDown;
