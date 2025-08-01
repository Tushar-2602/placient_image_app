import { Router } from "express";
import { verify_JWT } from "../middleware/auth.js";
import { delete_content, get_signed_url } from "../controllers/content_management.js";
import { edit_content_info } from "../controllers/content_management.js";
import { send_channel_images } from "../get_responses/get_channel_content.js";
const channel_router = Router()


channel_router.route("/upload").post(verify_JWT,get_signed_url);
channel_router.route("/edit_content").post(verify_JWT,edit_content_info);
channel_router.route("/delete_content").post(verify_JWT,delete_content);
channel_router.route("/get_channel_content").get(verify_JWT,send_channel_images);


export default channel_router;