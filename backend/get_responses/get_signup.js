import { api_response } from "../utils/Api_Response.js";
import { async_handler } from "../utils/Async_Handler.js";
const check_token = async_handler(async (req,res)=>{
   return res
    .status(201)
    .json(new api_response(201,{},"ok"))
});

export {
    check_token
}