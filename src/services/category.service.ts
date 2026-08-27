import { Op, WhereOptions } from "sequelize";
import fs from "fs/promises";
import path from "path";

import Category from "../models/Category";
import { CategoryConstant } from "../constants/category.constant";


// =====================================================
// TYPES
// =====================================================

interface CreateCategoryData {
  name: string;
  description?: string | null;
  files?: Express.Multer.File[];
}

interface ListCategoryParams {
  page: number;
  limit: number;
  search?: string;
  status: "active" | "inactive" | "all";
}

interface UpdateCategoryData {
  id: number;
  name: string;
  description?: string ;


  // New uploaded images
  files?: Express.Multer.File[];

  // Existing image paths frontend wants removed
  removeImages?: string[];
}


// =====================================================
// HELPERS
// =====================================================

const generateSlug = (
  name: string,
): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};


// Convert Windows path:
// uploads\categories\image.jpg
//
// into:
//
// uploads/categories/image.jpg
const normalizeImagePath = (
  filePath: string,
): string => {
  return filePath.replace(/\\/g, "/");
};


// Delete one physical image
const deletePhysicalImage = async (
  imagePath: string,
): Promise<void> => {
  try {
    const absolutePath = path.resolve(
      process.cwd(),
      imagePath,
    );

    await fs.unlink(absolutePath);
  } catch (error) {
    const fileError =
      error as NodeJS.ErrnoException;

    // File is already missing.
    // Nothing else needs to happen.
    if (fileError.code !== "ENOENT") {
      console.warn(
        "Unable to delete category image:",
        error,
      );
    }
  }
};


// Delete multiple physical images
const deletePhysicalImages = async (
  images: string[],
): Promise<void> => {
  await Promise.all(
    images.map((image) =>
      deletePhysicalImage(image),
    ),
  );
};


// Convert uploaded Multer files into DB paths
const getUploadedImagePaths = (
  files?: Express.Multer.File[],
): string[] => {
  if (!files || files.length === 0) {
    return [];
  }

  return files.map((file) =>
    normalizeImagePath(file.path),
  );
};


// =====================================================
// CREATE CATEGORY
// =====================================================

export const createCategory = async ({
  name,
  description,
  files = [],
}: CreateCategoryData) => {
  const uploadedImages =
    getUploadedImagePaths(files);

  try {
    if (
      uploadedImages.length >
      CategoryConstant.MAX_IMAGES
    ) {
      throw new Error(
        `A category can have maximum ${CategoryConstant.MAX_IMAGES} images.`,
      );
    }

    const slug = generateSlug(name);

    const existingCategory =
      await Category.findOne({
        where: {
          slug,
        },
      });

    if (existingCategory) {
      throw new Error(
        "Category with this slug already exists.",
      );
    }

    const category =
      await Category.create({
        name,
        slug,
        description:
          description ?? null,
          
        status: "active",

       
        images: uploadedImages,

           imageCount: uploadedImages.length,
      });

    return category;
  } catch (error) {
    /*
     * Multer saves files before the service runs.
     *
     * If category creation fails,
     * remove those newly uploaded files
     * so they don't become orphan files.
     */
    await deletePhysicalImages(
      uploadedImages,
    );

    throw error;
  }
};


// =====================================================
// LIST / PAGINATION / SEARCH
// =====================================================

export const listCategories = async ({
  page,
  limit,
  search,
  status,
}: ListCategoryParams) => {
  const offset = (page - 1) * limit;

  const where: WhereOptions = {
    ...(search
      ? {
          [Op.or]: [
            {
              name: {
                [Op.like]:
                  `%${search}%`,
              },
            },
            {
              slug: {
                [Op.like]:
                  `%${search}%`,
              },
            },
          ],
        }
      : {}),

    ...(status !== "all"
  ? {
      status,
    }
  : {}),
  };

  const { rows, count } =
    await Category.findAndCountAll({
      where,

      // No CategoryImage include anymore
      order: [
        ["createdAt", "DESC"],
      ],

      limit,
      offset,
    });

  const totalPages =
    Math.ceil(count / limit);

  return {
    categories: rows,

    pagination: {
      currentPage: page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage:
        page < totalPages,
      hasPreviousPage:
        page > 1,
    },
  };
};


