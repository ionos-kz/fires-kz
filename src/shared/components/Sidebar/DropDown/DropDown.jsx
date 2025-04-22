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
import { OpenEO, Formula } from "@openeo/js-client";

import Options from "../Options/Options";
import { newDD } from "./DropDownData";
import useFireStore from "src/app/store/fireStore";

import styles from "./DropDown.module.scss";

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

  // State for satellite inputs
  const [satelliteInputs, setSatelliteInputs] = useState({
    collection: "COPERNICUS/S2_SR",
    startDate: "2019-06-23",
    endDate: "2019-06-30",
    bands: "B2,B3,B4",
    west: "71.3000",
    south: "51.0000",
    east: "71.6500",
    north: "51.2500",
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

      // Apply processing based on collection type
      if (
        params.collection === "COPERNICUS/S2_SR" &&
        bands.includes("B2") &&
        bands.includes("B3") &&
        bands.includes("B4")
      ) {
        datacube = builder
          .filter_bands(datacube, ["B4", "B3", "B2"])
          .description("RGB composite using B4 (Red), B3 (Green), B2 (Blue)");
      } else if (
        params.collection.includes("SENTINEL1") &&
        bands.length >= 3
      ) {
        // You can adapt this for RGB from Sentinel-1 polarizations (e.g., VV, VH, etc.)
        datacube = builder
          .filter_bands(datacube, [bands[0], bands[1], bands[2]])
          .description(`Pseudo-RGB composite using ${bands[0]}, ${bands[1]}, ${bands[2]}`);
      }

      // Reduce time dimension if multiple dates are present
      const reducer = function (data) {
        return this.max(data);
      };
      datacube = builder.reduce_dimension(datacube, reducer, "t");

      // Scale values for visualization
      const scale = function (x) {
        return this.linear_scale_range(x, -1, 1, 0, 255);
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
      a.download = `satellite_${satelliteInputs.collection.replace("/", "_")}_${
        satelliteInputs.startDate
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
    if (optionId === "firms1") setFireLayerVisible();
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
              className={`${styles.dropdown__icon} ${
                expandedItems[item.id] ? styles["dropdown__icon--rotated"] : ""
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
                        className={`${styles.button__download} ${
                          !searchResult && styles.button__disabled
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
                ) : (
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
