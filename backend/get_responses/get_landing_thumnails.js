import { async_handler } from "../utils/Async_Handler.js";
import { api_error } from "../utils/Api_Error.js";
import { api_response } from "../utils/Api_Response.js";
import { querry } from "../src/db.js";
import { get_signed_url } from "../utils/aws_s3_url.js";
const send_landing_images =async_handler (async(req,res)=>{
    const images_resp=await querry(`select * from content_info order by timestamp desc limit 9`);
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
    const bought_content_resp=await querry(`select distinct content_id from wallet_transactions where user_id="${req.user_id}" and content_id IN ${content_id_string}`);
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
const send_coins =async_handler (async(req,res)=>{
    const coins_resp=await querry(`select coins from user_wallet where user_id="${req.user_id}"`)
    const coins=coins_resp[0].coins;
      return res
             .status(201)
             .json(
                new api_response(201,{coins:coins}, "sent image data")
)
});
const send_channel_names =async_handler (async(req,res)=>{
    const channel_name_resp=await querry(`select channel_name,channel_id from channel_info where user_id="${req.user_id}"`)
    //console.log(req.user_id);
    const channel_names=[]
    let channel_id="";
    channel_name_resp.forEach(element => {
        channel_names.push(element.channel_name);
        channel_id=element.channel_id;
    });
    const options = {
        maxAge: 8553600000,
httpOnly: true,
        secure: true
    }
      return res
             .status(201)
             .cookie("channel_id",channel_id,options)
             .json(
                new api_response(201,{channel_names}, "sent image data")
)
});


export {send_landing_images,send_coins,send_channel_names};