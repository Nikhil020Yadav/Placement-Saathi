import Embed from "@editorjs/embed";
import Link from "@editorjs/link"
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote"
import Marker from "@editorjs/marker"
import InlineCode from "@editorjs/inline-code"
import Paragraph from "@editorjs/paragraph"
const uploadImageByUrl = (e) => {
    let link = new Promise((resolve, reject) => {
        try {
            resolve(e)
        }
        catch (err) {
            reject(err)
        }
    })

    return link.then(url => {
        return {
            success: 1,
            file: { url }
        }
    })
}
// import { uploadImage } from "../common/aws"
// const uploadImageByFile = (e) => {
//     return uploadImageByFile(e).then(url=>{
//         if(url){
//             return{
//                 success: 1,
//                 file

//             }
//         }
//     })
// }

export const tools = {
    paragraph: {
        class: Paragraph,
        inlineToolbar: true,
    },
    embed: Embed,
    link: Link,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByUrl: uploadImageByUrl,
                //uploadByFile: uploadImageByFile
            }
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading....",
            levels: [2, 3],
            defaultLevel: 2
        }
    },
    quote: {
        class: Quote,
        inlineToolbar: true
    },
    marker: Marker,
    inlineCode: InlineCode

}