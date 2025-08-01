class api_error {
    constructor(status_code,message = "something went wrong"){
        this.status = status_code
        this.message = message
    }
}

export { api_error }