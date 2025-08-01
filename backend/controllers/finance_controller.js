import { async_handler } from "../utils/Async_Handler.js";
import { api_error } from "../utils/Api_Error.js";
import { api_response } from "../utils/Api_Response.js";
import { nanoid } from "nanoid";
import { querry } from "../src/db.js";
import { input_data } from "../utils/db_input.js";
const add_coins = async_handler(async (req,res)=>{
    // temporary
    const{amount}=req.body;
    const amt=Number(amount);
    const user_id=req.user_id;
    if (amt==undefined || amt<0 || amt>10000 || user_id==undefined) {
        throw new api_error(446,"something went wrong");
    }
    const coins_resp=await querry(`SELECT coins FROM user_wallet WHERE user_id="${user_id}"`);
    if (coins_resp==undefined) {
         throw new api_error(446,"something went wrong");
    }
    const coins=coins_resp[0].coins;
    if (coins>10000) {
      throw new api_error(400,"can't add more coins");
    }
    const add_coins_resp=await querry(`UPDATE user_wallet SET coins=${coins+amt} WHERE user_id="${user_id}"`);
    if (add_coins_resp==undefined) {
         throw new api_error(446,"something went wrong");
    }
      return res
             .status(201)
             .json(
                new api_response(201,{coins:(coins+amt)} ,"wallet updated successfully")
)

    

});
const purchase = async_handler(async (req,res)=>{
        const {content_id}=req.body;
        const user_id = req.user_id;
        const user_ip = req.ip;
        let trans_id=nanoid();
    while (trans_id.includes("--")) {
        trans_id=nanoid();
    }
        const check_bought_resp=await querry(`SELECT * FROM wallet_transactions WHERE content_id="${content_id}" AND user_id="${user_id}"`);
        if (check_bought_resp.length>0) {
          throw new api_error(446,"already bought this");
        }
     const coins_resp=await querry(`SELECT coins FROM user_wallet WHERE user_id="${user_id}"`);
    if (coins_resp==undefined || user_id==undefined || trans_id==undefined || user_ip==undefined) {
         throw new api_error(446,"something went wrong");
    }
    const coins=coins_resp[0].coins;
    const price_resp=await querry(`SELECT price FROM content_info WHERE content_id="${content_id}"`);
    if (price_resp==undefined) {
         throw new api_error(446,"something went wrong");
    }
     const price=price_resp[0].price;
     if (coins<price) {
         throw new api_error(446,"not enough coins");
     }
     const insert_trans=await querry(`INSERT INTO wallet_transactions VALUES("${user_id}","${content_id}",${Date.now()},"${trans_id}",${price},0,"${user_ip}")`);
     if (insert_trans==undefined) {
        throw new api_error(446,"something went wrong");
     }
      const subtract_coins_resp=await querry(`UPDATE user_wallet SET coins=${coins-price} WHERE user_id="${user_id}"`);
    if (subtract_coins_resp==undefined) {
         throw new api_error(446,"something went wrong");
    }
      return res
             .status(201)
             .json(
                new api_response(201,{coins:(coins-price)}, "transaction done successfully")
)
});

export{
    add_coins,
    purchase
}