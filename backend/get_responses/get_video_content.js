import { async_handler } from "../utils/Async_Handler.js";
import { api_error } from "../utils/Api_Error.js";
import { api_response } from "../utils/Api_Response.js";
import { querry } from "../src/db.js";
import { get_signed_url } from "../utils/aws_s3_url.js";
const send_video_url =async_handler (async(req,res)=>{
    const content_id=req.params.content_id;
    const user_id=req.user_id;
    // console.log(content_id);
    // console.log(user_id);
    
    const is_user_check=await querry(`select 1 from wallet_transactions where user_id="${user_id}" and content_id="${content_id}"`);
    const is_channel_check=await querry(`select 1 from s3_signed_url where user_id="${user_id}" and content_id="${content_id}"`);
    if (is_channel_check.length==0 && is_user_check.length==0) {
        throw new api_error(442,"something went wrong");
    }
    const full_resp=await querry(`select * from content_info where content_id="${content_id}"`)
    full_resp[0].get_url=await get_signed_url('uploads/'+content_id);
    
    // // console.log(full_resp.get_url);
    
    // if (full_resp.get_url==undefined) {
    //     throw new api_error(443,"something went wrong");
    // }
    const full_resp_obj=full_resp[0];
    return res
    .status(201)
    .json(new api_response(201,{...full_resp_obj},"sent"))
    
});

export {
    send_video_url
}