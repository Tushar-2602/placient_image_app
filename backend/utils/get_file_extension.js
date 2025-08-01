export const get_ext=(filename)=>{
const ans= filename.includes('.') ? filename.split('.').pop() : '';
if(ans.length==0){
    return undefined;
}
return ans;
}
