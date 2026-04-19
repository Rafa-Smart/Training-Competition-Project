export const showSuccess = (message) => {
    alert(`Success: ${message}`);
};

export const showError = (message) => {
    alert(`Error: ${message}`);
};

export const showValidationErrors = (errors) => {
    const errorMessages = Object.values(errors).flat().join('\n');
    alert(`Validation Errors:\n${errorMessages}`);
};