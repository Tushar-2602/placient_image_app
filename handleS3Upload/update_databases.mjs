    import { querry } from "./db.js";
    const update_s3_signed_url= async (content_id)=> {
  try {
    const update_done = await querry(`UPDATE s3_signed_url SET done=1 WHERE content_id="${content_id}"`);

    return { statusCode: 200, body: 's3_signed_url updated.' };
  } catch (err) {
    console.error('❌ Error:', err);
    return { statusCode: 500, body: 'something went wrong' };
  }
};

  const update_s3_uploaded_content= async (content_id,size,channel_id)=> {
  try {
   
      const add_info= await querry(`INSERT INTO s3_uploaded_content VALUES("${channel_id}","${content_id}",${size},0,${Date.now()})`);

    return { statusCode: 200, body: 's3_uploaded_content updated.' };
  } catch (err) {
    console.error('❌ Error:', err);
    return { statusCode: 500, body: 'something went wrong' };
  }

  

};

export{
  update_s3_signed_url,
  update_s3_uploaded_content
}