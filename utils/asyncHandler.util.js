
// Async Handler Wrapper
const asyncHandler = (func) => {
    return async (req, res, next) => {
        try {
            await func(req, res, next);
        } catch (error) {
            console.error("Error caught by asyncHandler:", error); // Optional logging for better debugging
            next(error); // Pass the error to the error-handling middleware
        }
    };
};

export { asyncHandler };