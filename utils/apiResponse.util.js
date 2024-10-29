// Custom API Response Class
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }

    // Static helper methods for different types of responses
    static success(data, message = "Success") {
        return new ApiResponse(200, data, message);
    }

    static created(data, message = "Created Successfully") {
        return new ApiResponse(201, data, message);
    }

    static badRequest(errors, message = "Bad Request") {
        return new ApiResponse(400, null, message, errors);
    }

    static serverError(errors, message = "Internal Server Error") {
        return new ApiResponse(500, null, message, errors);
    }

    // Method to return response as a JSON object
    toJSON() {
        return {
            statusCode: this.statusCode,
            success: this.success,
            message: this.message,
            data: this.data,
        };
    }
}

export { ApiResponse };