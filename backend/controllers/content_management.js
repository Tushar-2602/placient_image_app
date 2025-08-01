import { async_handler } from "../utils/Async_Handler.js";
import { api_error } from "../utils/Api_Error.js";
import { api_response } from "../utils/Api_Response.js";
import { input_data } from "../utils/db_input.js";
import { querry } from "../src/db.js";
import { nanoid } from 'nanoid';
import { delete_S3_content, generate_post_URL } from "../utils/aws_s3_url.js";
import { get_ext } from "../utils/get_file_extension.js";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import CryptoJS from "crypto-js";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const get_signed_url = async_handler(async (req,res)=>{
    const {file_name,file_type} = req.body;
    const {channel_id} = req.cookies;
    const user_id=req.user_id;
    const user_ip=req.ip;
    //console.log("channel_id");
    //console.log(channel_id);
    //console.log(user_id);
    
    const check_user_id_resp=await querry(`SELECT user_id FROM channel_info WHERE channel_id="${channel_id}"`);
    const check_user_id=check_user_id_resp[0].user_id;
    if (check_user_id!=user_id) {
        throw new api_error(443,"illegal operation detected");
    }
    const check_user_allowed_resp=await querry(`SELECT * FROM test_user_allowed WHERE user_id="${user_id}"`);
    if (check_user_allowed_resp==undefined) {
        throw new api_error(444,"something went wrong");
    }
    let check_user_allowed=0;
    if (check_user_allowed_resp.length>0) {
        check_user_allowed=1;
    }
    let memory_alloted=2*1024*1024; // calculate from two tables of allowed space - used space and must be greater than 1 bytes
    const sum_n_count_resp=await querry(`select sum(memory) as sum,count(channel_id) as cnt from s3_uploaded_content where channel_id IN (select channel_id from channel_info where user_id="${user_id}") and deleted=0`);
    if (sum_n_count_resp==undefined) {
        throw new api_error(444,"something went wrong");
    }
    let left_memory=-1;
    if (check_user_allowed==0) {
        const count_files = sum_n_count_resp[0].cnt;
        if (count_files>=2) {
            throw new api_error(444,"reached limit of uploading files");
        }
        const allowed_file_types=['image/png','image/jpeg','image/gif'];
       if (!allowed_file_types.includes(file_type)) {
        throw new api_error(444,"cant upload this file type");
       }
        
    }
    else{
        const allowed_file_types=['image/png','image/jpeg','image/gif'];
       if (!allowed_file_types.includes(file_type)) {
        throw new api_error(444,"cant upload this file type");
       }
        const allowed_memory=check_user_allowed_resp[0].memory;
        const memory_used=sum_n_count_resp[0].sum;
         left_memory=allowed_memory-memory_used;
        if (left_memory>0) {
            memory_alloted=left_memory;
        }
        else{
             throw new api_error(444,"you used all allowed space");
        }
    }
    const timestamp=Date.now();
    let id=nanoid();
    while (id.includes("--")) {
        id=nanoid();
    }
    const ext = get_ext(file_name);
    const unique_file_name=channel_id+"~"+id+"."+ext;
    if (file_name==undefined || file_type==undefined ||
         user_ip==undefined || channel_id==undefined || memory_alloted==undefined || timestamp==undefined ||
         id==undefined|| ext==undefined ) {
        throw new api_error(444,"something went wrong");
    }
    const expiry_time=600;
    const {url,fields}= await generate_post_URL(unique_file_name,file_type,memory_alloted,expiry_time);
    //console.log(url);
    
    if (file_name==undefined || file_type==undefined ||
         user_ip==undefined || channel_id==undefined || memory_alloted==undefined || timestamp==undefined ||
         id==undefined|| ext==undefined || url==undefined || fields==undefined) {
        throw new api_error(440,"something went wrong");
    }
    const add_url_to_db=await querry(`INSERT INTO s3_signed_url VALUES ("${user_id}",${memory_alloted},0,${timestamp},"${unique_file_name}","${user_ip}","${file_type}");`)
    if (add_url_to_db==undefined) {
        throw new api_error(441,"something went wrong");
    }
      return res
     .status(201)
     .json(
        new api_response(201, {url,fields,left_memory}, "URL generated successfully")
    )

});

//https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4

const edit_content_info = async_handler(async (req,res)=>{
    let {content_id,content_name,content_description,price}= req.body;
    // const is_edit_resp=await querry(`SELECT is_editable FROM content_info WHERE content_id="${content_id}"`);
    // if (is_edit_resp==undefined ) {
    //     throw new api_error(446,"something went wrong");
    // }
    price=Number(price);
    // const is_editable=is_edit_resp[0].is_editable;
    // if (is_editable==undefined || is_editable==0) {
    //     throw new api_error(447,"something went wrong");
    // }
    const user_id=req.user_id;
    const substringBeforePercent = str => str.split('~')[0];
     if(content_id==undefined||price<1||price>1000){
        throw new api_error(445,"something went wrong");
    }
    const channel_id=substringBeforePercent(content_id);
    const user_id_resp=await querry(`SELECT user_id,channel_name FROM channel_info WHERE channel_id="${channel_id}"`);
    if (user_id_resp==undefined) {
        throw new api_error(443,"something went wrong");
    }
    const user_id_edit=user_id_resp[0].user_id;
     const channel_name=user_id_resp[0].channel_name;
    if (user_id_edit!=user_id) {
        throw new api_error(440,"something went wrong");
    }
    if(content_description==undefined || user_id==undefined || channel_id==undefined || user_id_edit==undefined || price==undefined || content_name==undefined || price<=0){ // price must not me less than minimum calculated price
        throw new api_error(448,"something went wrong");
    }

    const insert_content_info=await querry(`INSERT INTO content_info VALUES("${content_id}","${content_name}",${price},${Date.now()},"${channel_name}")`);
    //const insert_s3_uploaded=await querry(`UPDATE s3_uploaded_content SET description="${content_description}" WHERE content_id="${content_id}"`);
    if (insert_content_info==undefined) {
        throw new api_error(449,"something went wrong");
    }
      return res
             .status(201)
             .json(
                new api_response(201, "content edited successfully")
)

});


const delete_content = async_handler(async (req,res)=>{
    const {content_id} = req.body;
    const user_id=req.user_id;
    const substringBeforePercent = str => str.split('~')[0];
     if(content_id==undefined){
        throw new api_error(445,"something went wrong");
    }
    const channel_id=substringBeforePercent(content_id);
    //console.log(channel_id,"++",user_id);
    
    const user_id_resp=await querry(`SELECT user_id FROM channel_info WHERE channel_id="${channel_id}"`);
    if (user_id_resp==undefined) {
        throw new api_error(443,"something went wrong");
    }
    const user_id_delete=user_id_resp[0].user_id;
    if (user_id_delete!=user_id) {
        throw new api_error(440,"something went wrong");
    }
    const delete_from_s3=await delete_S3_content("placient-content-bucket","uploads/"+content_id);
    if (delete_from_s3==0) {
         throw new api_error(440,"something went wrong");
    }
    const s3_table_resp=await querry(`UPDATE s3_uploaded_content SET deleted=1 where content_id="${content_id}"`);
    if (s3_table_resp==undefined) {
         throw new api_error(440,"something went wrong");   
    }
    const content_info_resp=await querry(`DELETE FROM content_info where content_id="${content_id}"`);
    if (content_info_resp==undefined) {
         throw new api_error(440,"something went wrong");   
    }
       return res
             .status(201)
             .json(
                new api_response(201, "content deleted successfully")
)
});
export {
    get_signed_url,
    edit_content_info,
    delete_content
}