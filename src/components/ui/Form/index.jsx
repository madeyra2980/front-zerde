import React, { createContext, useContext, useState, useCallback } from 'react';
import './Form.css';

// Form Context
const FormContext = createContext(null);

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a Form component');
  }
  return context;
};

// Form Component
export const Form = ({
  children,
  initialValues = {},
  validationSchema = {},
  onSubmit,
  className = '',
  layout = 'vertical',
  size = 'md',
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setTouchedField = useCallback((name, touched) => {
    setTouched(prev => ({ ...prev, [name]: touched }));
  }, []);

  const validateField = useCallback((name, value) => {
    const validator = validationSchema[name];
    if (validator) {
      const error = validator(value);
      if (error) {
        setError(name, error);
        return false;
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
        return true;
      }
    }
    return true;
  }, [validationSchema, setError]);

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors = {};

    Object.keys(validationSchema).forEach(name => {
      const validator = validationSchema[name];
      const value = values[name];
      const error = validator(value);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationSchema, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationSchema).forEach(name => {
      allTouched[name] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      onSubmit?.(values);
    }
  };

  const contextValue = {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched: setTouchedField,
    validateField,
    validateForm,
    resetForm,
  };

  const baseClasses = 'form';
  const layoutClass = `form--${layout}`;
  const sizeClass = `form--${size}`;

  const classes = [
    baseClasses,
    layoutClass,
    sizeClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <FormContext.Provider value={contextValue}>
      <form className={classes} onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

// Form Item Component
export const FormItem = ({
  name,
  label,
  required = false,
  children,
  className = '',
  help,
}) => {
  const { errors, touched } = useForm();
  
  const hasError = touched[name] && errors[name];
  const errorMessage = hasError ? errors[name] : undefined;

  const baseClasses = 'form-item';
  const errorClass = hasError ? 'form-item--error' : '';

  const classes = [
    baseClasses,
    errorClass,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label && (
        <label className="form-item__label" htmlFor={name}>
          {label}
          {required && <span className="form-item__required">*</span>}
        </label>
      )}
      
      <div className="form-item__control">
        {children}
        {errorMessage && (
          <div className="form-item__error">
            {errorMessage}
          </div>
        )}
        {!errorMessage && help && (
          <div className="form-item__help">
            {help}
          </div>
        )}
      </div>
    </div>
  );
};

// Form Field Component
export const FormField = ({
  name,
  label,
  required = false,
  type = 'text',
  placeholder,
  disabled = false,
  className = '',
  help,
  validation,
}) => {
  const { values, setValue, setTouched, validateField } = useForm();

  const handleChange = (e) => {
    const value = e.target.value;
    setValue(name, value);
    
    if (validation) {
      validateField(name, value);
    }
  };

  const handleBlur = () => {
    setTouched(name, true);
    if (validation) {
      validateField(name, values[name]);
    }
  };

  return (
    <FormItem
      name={name}
      label={label}
      required={required}
      help={help}
      className={className}
    >
      <input
        type={type}
        id={name}
        name={name}
        value={values[name] || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className="form-field__input"
      />
    </FormItem>
  );
};

// Form Actions Component
export const FormActions = ({
  children,
  className = '',
  align = 'right',
}) => {
  const alignClass = `form-actions--${align}`;
  const classes = ['form-actions', alignClass, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

// Form Group Component
export const FormGroup = ({
  children,
  className = '',
  title,
  description,
}) => {
  return (
    <div className={`form-group ${className}`}>
      {title && (
        <div className="form-group__header">
          <h3 className="form-group__title">{title}</h3>
          {description && (
            <p className="form-group__description">{description}</p>
          )}
        </div>
      )}
      <div className="form-group__content">
        {children}
      </div>
    </div>
  );
};

// Validation Helpers
export const validators = {
  required: (message = 'Это поле обязательно') => (value) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return message;
    }
    return undefined;
  },
  
  email: (message = 'Введите корректный email') => (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return message;
    }
    return undefined;
  },
  
  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Минимум ${min} символов`;
    }
    return undefined;
  },
  
  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Максимум ${max} символов`;
    }
    return undefined;
  },
  
  pattern: (regex, message) => (value) => {
    if (value && !regex.test(value)) {
      return message;
    }
    return undefined;
  },
  
  min: (min, message) => (value) => {
    if (value !== undefined && value < min) {
      return message || `Минимальное значение: ${min}`;
    }
    return undefined;
  },
  
  max: (max, message) => (value) => {
    if (value !== undefined && value > max) {
      return message || `Максимальное значение: ${max}`;
    }
    return undefined;
  },

  compose: (...validators) => (value) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    return undefined;
  },
};
