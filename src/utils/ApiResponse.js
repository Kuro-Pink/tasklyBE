class ApiResponse {
  constructor(statusCode, data, message = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }
}

export default ApiResponse;
