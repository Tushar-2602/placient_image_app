import { S3Client,DeleteObjectCommand,GetObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {

  }
});
export async function generate_post_URL(file_name, file_type,size,expiry) {
  const { url, fields } = await createPresignedPost(s3, {
    Bucket: "placient-content-bucket",
    Key: `uploads/${file_name}`,
    Conditions: [
      ["content-length-range", 1024,size], // size in bytes
    ["eq", "$key", `uploads/${file_name}`]                          // 🔒 Only allow this exact file path

    ],
    Fields: {
      "Content-Type": file_type
    },
    Expires: expiry // seconds
  });

  return { url, fields };
}
//  const { url, fields }=await generatePostURL("hello.txt","txt");
export async function delete_S3_content(bucketName, key) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  try {
    await s3.send(command);
    //console.log(`✅ Deleted: ${key}`);
    return 1;
  } catch (error) {
    console.error(`❌ Error deleting ${key}:`, error);
    throw 0;
  }
}
export async function get_signed_url (key) {
  const command = new GetObjectCommand({
    Bucket: 'placient-content-bucket',
    Key: key,
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 10 }); // URL valid for 1 minute
  return url;
}

 