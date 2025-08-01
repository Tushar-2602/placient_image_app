import { async_handler } from "../utils/Async_Handler.js";
import { api_error } from "../utils/Api_Error.js";
import { api_response } from "../utils/Api_Response.js";
import { input_data } from "../utils/db_input.js";
import { querry } from "../src/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import { nanoid } from "nanoid";
const register_user = async_handler(async (req,res)=>{
   
    
    ////console.log(req.body);
    //console.log("came");
    
    let {name, email, username, password,g_token} = req.body; //we need g_token or name and email but always need password and
    let is_g_token=false;                                     
    if (g_token!=undefined && g_token.length>0) {
        is_g_token=true;
    }
    if (is_g_token==true) {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${g_token}`);
        const user_data = await response.json();
        if (user_data.error!=undefined || user_data.error_description!=undefined || user_data.email_verified!="true" || !user_data.email.toLowerCase().endsWith('@gmail.com')) {
            throw new api_error(431,"can't sign in through google");
        }
        name=user_data.name;
        email=user_data.email;
    }
    //console.log(email);
    name=name.replace(/ /g, '-');
    // console.log(name);
    // console.log(password);
    // console.log(username);
    
  // Matches a name with only letters (A-Z or a-z), 5 to 20 characters long and cant start or end with (-)
const regx_name = /^(?!-)[A-Za-z-]{5,20}(?<!-)$/;

// Matches a basic valid email format (e.g., something@domain.com)
const regx_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Matches a username that:
// - has at least one letter
// - does NOT contain spaces
// - does NOT contain '@'
// - allows letters, digits, dots (.), underscores (_), and hyphens (-)
// - is 4 to 25 characters long
const regx_username = /^(?=.*[A-Za-z])(?!.*\s)(?!.*@)[A-Za-z0-9._\-]{4,25}$/;

// Matches a password that:
// - contains at least one letter
// - contains at least one digit
// - contains at least one special character from the listed set
// - is 8 to 16 characters long
const regx_password = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()~`\[\];'./{}:"?><,\-=_+])[A-Za-z\d!@#$%^&*()~`\[\];'./{}:"?><,\-=_+]{8,16}$/;

    if(!regx_name.test(name?name:" ") || !regx_email.test(email?email:" ") || !regx_password.test(password?password:" ") || !regx_username.test(username?username:" ")){
        throw new api_error(400,"invalid credentials");
    }
    const username_ip=await input_data(username);
    const email_ip=await input_data(email);
    //console.log(req.ip);
    
    const user_exists = await querry(`SELECT user_id FROM user_info WHERE username='${username_ip}' OR email='${email_ip}' OR ip_address="${req.ip}"`);
    if (user_exists.length >0) {
        throw new api_error(451,"user already exists")
    }
    let user_id=nanoid();
    while (user_id.includes("--")) {
        user_id=nanoid();
    }
    const name_ip=await input_data(name);
    const password_ip=await input_data(password);
    const hashed_password = await bcrypt.hash(password_ip, 10);
    let token_id=nanoid();
    while (token_id.includes("--")) {
        token_id=nanoid();
    }
    const access_token=jwt.sign(
        {
           user_id:user_id,
           token_id:token_id,
           timestamp:Date.now()
        },
        '',
        {
            expiresIn: '100D'
        }
    )

    const created_user = await querry(`INSERT INTO user_info VALUES ("${user_id}","${username_ip}","${email_ip}","${name_ip}","${hashed_password}",1,${Date.now()},"${req.ip}")`)
    if (created_user==undefined) {
        throw new api_error(402,"something went wrong");
    }
    let id=nanoid();
    while (id.includes("--")) {
        id=nanoid();
    }
    const created_wallet = await querry(`INSERT INTO user_wallet VALUES ("${user_id}",0,"${id}")`);
    if (created_wallet==undefined) {
        throw new api_error(402,"something went wrong");
    }
     const dead_time=Date.now()+8553600000;
        const user_ip=req.ip;
        const res_user_login_info= await querry(`INSERT INTO user_login_info VALUES ("${user_id}","${user_ip}","${token_id}",${dead_time},${Date.now()})`);
        if (res_user_login_info==undefined) {
            throw new api_error(403,"something went wrong");
        }
     const options = {
        maxAge: 8553600000,
        httpOnly: true,
        secure: true
    }
    // 🔒 Encrypt
const encrypted_access_token = CryptoJS.AES.encrypt(access_token, "").toString();

// 🔓 Decrypt
// const decryptedBytes = CryptoJS.AES.decrypt(encrypted, password);
// const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
     return res
     .status(201)
     .cookie("access_token", access_token, options)
     .json(
        new api_response(201, {access_token:encrypted_access_token}, "User registered Successfully")
    )



    

})

const login_user = async_handler(async (req,res)=>{
    let { access_type,access_id, password,g_token} = req.body; // access type tells whether the access_id is username(true) or email(false)
    let is_g_token=false;                                      //we need g_token or access id ant access type both
    if (g_token!=undefined && g_token.length>0) {
        is_g_token=true;
    }
    if (is_g_token==true) {
        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${g_token}`);
        const user_data = await response.json();
        if (user_data.error!=undefined || user_data.error_description!=undefined || user_data.email_verified!="true" || !user_data.email.toLowerCase().endsWith('@gmail.com')) {
            throw new api_error(431,"cannot sign in through google");
        }
        access_type="0";
        access_id=user_data.email;
    }

    const regx_password = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()~`\[\];'./{}:"?><,\-=_+])[A-Za-z\d!@#$%^&*()~`\[\];'./{}:"?><,\-=_+]{8,16}$/;
    if(!regx_password.test(password?password:" ") && is_g_token==false){
        throw new api_error(452,"invalid credentials");
    }
    if(access_type!="1" && access_type!="0"){
         throw new api_error(419,"something went wrong");
    }
    if (access_type=="1") {
        const regx_username = /^(?=.*[A-Za-z])(?!.*\s)(?!.*@)[A-Za-z0-9._\-]{4,25}$/;
         if(!regx_username.test(access_id?access_id:" ")){
        throw new api_error(452,"invalid credentials u");
    }
    }
    else{
        const regx_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!regx_email.test(access_id?access_id:" ")){
        throw new api_error(452,"invalid credentials e");
    }
    }
    const password_check=is_g_token==false?await input_data(password):"0";
    const access_id_check=await input_data(access_id);
    var hashed_password;
    var user_id;
    var count;
 
    if (access_type=="1") {
        const pass= await querry(`SELECT password,user_id,count FROM user_info WHERE username="${access_id_check}"`);
        if (pass[0]==undefined) {
             throw new api_error(452,"invalid credentials p");
        }
        hashed_password=pass[0].password;
        user_id=pass[0].user_id;
        // console.log("user_id");
        
        count=pass[0].count;
        
    }
    else if(is_g_token || access_type=="0"){
        const pass= await querry(`SELECT password,user_id,count FROM user_info WHERE email="${access_id_check}"`);
        if (pass[0]==undefined) {
             throw new api_error(452,"invalid credentials p");
        }
        hashed_password=pass[0].password;
        user_id=pass[0].user_id;
        // console.log(user_id);
        // console.log(typeof user_id);
        count=pass[0].count;
    }
    const is_black=await querry(`SELECT 1 FROM blacklist WHERE user_id="${user_id}" OR ip_address="${req.ip}"`);
    const is_pass_true = await bcrypt.compare(password_check, hashed_password);
    if (!is_pass_true && is_g_token==false) {
        throw new api_error(452,"invalid credentials p");
    }
    if (is_black.length>0) {
        throw new api_error(400,"you are blocked");
    }

    // ---------------------user enterder correct password-------------------
    let token_id=nanoid();
    while (token_id.includes("--")) {
        token_id=nanoid();
    }
    const access_token=jwt.sign(
        {
           user_id:user_id,
           token_id:token_id,
           timestamp:Date.now()
        },
        '',
        {
            expiresIn: '100D'
        }
    )
    const options = {
        maxAge: 8553600000,
        httpOnly: true,
        secure: true
    }
    if (count==3) {
        const ips=[];
        const res_user_ip= await querry(`SELECT ip_address FROM user_login_info WHERE user_id="${user_id}"`);
        if (res_user_ip==undefined) {
            throw new api_error(407,"something went wrong");
        }
        res_user_ip.forEach(element => {
            ips.push(element.ip_address);
        });
        const encrypted_access_token = CryptoJS.AES.encrypt(access_token, "").toString();
      return res
     .status(202)
     .cookie("access_token", access_token, options)
     .json(
        new api_response(202, {access_token:encrypted_access_token,
            ip_address:ips,
            user_id
        }, "User logged in limit reached")
    )
    }
    else{
        count++;
        const res_user_login= await querry(`UPDATE user_info SET count = ${count} WHERE user_id="${user_id}";`);
        if (res_user_login==undefined) {
            throw new api_error(405,"something went wrong");
        }
        const dead_time=Date.now()+8553600000;
        const user_ip=req.ip;
        const res_user_login_info= await querry(`INSERT INTO user_login_info VALUES ("${user_id}","${user_ip}","${token_id}",${dead_time},${Date.now()})`);
        if (res_user_login_info==undefined) {
            throw new api_error(406,"something went wrong");
        }
        const encrypted_access_token = CryptoJS.AES.encrypt(access_token, "").toString();
        return res
     .status(202)
     .cookie("access_token", access_token, options)
     .json(
        new api_response(202, {access_token:encrypted_access_token}, "User logged in Successfully")
    )
    }
//                ENCRYPT ACCESS TOKENS AND USER ID BEFORE SENDING TO USER
})
const remove_login = async_handler(async (req,res)=>{
        const token = req.cookies?.access_token || req.body?.access_token;
        const {delete_ip,delete_user_id}=req.body;
        if(delete_ip==undefined || delete_user_id==undefined){
             throw new api_error(411,"something went wrong");
        }
        if(token==undefined){
             throw new api_error(409,"something went wrong");
        }
        const data =jwt.verify(token,"");
        if (data==undefined) {
            throw new api_error(413,"something went wrong");
        }
        const user_id=data.user_id;
        const token_id=data.token_id;
        const user_ip=req.ip;
        const timestamp=Number(data.timestamp);
        const dead_time=timestamp+8553600000;
        if (user_id != delete_user_id) {
            throw new api_error(414,"something went wrong");
        }
        const delete_record=await querry(`DELETE FROM user_login_info WHERE user_id="${delete_user_id}" AND ip_address="${delete_ip}";`);
        if (delete_record==undefined) {
            throw new api_error(410,"something went wrong");
        }
        const affected_rows=delete_record.affectedRows;
        if (affected_rows==0) {
            throw new api_error(415,"something went wrong");
        }
        const add_record=await querry(`INSERT INTO user_login_info VALUES ("${user_id}","${user_ip}","${token_id}",${dead_time},${Date.now()})`)
        if (add_record==undefined) {
            throw new api_error(412,"something went wrong");
        }
        const update_count= await querry(`UPDATE user_info SET count = ${(3-affected_rows+1)} WHERE user_id="${user_id}";`);
        if (update_count==undefined) {
            throw new api_error(416,"something went wrong");
        }
        return res
     .status(203)
     .json(
        new api_response(203, {}, "previous login closed successfully")
    )
        
}) 

const logout = async_handler(async (req,res)=>{
    const token = req.cookies?.access_token || req.body?.access_token;
    if(token==undefined){
             throw new api_error(409,"something went wrong");
    }
    const data =jwt.verify(token,"");
        if (data==undefined) {
            throw new api_error(413,"something went wrong");
        }
        const user_id=data.user_id;
        const token_id=data.token_id;
        const delete_record=await querry(`DELETE FROM user_login_info WHERE token_id="${token_id}";`);
        if (delete_record==undefined) {
            throw new api_error(410,"something went wrong");
        }
        const affected_rows=delete_record.affected_rows;
        if (affected_rows==0) {
            throw new api_error(415,"something went wrong");
        }
        const update_count= await querry(`UPDATE user_info SET count = count-1 WHERE user_id="${user_id}";`);
        if (update_count==undefined) {
            throw new api_error(416,"something went wrong");
        }
        const options = {
        maxAge: 8553600000,
        httpOnly: true,
        secure: true
    }
    

      return res
     .status(200)
     .cookie("access_token", "", options)
     .json(
        new api_response(200, {}, "logged out successfully")
    )
});
const delete_user = async_handler(async (req,res)=>{
    //verify from email and token then delete all login from user_login_info and user_info
});

export {
    register_user,
    login_user,
    remove_login,
    logout

}