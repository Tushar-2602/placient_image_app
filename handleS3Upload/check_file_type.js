import { S3Client, GetObjectCommand,DeleteObjectCommand } from '@aws-sdk/client-s3';
import { fileTypeFromBuffer } from 'file-type';
import { querry } from './db.js';

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
  
  }
}); // change region if needed

// Convert S3 stream to buffer
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// Get file type from the first 4100 bytes
export async function detect_file_type_and_delete(bucket, key,content_id) {
  const commandg = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    Range: "bytes=0-4096"  // Read only the first ~4 KB
  });

  const response = await s3.send(commandg);
  const buffer = await streamToBuffer(response.Body);
  const type = await fileTypeFromBuffer(buffer);

  const true_file_mime = type?.mime || 'unknown';
  //console.log("MIME = " + true_file_mime);
  const s3_signed_url_resp=await querry(`SELECT content_type,user_id,ip_address FROM s3_signed_url where content_id="${content_id}"`);
  const expected_file_mime=s3_signed_url_resp[0].content_type;
  if (true_file_mime!=expected_file_mime) {
    const user_ip=s3_signed_url_resp[0].ip_address;
    const user_id=s3_signed_url_resp[0].user_id;
    const add_to_blacklist = await querry(`INSERT INTO blacklist VALUES("${user_id}","${user_ip}")`);
    const remove_login = await querry(`delete from user_login_info where user_id="${user_id}"`);
    const content = await querry(`delete from content_info where content_id="${content_id}"`);
    const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  });
  try {
    await s3.send(command);
    //console.log(`✅ Deleted: ${key}`);
    return "wrong file type so deleted";
  } catch (error) {
    console.error(`❌ Error deleting ${key}:`, error);
    throw "wrong file type but cant delete";
  }
  }
  
}
