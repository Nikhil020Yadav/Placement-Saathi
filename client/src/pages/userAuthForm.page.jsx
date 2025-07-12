import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png"
import { Link } from "react-router-dom"
import { toast, Toaster } from 'react-hot-toast'
import axios from 'axios';
import { storeInSession } from "../common/session";
import { UserContext } from '../App.jsx'
import { Navigate } from "react-router-dom";
import { authWithGoogle } from "../common/firebase.jsx";
const UserAuthForm = ({ type }) => {
    const authForm = useRef();
    let { userAuth: { access_token }, setUserAuth } = useContext(UserContext)

    console.log(access_token);

    const userAuthThroughServer = (serverRoute, formData) => {
        console.log(import.meta.env.VITE_SERVER_URL + serverRoute, formData);

        axios.post(import.meta.env.VITE_SERVER_URL + serverRoute, formData)
            .then(({ data }) => {


                storeInSession('user', JSON.stringify(data))
                // console.log(sessionStorage);
                setUserAuth(data)

            })
            .catch(({ response }) => {
                if (response && response.data) {
                    toast.error(response.data.error)
                } else {
                    toast.error("Something went wrong. Please try again.")
                }
            })

    }
    const handleSubmit = (e) => {
        e.preventDefault();
        let serverRoute = type == "sign-in" ? '/signin' : '/signup';
        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
        //let form = new FormData(authForm.current)
        let form = new FormData(formElement);
        console.log(form);
        let formData = {};
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        console.log(formData);
        //form validation

        let { fullname, email, password } = formData;
        if (fullname) {
            if (fullname.length < 3) {
                return toast.error("FullName must be atleast 3 letters long")
            }
        }

        if (!email.length) {
            return toast.error("Enter email")
        }
        if (!emailRegex.test(email)) {
            return toast.error("Invalid Email")
        }
        if (!passwordRegex.test(password)) {
            return toast.error("Password should be in between 6 to 20 characters long with a numeric, lowercase and uppercase letters")
        }
        userAuthThroughServer(serverRoute, formData);


    }


    const handleGoogleAuth = (e) => {
        e.preventDefault();

        authWithGoogle().then(user => {
            let serverRoute = '/google-auth'
            let formData = {
                access_token: user.idToken
            }

            userAuthThroughServer(serverRoute, formData)
        })
            .catch((err) => {
                toast.error("Trouble Logging In Through Google")
                console.log(err);
            })
    }


    return (
        access_token ?
            <Navigate to='/' />
            :

            <AnimationWrapper keyValue={type}>
                <section className="h-cover flex items-center justify-center">
                    <Toaster />
                    <form id='formElement' className="w-[80%] max-w-[400px]" onSubmit={handleSubmit} autoComplete="off">
                        <h1 className="text-4xl font-gelasio capitalize text-center mb-24">
                            {type == "sign-in" ? " Welcome Back " : "Share Your Experience Today!!"}
                        </h1>
                        {
                            type != "sign-in" ?
                                <InputBox name="fullname"
                                    type="text"
                                    placeholder="Full Name"
                                    icon="fi-ss-user"
                                />
                                :
                                ""
                        }

                        <InputBox name="email"
                            type="email"
                            placeholder="johndoe@gmail.com"
                            // icon="fi-rs-at"
                            icon="fi-sr-envelope-open"
                        />

                        <InputBox name="password"
                            type="password"
                            placeholder="*******"
                            icon="fi-rr-key"
                        />
                        <button
                            className="btn-dark center mt-14"
                            type="submit"
                        // onClick={handleSubmit}
                        >
                            {type.replace("-", " ")}
                        </button>

                        <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold">
                            <hr className="w-1/2 border-black" />
                            <p> OR </p>
                            <hr className="w-1/2 border-black" />
                        </div>

                        <button
                            className="btn-dark flex items-center justify-center gap-4 w-[90%] center"
                            onClick={handleGoogleAuth}

                        >
                            <img src={googleIcon} className="w-5" />
                            Continue with Google
                        </button>

                        {
                            type == "sign-in" ?
                                <p className="mt-6 text-dark-grey text-xl text-center">
                                    Don't have an account?
                                    <Link to="/signup" className="underline text=black text-xl ml-1">
                                        Join Us!
                                    </Link>
                                </p>
                                :
                                <p className="mt-6 text-dark-grey text-xl text-center">
                                    Already a part of our community?
                                    <Link to="/signin" className="underline text=black text-xl ml-1">
                                        Sign in here.
                                    </Link>
                                </p>
                        }

                    </form>


                </section>
            </AnimationWrapper>

    )
}

export default UserAuthForm;