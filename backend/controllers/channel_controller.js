import { async_handler } from "../utils/Async_Handler.js";
import { api_error } from "../utils/Api_Error.js";
import { api_response } from "../utils/Api_Response.js";
import { nanoid } from "nanoid";
import { querry } from "../src/db.js";
import { input_data } from "../utils/db_input.js";
const create_channel = async_handler(async (req,res)=>{
    const user_id=req.user_id;
    const {channel_name}=req.body;
    let channel_id=nanoid();
    while (channel_id.includes("--")) {
        channel_id=nanoid();
    }
    //const channel_name_ip = await input_data(channel_name);
    if (user_id==undefined || channel_name==undefined || channel_id==undefined) {
        throw new api_error(430,"somethind went wrong");
    }
    const check_channel= await querry(`SELECT * FROM channel_info WHERE user_id="${user_id}"`);
    if (check_channel==undefined) {
        throw new api_error(433,"something went wrong");
    }
    if (check_channel.length>0) {
        throw new api_error(400,"currently only one channel is allowed");
    }
    const channel_resp=await querry(`INSERT INTO channel_info VALUES ("${channel_id}","${channel_name}","${user_id}",${Date.now()})`);
    if (channel_resp==undefined) {
         throw new api_error(431,"somethind went wrong");
    }
    const options = {
        maxAge: 8553600000,
httpOnly: true,
        secure: true
    }
    return res
             .status(201)
             .cookie("channel_id",channel_id,options)
             .json(
                new api_response(201, "channel created successfully")
)

});
export{
    create_channel
}