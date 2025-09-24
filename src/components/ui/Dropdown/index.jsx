import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

export const Dropdown = ({
  options,
  value,
  placeholder = 'Выберите опцию',
  onChange,
  disabled = false,
  error,
  label,
  helperText,
  size = 'md',
  variant = 'default',
  searchable = false,
  clearable = false,
  multiple = false,
  className = '',
  name,
  id,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionRefs = useRef([]);

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option.value === value);
  const selectedOptions = multiple && Array.isArray(value)
    ? options.filter(option => value.includes(option.value))
    : [];

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setFocusedIndex(-1);
    }
  };

  const handleSelect = (option) => {
    if (option.disabled) return;

    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange?.(newValues, option);
    } else {
      onChange?.(option.value, option);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (multiple) {
      onChange?.([], { value: '', label: '' });
    } else {
      onChange?.('', { value: '', label: '' });
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[focusedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchTerm('');
        setFocusedIndex(-1);
        break;
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setFocusedIndex(-1);
  };

  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [focusedIndex]);

  const baseClasses = 'dropdown';
  const sizeClass = `dropdown--${size}`;
  const variantClass = `dropdown--${variant}`;
  const errorClass = error ? 'dropdown--error' : '';
  const disabledClass = disabled ? 'dropdown--disabled' : '';
  const openClass = isOpen ? 'dropdown--open' : '';

  const classes = [
    baseClasses,
    sizeClass,
    variantClass,
    errorClass,
    disabledClass,
    openClass,
    className,
  ].filter(Boolean).join(' ');

  const renderValue = () => {
    if (multiple && selectedOptions.length > 0) {
      return (
        <div className="dropdown__value dropdown__value--multiple">
          {selectedOptions.map((option, index) => (
            <span key={option.value} className="dropdown__tag">
              {option.label}
              <button
                type="button"
                className="dropdown__tag-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(option);
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      );
    }

    if (selectedOption) {
      return (
        <div className="dropdown__value">
          {selectedOption.icon && (
            <span className="dropdown__value-icon">{selectedOption.icon}</span>
          )}
          <span className="dropdown__value-text">{selectedOption.label}</span>
        </div>
      );
    }

    return (
      <div className="dropdown__placeholder">
        {placeholder}
      </div>
    );
  };

  return (
    <div className="dropdown-wrapper">
      {label && (
        <label htmlFor={id} className="dropdown-label">
          {label}
          {required && <span className="dropdown-required">*</span>}
        </label>
      )}
      
      <div
        ref={dropdownRef}
        className={classes}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <div className="dropdown__trigger" onClick={handleToggle}>
          <div className="dropdown__content">
            {renderValue()}
          </div>
          
          <div className="dropdown__actions">
            {clearable && (selectedOption || (multiple && selectedOptions.length > 0)) && (
              <button
                type="button"
                className="dropdown__clear"
                onClick={handleClear}
                tabIndex={-1}
                title="Очистить"
              >
                <svg className="dropdown__clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            
            <div className="dropdown__arrow">
              <svg className="dropdown__arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </div>
          </div>
        </div>
        
        {isOpen && (
          <div className="dropdown__menu">
            {searchable && (
              <div className="dropdown__search">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="dropdown__search-input"
                  placeholder="Поиск..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            )}
            
            <div className="dropdown__options">
              {filteredOptions.length === 0 ? (
                <div className="dropdown__empty">
                  {searchTerm ? 'Ничего не найдено' : 'Нет опций'}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.includes(option.value)
                    : value === option.value;
                  const isFocused = index === focusedIndex;

                  return (
                    <div
                      key={option.value}
                      ref={el => { optionRefs.current[index] = el; }}
                      className={`dropdown__option ${
                        isSelected ? 'dropdown__option--selected' : ''
                      } ${
                        isFocused ? 'dropdown__option--focused' : ''
                      } ${
                        option.disabled ? 'dropdown__option--disabled' : ''
                      }`}
                      onClick={() => handleSelect(option)}
                    >
                      {option.icon && (
                        <span className="dropdown__option-icon">
                          {option.icon}
                        </span>
                      )}
                      
                      <div className="dropdown__option-content">
                        <div className="dropdown__option-label">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="dropdown__option-description">
                            {option.description}
                          </div>
                        )}
                      </div>
                      
                      {isSelected && (
                        <div className="dropdown__option-check">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20,6 9,17 4,12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="dropdown-message">
          {error && <span className="dropdown-error">{error}</span>}
          {!error && helperText && (
            <span className="dropdown-helper">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
};
