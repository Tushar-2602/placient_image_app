import { querry } from "../src/db.js"
import { api_error } from "../utils/Api_Error.js"
import { async_handler } from "../utils/Async_Handler.js"
import jwt from "jsonwebtoken"

export const verify_JWT = async_handler(async(req, _, next) => {

       try {
         const token = req.cookies?.access_token || req.body?.access_token
         if (!token) {
             throw new api_error(450, "Unauthorized request")
         }
     
         const decoded_token = jwt.verify(token,"")
         if (decoded_token==undefined) {
             throw new api_error(450,"Invalid cess token")
         }
         if (decoded_token.user_id==undefined) {
             throw new api_error(450,"Invalid accs token")
         }
         const token_id=decoded_token.token_id;
    
         
         const check_login= await querry(`SELECT 1 FROM user_login_info WHERE token_id="${token_id}"`);
               //console.log(check_login);
         if (check_login==undefined || check_login[0]==undefined) {
             throw new api_error(450,"Invalid cess token")
         }
         // const user={
         //     userid:decoded_token.userid,
         // }
         req.user_id = decoded_token.user_id;
         next()
       } catch (error) {
        throw new api_error(450,"Invalid cess token")
       }
    
    
})