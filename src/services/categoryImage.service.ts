import Category from "../models/Category";
import CategoryImage from "../models/CategoryImage";
import { CategoryConstant } from "../constants/category.constant";

import fs from "fs/promises";
import path from "path";

interface UploadCategoryImagesData {
  categoryId: number;
  files: Express.Multer.File[];
}

export const uploadCategoryImages = async ({
  categoryId,
  files,
}: UploadCategoryImagesData) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    throw new Error("Category not found.");
  }

  if (!files || files.length === 0) {
    throw new Error("At least one image is required.");
  }

  const existingImageCount = await CategoryImage.count({
    where: {
      categoryId,
    },
  });

  const totalImageCount = existingImageCount + files.length;

  if (totalImageCount > CategoryConstant.MAX_IMAGES) {
    throw new Error(
      `A category can have maximum ${CategoryConstant.MAX_IMAGES} images.`,
    );
  }

  const imageRecords = files.map((file) => ({
    categoryId,
    image: file.path.replace(/\\/g, "/"),
  }));

  const images = await CategoryImage.bulkCreate(imageRecords);

  return images;
};










export const deleteCategoryImage = async (imageId: number) => {
  const image = await CategoryImage.findByPk(imageId);

  if (!image) {
    throw new Error("Category image not found.");
  }

  const imagePath = path.resolve(process.cwd(), image.image);

  try {
    await fs.unlink(imagePath);
  } catch (error) {
    // If the physical file is already missing,
    // still remove the database record.
    const fileError = error as NodeJS.ErrnoException;

    if (fileError.code !== "ENOENT") {
      throw error;
    }
  }

  await image.destroy();

  return {
    id: image.id,
  };
};