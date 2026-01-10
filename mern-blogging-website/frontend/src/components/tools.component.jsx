import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import axios from "axios";

const uploadImageByFile = async (file) => {
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const token = sessionStorage.getItem("user") ? JSON.parse(sessionStorage.getItem("user")).access_token : null;
        
        const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/upload-blog-image", formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });
        
        return data;
    } catch (err) {
        console.error("Upload failed:", err);
        return { success: 0 };
    }
}

const uploadImageByURL = (e) => {
    let link = new Promise((resolve, reject) => {
        try {
            resolve(e);
        } catch (err) {
            reject(err);
        }
    });

    return link.then(url => {
        return {
            success: 1,
            file: { url }
        };
    });
}

export const tools = {
    embed: Embed,
    list: {
        class: List,
        inlineToolbar: true
    },
    image: {
        class: Image,
        config: {
            uploader: {
                uploadByFile: uploadImageByFile,
                uploadByUrl: uploadImageByURL
            }
        }
    },
    header: {
        class: Header,
        config: {
            placeholder: "Type Heading...",
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
