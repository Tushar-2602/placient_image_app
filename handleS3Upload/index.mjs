import {  detect_file_type_and_delete } from "./check_file_type.js";
import { update_s3_signed_url,update_s3_uploaded_content } from "./update_databases.mjs";
import { close_db } from "./db.js";
export async function handler(event) {
  try {
    const record = event.Records[0];
    const bucket_name = record.s3.bucket.name;
    const file_name = record.s3.object.key.replace(/\+/g, ' ');
    const size = record.s3.object.size;

    const content_id=file_name.replace(/^uploads\//, '');
    const substringBeforePercent = str => str.split('~')[0];
    const channel_id=substringBeforePercent(content_id);

    const e=await detect_file_type_and_delete(bucket_name,file_name,content_id)
    const b=await update_s3_signed_url(content_id);
    const c=await update_s3_uploaded_content(content_id,size,channel_id);    
    return { statusCode: 200, body: 'Processed file successfully.' };
  } catch (err) {
    console.error('❌ Error:', err);
    return { statusCode: 500, body: 'something went wrong.' };
  }
};


