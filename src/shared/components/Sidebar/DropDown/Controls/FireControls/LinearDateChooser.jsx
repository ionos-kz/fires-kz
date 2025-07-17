import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

import './LinearDateChooser.scss'

const LinearDateChooser = ({ 
  startDate, 
  endDate, 
  onDateRangeChange, 
  onClose, 
  maxDays = 14 
}) => {
  const [selectedStart, setSelectedStart] = useState(null);
  const [selectedEnd, setSelectedEnd] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredDate, setHoveredDate] = useState(null);
  const scrollRef = useRef(null);

  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    const startRange = new Date(today);
    startRange.setDate(today.getDate() - 30);

    for (let i = 0; i <= 30; i++) {
      const date = new Date(startRange);
      date.setDate(startRange.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dateRange = generateDateRange();

  useEffect(() => {
    if (startDate) setSelectedStart(new Date(startDate));
    if (endDate) setSelectedEnd(new Date(endDate));
  }, [startDate, endDate]);

  useEffect(() => {
    if (scrollRef.current) {
      const targetDate = selectedStart || new Date();
      const dateIndex = dateRange.findIndex(date => 
        date.toDateString() === targetDate.toDateString()
      );
      if (dateIndex !== -1) {
        const scrollPosition = dateIndex * 60 - 200;
        scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }
  }, [selectedStart, dateRange]);

  const handleDateClick = (date) => {
    if (!isSelecting) {
      setSelectedStart(date);
      setSelectedEnd(null);
      setIsSelecting(true);
    } else {
      if (date < selectedStart) {
        setSelectedStart(date);
        setSelectedEnd(selectedStart);
      } else {
        const daysDiff = Math.ceil((date - selectedStart) / (1000 * 60 * 60 * 24));
        if (daysDiff > maxDays) {
          const maxEndDate = new Date(selectedStart);
          maxEndDate.setDate(selectedStart.getDate() + maxDays);
          setSelectedEnd(maxEndDate);
        } else {
          setSelectedEnd(date);
        }
      }
      setIsSelecting(false);
    }
  };

  const handleApply = () => {
    if (selectedStart && selectedEnd) {
      onDateRangeChange(selectedStart, selectedEnd);
      onClose();
    }
  };

  const isDateInRange = (date) => {
    if (!selectedStart || !selectedEnd) return false;
    return date >= selectedStart && date <= selectedEnd;
  };

  const isDateHovered = (date) => {
    if (!isSelecting || !selectedStart || !hoveredDate) return false;
    const start = selectedStart;
    const end = hoveredDate;
    return date >= Math.min(start, end) && date <= Math.max(start, end);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="linear-date-chooser-overlay">
      <div className="linear-date-chooser">
        <div className="linear-date-chooser__header">
          <div className="linear-date-chooser__title">
            <Calendar size={16} />
            Select Date Range (Max {maxDays} days)
          </div>
          <button className="linear-date-chooser__close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="linear-date-chooser__info">
          {selectedStart && selectedEnd ? (
            <div className="linear-date-chooser__range">
              <span className="linear-date-chooser__range-text">
                {formatFullDate(selectedStart)} - {formatFullDate(selectedEnd)}
              </span>
              <span className="linear-date-chooser__range-days">
                ({Math.ceil((selectedEnd - selectedStart) / (1000 * 60 * 60 * 24)) + 1} days)
              </span>
            </div>
          ) : (
            <div className="linear-date-chooser__instruction">
              {isSelecting ? 'Select end date' : 'Select start date'}
            </div>
          )}

          <div className="linear-date-chooser__btns">
            <button 
                className="linear-date-chooser__btn linear-date-chooser__btn--secondary"
                onClick={onClose}
            >
                Cancel
            </button>
            <button 
                className="linear-date-chooser__btn linear-date-chooser__btn--primary"
                onClick={handleApply}
                disabled={!selectedStart || !selectedEnd}
            >
                Apply Range
            </button>
          </div>
        </div>

        <div className="linear-date-chooser__container">
          <button 
            className="linear-date-chooser__nav linear-date-chooser__nav--left"
            onClick={scrollLeft}
          >
            <ChevronLeft size={16} />
          </button>

          <div 
            className="linear-date-chooser__timeline"
            ref={scrollRef}
            onMouseLeave={() => setHoveredDate(null)}
          >
            {dateRange.map((date, index) => {
              const isSelected = (selectedStart && date.toDateString() === selectedStart.toDateString()) ||
                               (selectedEnd && date.toDateString() === selectedEnd.toDateString());
              const isInRange = isDateInRange(date);
              const isHovered = isDateHovered(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`linear-date-chooser__date-item ${
                    isSelected ? 'linear-date-chooser__date-item--selected' : ''
                  } ${
                    isInRange ? 'linear-date-chooser__date-item--in-range' : ''
                  } ${
                    isHovered ? 'linear-date-chooser__date-item--hovered' : ''
                  } ${
                    isToday ? 'linear-date-chooser__date-item--today' : ''
                  }`}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => isSelecting && setHoveredDate(date)}
                >
                  <div className="linear-date-chooser__date-day">
                    {date.getDate()}
                  </div>
                  <div className="linear-date-chooser__date-month">
                    {formatDate(date)}
                  </div>
                  <div className="linear-date-chooser__date-weekday">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            className="linear-date-chooser__nav linear-date-chooser__nav--right"
            onClick={scrollRight}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* <div className="linear-date-chooser__footer">
        </div> */}
      </div>
    </div>
  );
};

export default LinearDateChooser;