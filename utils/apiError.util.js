class ApiError extends Error {
    constructor(
        statusCode = 500, // Default to 500 for server errors
        message = "Something went wrong in API",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // Method to return error as a JSON object for response
    toJSON() {
        return {
            statusCode: this.statusCode,
            success: this.success,
            message: this.message,
            errors: this.errors,
        };
    }
}

export { ApiError };