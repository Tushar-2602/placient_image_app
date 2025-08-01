import { Router } from "express";
import { 
    register_user,
    login_user,
    remove_login,
    logout

} from "../controllers/user_controller.js";
import { get_signed_url } from "../controllers/content_management.js";
import { stop_db } from "../controllers/close_database.js";
import { create_channel } from "../controllers/channel_controller.js";
import { verify_JWT } from "../middleware/auth.js";
import { add_coins, purchase } from "../controllers/finance_controller.js";
import { test } from "../get_responses/test_get.js";
import { send_channel_names, send_coins, send_landing_images } from "../get_responses/get_landing_thumnails.js";
import { check_token } from "../get_responses/get_signup.js";
import { send_channel_images_user } from "../get_responses/get_channel_user_content.js";
import { send_previous_bought } from "../get_responses/get_previous_boughts.js";
import { send_video_url } from "../get_responses/get_video_content.js";

const router = Router()

router.route("/register").post(register_user)
router.route("/login").post(login_user)
router.route("/remove_previous_logins").post(remove_login)
router.route("/logout").get(verify_JWT,logout)
router.route("/fhreihiteij55543nejkrgj5434_st_db").post(verify_JWT,stop_db)
router.route("/create_channel").post(verify_JWT,create_channel)
router.route("/purchase").post(verify_JWT,purchase)
router.route("/add_coins").post(verify_JWT,add_coins)
router.route("/test").get(test)
router.route("/get_thumbnails").get(verify_JWT,send_landing_images)
router.route("/get_coins").get(verify_JWT,send_coins)
router.route("/get_channels").get(verify_JWT,send_channel_names)
router.route("/check_token").get(verify_JWT,check_token)
router.route("/get_channel_content_user/:channel_id").get(verify_JWT,send_channel_images_user)
router.route("/get_previous_bought").get(verify_JWT,send_previous_bought)
router.route("/get_content/:content_id").get(verify_JWT,send_video_url)


export default router;