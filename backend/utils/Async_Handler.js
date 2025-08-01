import { json } from "express";

const async_handler = (request_handler) => {
    return (req, res, next) => {
        Promise.resolve(request_handler(req, res, next)).catch((err) => {
            console.log(err);
            if (err.message && err.status) {
                if(err.status!=450 && err.status!=451 && err.status!=452){
                    err.status=400;
                }
                //console.log(err.status);
                
                   return res
                    .status(200)
                    .json(err)
            }
            else return res.status(405).send("something korribly went wrong");


            // if (err.status_code==400) {
            //     next(err.message);
            // }
            
        //    else next("something went horribly wrong")
        })
    }
}


export { async_handler }
