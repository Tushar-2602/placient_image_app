import { async_handler } from "../utils/Async_Handler.js";
import { api_error } from "../utils/Api_Error.js";
import { api_response } from "../utils/Api_Response.js";
import { querry } from "../src/db.js";
import { get_signed_url } from "../utils/aws_s3_url.js";
const send_previous_bought =async_handler (async(req,res)=>{
    const user_id=req.user_id;
    //console.log(user_id);
    
    const images_resp=await querry(`select content_id,timestamp,content_name,channel_name from content_info where content_id IN (select content_id from wallet_transactions where user_id="${user_id}")`);
    if (images_resp==undefined) {
        throw new api_error(666,"something went wrong");
    }
 //console.log("images_resp");
     for (const element of images_resp) {
  element.get_url = await get_signed_url('uploads/' + element.content_id);
     }
    // console.log(images_resp);
     
      return res
             .status(201)
             .json(
                new api_response(201,{images:images_resp}, "sent image data")
)
});

export {
    send_previous_bought
}