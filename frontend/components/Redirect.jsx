import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router";

export function Redirect() {
    const Navigate=useNavigate();
useEffect(()=>{
Navigate('/')
},[])
    return(
        <></>
    );
};
