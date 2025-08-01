import { async_handler } from "../utils/Async_Handler.js";
import { api_error } from "../utils/Api_Error.js";
import { api_response } from "../utils/Api_Response.js";
import { querry } from "../src/db.js";
import { get_signed_url } from "../utils/aws_s3_url.js";
const send_channel_images_user =async_handler (async(req,res)=>{
    const user_id=req.user_id;
    const channel_id=req.params.channel_id;
    //console.log("called")
    const images_resp=await querry(`select content_id,timestamp,content_name,price,channel_name from content_info where content_id like '${channel_id}%'`);
    if (images_resp==undefined) {
        throw new api_error(666,"something went wrong");
    }
    const images_content_id=[];
    images_resp.forEach(element => {
        images_content_id.push(element.content_id);
    });
    if (images_content_id.length==0) {
          return res
             .status(201)
             .json(
                new api_response(201,{images:images_resp}, "sent image data")
)
    }
    let content_id_string="(";
    images_content_id.forEach(element => {
    content_id_string+=('"'+element+'"'+',');
    });
    content_id_string= content_id_string.slice(0, -1);
    content_id_string+=')';
    const bought_content_resp=await querry(`select content_id from wallet_transactions where user_id="${user_id}" and content_id IN ${content_id_string}`);
    const bought_content=[];
    bought_content_resp.forEach(element => {
        bought_content.push(element.content_id);
    });
     for (const element of images_resp) {
   if (bought_content.includes(element.content_id)) {
            element.is_bought=1;
        }
        else element.is_bought=0;
        element.get_url=await get_signed_url('uploads/'+element.content_id);
     }
      return res
             .status(201)
             .json(
                new api_response(201,{images:images_resp}, "sent image data")
)
});

export{
    send_channel_images_user
}