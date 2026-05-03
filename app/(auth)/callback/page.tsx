import {redirect} from "next/navigation";
import {onAuthenticateUser} from "@/actions/auth";

const AuthCallBackPage = async () => {
  const result =  await onAuthenticateUser();

  if(result.status === 200 || result.status ===201){
    return redirect('/home');
  } else {  
    return redirect('/');
  }
}

export default AuthCallBackPage