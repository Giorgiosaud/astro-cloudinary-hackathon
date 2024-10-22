import type { APIRoute } from "astro"
import {v2 as cloudinary} from 'cloudinary'
import { Readable } from "stream";

export const prerender = false;
cloudinary.config({
    cloud_name: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: import.meta.env.PUBLIC_CLOUDINARY_API_KEY,
    api_secret: import.meta.env.CLOUDINARY_API_SECRET,
    secure: true,
    folder: 'hackathon'
})
const uploadStream = async (file: File,options: any) => {
    options.folder="hackathon";
    options.background_removal= "cloudinary_ai";

    return new Promise(async(resolve,reject)=>{
        const buffer = await file.stream();
        options.background_removal= "cloudinary_ai";
        options.folder="hackathon";
        const theTransformStream = cloudinary.uploader.upload_stream(
            options,
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
          let str = Readable.from(buffer);
          return str.pipe(theTransformStream);
    })
}
export const POST: APIRoute = async ({ request }) => {
    try{
        const data=await request.formData();
        const file = data.get('file') as File;
        console.log(file);
        const buffer = await file.arrayBuffer();
        const unit8Array= new Uint8Array(buffer);
        const result = await uploadStream(file,{
            tags: 'hackathon'
        })
        console.log(result);
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: {
                'Content-Type': 'text/plain'
            },
        })
    }catch(e){
        console.log(e);
        return new Response(JSON.stringify(e), {
            status: 500,
            headers: {
                'Content-Type': 'text/plain'
            },
        })  
    }
}


export const GET: APIRoute = async({ params, request }) => {
    const url=new URL(request.url)
    const fondo=url.searchParams.get('fondo')
    const foto=url.searchParams.get('foto')
    console.log(foto,fondo)
    const s = cloudinary.url(fondo,{
        transformation: {
        overlay: foto.replace('/',':'),
        width:800,
        effect: "cartoonify"
        }
    })
    return new Response(JSON.stringify({
        message: "This was a GET! "+fondo,
        params,
        foto,
        s,
        request
      })
    )
  }