// =====================================================
// GET CATEGORY BY ID
// =====================================================

export const getCategoryById = async (
  id: number,
) => {
  const category =
    await Category.findByPk(id);

  if (!category) {
    throw new Error(
      "Category not found.",
    );
  }

  return category;
};


// =====================================================
// UPDATE CATEGORY
// =====================================================

export const updateCategory = async ({
  id,
  name,
  description,
  
  files = [],
  removeImages = [],
}: UpdateCategoryData) => {
  const newUploadedImages =
    getUploadedImagePaths(files);

  const category =
    await Category.findByPk(id);

  /*
   * Multer has already saved the new
   * files before this function runs.
   *
   * So clean them if category doesn't exist.
   */
  if (!category) {
    await deletePhysicalImages(
      newUploadedImages,
    );

    throw new Error(
      "Category not found.",
    );
  }

  try {
    const slug =
      generateSlug(name);

    const existingCategory =
      await Category.findOne({
        where: {
          slug,

          id: {
            [Op.ne]: id,
          },
        },
      });

    if (existingCategory) {
      throw new Error(
        "Category with this name already exists.",
      );
    }

    /*
     * Existing image paths currently
     * stored in categories.images.
     */
    const existingImages =
      Array.isArray(category.images)
        ? category.images
        : [];

    /*
     * Only allow removal of images
     * that actually belong to this category.
     */
    const validRemoveImages =
      removeImages.filter((image) =>
        existingImages.includes(image),
      );

    /*
     * Keep old images except the ones
     * frontend requested to remove.
     */
    const remainingImages =
      existingImages.filter(
        (image) =>
          !validRemoveImages.includes(
            image,
          ),
      );

    /*
     * Combine remaining old images
     * with newly uploaded images.
     */
    const finalImages = [
      ...remainingImages,
      ...newUploadedImages,
    ];

    if (
      finalImages.length >
      CategoryConstant.MAX_IMAGES
    ) {
      /*
       * New files were physically uploaded
       * but we're rejecting the update.
       */
      await deletePhysicalImages(
        newUploadedImages,
      );

      throw new Error(
        `A category can have maximum ${CategoryConstant.MAX_IMAGES} images.`,
      );
    }

    await category.update({
      name,
      slug,

     ...(description !== undefined
    ? {
        description,
      }
    : {}),

      images: finalImages,

        imageCount: finalImages.length,
    });

    /*
     * Only delete old physical files
     * AFTER database update succeeds.
     */
    await deletePhysicalImages(
      validRemoveImages,
    );

    return category;
  } catch (error) {
    /*
     * If service failed before successful
     * update, delete newly uploaded files.
     *
     * We DO NOT delete old category images
     * here.
     */
    const currentImages =
      Array.isArray(category.images)
        ? category.images
        : [];

    const unusedNewImages =
      newUploadedImages.filter(
        (image) =>
          !currentImages.includes(image),
      );

    await deletePhysicalImages(
      unusedNewImages,
    );

    throw error;
  }
};


// ------------------------
// CATEGORY STATUS UPDATE 
// ------------------------


type CategoryStatus =
  | "active"
  | "inactive";

export const updateCategoryStatus = async (
  id: number,
  status: CategoryStatus,
) => {
  const category =
    await Category.findByPk(id);

  if (!category) {
    throw new Error(
      "Category not found.",
    );
  }

  category.status = status;

  await category.save();

  return category;
};




// =====================================================
// DELETE CATEGORY
// =====================================================

export const deleteCategory = async (
  id: number,
) => {
  const category =
    await Category.findByPk(id);

  if (!category) {
    throw new Error(
      "Category not found.",
    );
  }

  const images =
    Array.isArray(category.images)
      ? category.images
      : [];

  await category.destroy();

  /*
   * Delete physical files after
   * DB deletion succeeds.
   */
  await deletePhysicalImages(
    images,
  );

  return true;
};