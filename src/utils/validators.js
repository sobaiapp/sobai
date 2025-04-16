// src/utils/validators.js
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  export const validatePassword = (password) => {
    // At least 8 characters with 1 number and 1 special character
    const re = /^(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return re.test(password);
  };
  
  export const validateName = (name) => {
    return name.trim().length >= 2;
  };