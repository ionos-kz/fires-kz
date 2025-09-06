import styles from './SentinelControls.module.scss';
import {
  Satellite, Calendar as CalendarIcon, Database,
  Settings, Image,
} from "lucide-react";
import { formatDate, formatFileSize } from "src/utils/sentinelUtils";

const ProductMetadata = ({ product }) => {

    return (
        <div className={styles.metadata}>
            <div className={styles.metadata__grid}>
            <div className={styles.metadata__item}>
                <div className={styles.metadata__icon}>
                    <Satellite size={16} />
                </div>
                <div className={styles.metadata__content}>
                    <span className={styles.metadata__label}>Платформа</span>
                    <span className={styles.metadata__value}>
                        {product.Platform || "N/A"}
                    </span>
                </div>
            </div>

            <div className={styles.metadata__item}>
                <div className={styles.metadata__icon}>
                <Database size={16} />
                </div>
                <div className={styles.metadata__content}>
                <span className={styles.metadata__label}>Тип продукта</span>
                <span className={styles.metadata__value}>
                    {product.ProductType || "N/A"}
                </span>
                </div>
            </div>

            <div className={styles.metadata__item}>
                <div className={styles.metadata__icon}>
                <Settings size={16} />
                </div>
                <div className={styles.metadata__content}>
                <span className={styles.metadata__label}>Уровень обработки</span>
                <span className={styles.metadata__value}>
                    {product.ProcessingLevel || "N/A"}
                </span>
                </div>
            </div>

            <div className={styles.metadata__item}>
                <div className={styles.metadata__icon}>
                <CalendarIcon size={16} />
                </div>
                <div className={styles.metadata__content}>
                <span className={styles.metadata__label}>Дата загрузк</span>
                <span className={styles.metadata__value}>
                    {formatDate(product.IngestionDate)}
                </span>
                </div>
            </div>

            <div className={styles.metadata__item}>
                <div className={styles.metadata__icon}>
                <span className={styles.metadata__orbitIcon}>🛰️</span>
                </div>
                <div className={styles.metadata__content}>
                <span className={styles.metadata__label}>Орбита</span>
                <span className={styles.metadata__value}>
                    {product.OrbitNumber || "N/A"}
                </span>
                </div>
            </div>

            <div className={styles.metadata__item}>
                <div className={styles.metadata__icon}>
                <span className={styles.metadata__tileIcon}>🗂️</span>
                </div>
                <div className={styles.metadata__content}>
                <span className={styles.metadata__label}>Тайл ID</span>
                <span className={styles.metadata__value}>
                    {product.TileId || "N/A"}
                </span>
                </div>
            </div>

            {product.Size && (
                <div className={styles.metadata__item}>
                <div className={styles.metadata__icon}>
                    <span className={styles.metadata__sizeIcon}>💾</span>
                </div>
                <div className={styles.metadata__content}>
                    <span className={styles.metadata__label}>File Size</span>
                    <span className={styles.metadata__value}>
                    {formatFileSize(product.Size)}
                    </span>
                </div>
                </div>
            )}
            </div>

            {product.ThumbnailUrl && (
            <div className={styles.metadata__thumbnail}>
                <div className={styles.metadata__thumbnailHeader}>
                <Image size={16} />
                <span>Preview</span>
                </div>
                <img
                src={product.ThumbnailUrl}
                alt="Product thumbnail"
                className={styles.metadata__thumbnailImage}
                onError={(e) => (e.target.style.display = "none")}
                />
            </div>
            )}
        </div>
    );
}

export default ProductMetadata;