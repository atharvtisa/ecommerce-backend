import { Op, WhereOptions } from "sequelize";

import Category from "../models/Category";
import CategoryImage from "../models/CategoryImage";

interface CreateCategoryData {
  name: string;
  description?: string | null;
}

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};



// ------------------------
// CREATE CATEGORY
// ------------------------

export const createCategory = async ({
  name,
  description,
}: CreateCategoryData) => {
  const slug = generateSlug(name);

  const existingCategory = await Category.findOne({
    where: {
      slug,
    },
  });

  if (existingCategory) {
    throw new Error("Category with this slug already exists.");
  }

  const category = await Category.create({
    name,
    slug,
    description: description ?? null,
    isActive: true,
  });

  return category;
};


// ------------------------
// LIST , PAGINATION, SEARCHING OF CATEGORIES
// ------------------------


interface ListCategoryParams {
  page: number;
  limit: number;
  search?: string;
  status: "active" | "inactive" | "all";
}

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
              [Op.like]: `%${search}%`,
            },
          },
          {
            slug: {
              [Op.like]: `%${search}%`,
            },
          },
        ],
      }
    : {}),

  ...(status === "active"
    ? {
        isActive: true,
      }
    : {}),

  ...(status === "inactive"
    ? {
        isActive: false,
      }
    : {}),
};

  const { rows, count } = await Category.findAndCountAll({
    where,

    include: [
      {
        model: CategoryImage,
        as: "images",
        attributes: ["id", "image"],
      },
    ],

    order: [["createdAt", "DESC"]],

    limit,
    offset,

    distinct: true,
  });

  const totalPages = Math.ceil(count / limit);

  return {
    categories: rows,

    pagination: {
      currentPage: page,
      limit,
      totalItems: count,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};


// ------------------------
// GET CATEGORY BY ID
// ------------------------


export const getCategoryById = async (id: number) => {
  const category = await Category.findOne({
    where: {
      id,
    },

    include: [
      {
        model: CategoryImage,
        as: "images",
        attributes: ["id", "image"],
      },
    ],
  });

  if (!category) {
    throw new Error("Category not found.");
  }

  return category;
};




// --------------------
//  UPDATE CATEGORY
// --------------------


interface UpdateCategoryData {
  id: number;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export const updateCategory = async ({
  id,
  name,
  description,
  isActive,
}: UpdateCategoryData) => {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  const slug = generateSlug(name);

  const existingCategory = await Category.findOne({
    where: {
      slug,
      id: {
        [Op.ne]: id,
      },
    },
  });

  if (existingCategory) {
    throw new Error("Category with this name already exists.");
  }

  await category.update({
    name,
    slug,
    description: description ?? null,
    ...(isActive !== undefined ? { isActive } : {}),
  });

  return category;
};



// --------------------
//  DELETE CATEGORY
// --------------------


export const deleteCategory = async (id: number) => {
  const category = await Category.findByPk(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  await category.destroy();

  return true;
};