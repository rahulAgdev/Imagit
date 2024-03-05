"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

const populateUser = (query : any) =>query.populate({
    path: 'author',
    model: User,
    select: '_id firstName lastName'
})

// add image to db
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();

    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });

    revalidatePath(path);
    // allows us to show the new image rather than just the cache image
    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}
// update the image
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id)

    if(!imageToUpdate || imageToUpdate.author.toHexString() !== userId){
        throw new Error("Unauthorized or image not found.")
    }

    const updatedImage = await Image.findByIdAndUpdate(
        imageToUpdate._id,
        image,
        {new : true}
    );

    revalidatePath(path);
    // allows us to show the new image rather than just the cache image
    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}
// delete image
export async function deleteImage(imageId: string) {
  try {
    await connectToDatabase();
    await Image.findByIdAndDelete(imageId)
    // allows us to show the new image rather than just the cache image
  } catch (error) {
    handleError(error);
  } finally{
    redirect('/')
  }
}
// get image
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();
    const image = await populateUser(Image.findById(imageId))
    if(!image) throw new Error("Image not found");
    // allows us to show the new image rather than just the cache image
    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}
