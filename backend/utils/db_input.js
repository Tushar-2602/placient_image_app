//INPUT TO DATABASE MUST BE A STRING AND OUTPUT WILL ALSO BE A STRING
async function input_data (str) {
  // return (Buffer.from(str, 'utf-8').toString('base64')).toString();
  return str;
}
async function output_data(base64) {
  // return (Buffer.from(base64, 'base64').toString('utf-8')).toString();
  return base64;
}

export{
    input_data,
    output_data
}

