/**
 * GENERIC FORM STATE HOOK
 * Reusable form state management with validation
 */

import { useState, useCallback, useMemo } from 'react';
import { isNotEmpty, isValidEmail } from '../lib/utils';

/**
 * useFormState - Generic form state management
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Object} validationRules - Validation rules per field
 * @returns {Object} Form state and handlers
 */
export function useFormState(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update single field
  const setValue = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when field is modified
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  // Update multiple fields
  const setMultipleValues = useCallback((updates) => {
    setValues(prev => ({ ...prev, ...updates }));
  }, []);

  // Mark field as touched
  const setFieldTouched = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  // Reset form to initial values
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Validate single field
  const validateField = useCallback((field, value) => {
    const rules = validationRules[field];
    if (!rules) return null;

    if (rules.required && !isNotEmpty(value)) {
      return rules.requiredMessage || `${field} is required`;
    }

    if (rules.email && value && !isValidEmail(value)) {
      return 'Invalid email address';
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return rules.patternMessage || 'Invalid format';
    }

    if (rules.custom) {
      return rules.custom(value, values);
    }

    return null;
  }, [validationRules, values]);

  // Validate all fields
  const validate = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values, validateField]);

  // Handle blur - validate on blur
  const handleBlur = useCallback((field) => {
    setFieldTouched(field);
    const error = validateField(field, values[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  }, [setFieldTouched, validateField, values]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(validationRules).every(field => {
      return !validateField(field, values[field]);
    });
  }, [validationRules, values, validateField]);

  // Check if form is dirty (values changed from initial)
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key]);
  }, [values, initialValues]);

  // Get field props for easy binding
  const getFieldProps = useCallback((field) => ({
    value: values[field] ?? '',
    onChange: (e) => {
      const value = e?.target?.value ?? e;
      setValue(field, value);
    },
    onBlur: () => handleBlur(field),
    error: touched[field] && errors[field],
  }), [values, touched, errors, setValue, handleBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    
    // Setters
    setValue,
    setMultipleValues,
    setFieldTouched,
    setErrors,
    setIsSubmitting,
    
    // Actions
    reset,
    validate,
    handleBlur,
    getFieldProps
  };
}

/**
 * useDialogForm - Form state with dialog open/close management
 */
export function useDialogForm(initialValues = {}, validationRules = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const form = useFormState(initialValues, validationRules);

  const open = useCallback((prefilledValues = {}) => {
    form.setMultipleValues({ ...initialValues, ...prefilledValues });
    setIsOpen(true);
  }, [form, initialValues]);

  const close = useCallback(() => {
    setIsOpen(false);
    form.reset();
  }, [form]);

  return {
    ...form,
    isOpen,
    open,
    close,
    setIsOpen
  };
}