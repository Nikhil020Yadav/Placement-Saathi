import { useContext, useRef } from "react";
import { useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { profileDataStr } from "./profile.page";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import toast, { Toaster } from "react-hot-toast";
import InputBox from "../components/input.component";
import { UploadImage } from "../common/aws";
import { storeInSession } from "../common/session";

const EditProfile = () => {
    let bioLimit = 150;
    let { userAuth, userAuth: { access_token }, setUserAuth } = useContext(UserContext);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(profileDataStr);
    const [charLeft, setCharLeft] = useState(bioLimit);

    let profileImgEle = useRef();
    let editProfileForm = useRef();

    const [updatedProfileImg, setUpdatedProfileImg] = useState(null);

    let { personal_info: { fullname, username: profile_username, profile_img, email, bio }, social_links } = profile;



    useEffect(() => {
        if (access_token) {
            axios.post(import.meta.env.VITE_SERVER_URL + "/get-profile", { username: userAuth.username })
                .then(({ data }) => {
                    console.log(data);
                    setProfile(data);
                    setLoading(false);

                })
                .catch((err) => {
                    console.log(err);

                })
        }
    }, [access_token])


    const handleOnChange = (e) => {
        setCharLeft(bioLimit - e?.target.value.length)
    }

    const handleImagePreview = (e) => {
        let img = e.target.files[0];
        profileImgEle.current.src = URL.createObjectURL(img);
        setUpdatedProfileImg(img)
    }

    const handleImageUpload = (e) => {
        e.preventDefault();
        if (updatedProfileImg) {
            let loadingToast = toast.loading("Uploading....");
            e.target.setAttribute("disabled", true);
            UploadImage(updatedProfileImg)
                .then(url => {
                    console.log(url);
                    if (url) {
                        axios.post(import.meta.env.VITE_SERVER_URL + "/update-profile-img", { url }, {
                            headers:
                            {
                                'Authorization': `Bearer ${access_token}`
                            }
                        })
                            .then(({ data }) => {
                                let newUserAuth = { ...userAuth, profile_img: data.profile_img }
                                storeInSession("user", JSON.stringify(newUserAuth));
                                setUserAuth(newUserAuth);
                                setUpdatedProfileImg(null)
                                toast.dismiss(loadingToast)
                                e.target.removeAttribute("disabled");
                                toast.success("Profile Image Uploaded");
                            })
                            .catch(({ response }) => {
                                toast.dismiss(loadingToast)
                                e.target.removeAttribute("disabled");
                                toast.error(response.data.error);
                            })
                    }

                })
                .catch(err => {
                    console.log(err);

                })
        }
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        let form = new FormData(editProfileForm.current);
        let formData = {};
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        console.log(formData);
        let { username, bio, youtube, facebook, twitter, github, instagram, website } = formData;

        if (username.length < 4) {
            return toast.error("Username should be atleast 4 letters long");
        }
        if (bio.length > bioLimit) {
            return toast.error(`Bio should not be more than ${bioLimit}`)
        }

        let loadingToast = toast.loading("Updating...");
        e.target.setAttribute("disable", true);

        axios.post(import.meta.env.VITE_SERVER_URL + "/update-profile", {
            username, bio,
            social_links: { youtube, facebook, twitter, github, instagram, website }
        },
            {
                headers:
                {
                    'Authorization': `Bearer ${access_token}`
                }
            }
        )
            .then(({ data }) => {
                if (userAuth.username != data.username) {
                    let newUserAuth = { ...userAuth, username: data.username };
                    storeInSession("user", JSON.stringify(newUserAuth));
                    setUserAuth(newUserAuth);
                }

                toast.dismiss(loadingToast)
                e.target.removeAttribute("disabled");
                toast.success("Profile Updated")
            })
            .catch(({ response }) => {

                toast.dismiss(loadingToast)
                e.target.removeAttribute("disabled");
                toast.error(response.data.error)
            })



    }

    return (
        <AnimationWrapper>
            {
                loading ?
                    <Loader />
                    :
                    <form ref={editProfileForm}>
                        <Toaster />

                        <h1 className="max-md:hidden"> Edit Profile </h1>
                        <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">
                            <div className="max-lg:center mb-5">
                                <label htmlFor="uploadImg" id="profileImgLabel" className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                                    <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                                        Upload Image
                                    </div>
                                    <img ref={profileImgEle} src={profile_img} />
                                </label>

                                <input type="file" id="uploadImg" accept=".jpeg, .png, .jpg" hidden onChange={handleImagePreview} />
                                <button className="btn-light mt-5 max-lg:center lg:w-full px-10" onClick={handleImageUpload}>
                                    Upload
                                </button>
                            </div>

                            <div className="w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                                    <div>
                                        <InputBox name="fullname" type="text" value={fullname} placeholder="Full Name" disable={true} icon="fi-rr-user" />
                                    </div>

                                    <div>
                                        <InputBox name="email" type="email" value={email} placeholder="Email" disable={true} icon="fi-rr-envelope" />
                                    </div>
                                </div>

                                <InputBox type="text" name="username" value={profile_username} placeholder="Username" icon="fi-rr-at" />
                                <p className="text-dark-grey -mt-3"> Username will be used to search user and is visible to all users </p>

                                <textarea name="bio" maxLength={bioLimit} defaultValue={bio} className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5" placeholder="Bio"
                                    onChange={handleOnChange}
                                >

                                </textarea>
                                <p className="mt-1">{charLeft} characters left </p>

                                <p className="my-6"> Add your social handles below </p>

                                <div className="md:grid md:grid-cols-2 gap-x-6">
                                    {
                                        Object.keys(social_links).map((key, i) => {
                                            let link = social_links[key];
                                            return <InputBox key={i} name={key} type="text" value={link} placeholder="https://" icon={"fi " + (key != 'website' ? "fi-brands-" + key : "fi-rr-globe")} />
                                        })
                                    }
                                </div>

                                <button className="btn-dark w-auto px-10" type="submit" onClick={handleSubmit}>
                                    Update
                                </button>
                            </div>
                        </div>
                    </form>
            }
        </AnimationWrapper>
    )
}

export default EditProfile;
