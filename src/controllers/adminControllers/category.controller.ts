import {Request, Response } from "express";

import { createCategory, getCategoryById, listCategories, } from "../../services/category.service";
import { HttpStatus } from "../../constants/http.constant";
import { MessageConstant } from "../../constants/message.constant";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

import {updateCategory as updateCategoryService,} from "../../services/category.service";

import {  deleteCategory as deleteCategoryService,} from "../../services/category.service";

import {
  updateCategoryStatus as updateCategoryStatusService,
} from "../../services/category.service";


import { categoryIdSchema,updateCategorySchema,   updateCategoryStatusSchema, } from "../../validations/category.validation";


export const createCategoryController = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {

     const files =
      (req.files as Express.Multer.File[]) || [];

        

    const category = await createCategory({
      name: req.body.name,
      description: req.body.description,
      files
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: MessageConstant.CATEGORY.CREATED,
      data: category,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    if (
      message === MessageConstant.CATEGORY.SLUG_EXISTS
    ) {
      res.status(HttpStatus.CONFLICT).json({
        success: false,
        message,
      });

      return;
    }

    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message,
    });
  }
};


export const getAllCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : undefined;

    const status =
      req.query.status === "inactive"
        ? "inactive"
        : req.query.status === "all"
          ? "all"
          : "active";

    const result = await listCategories({
      page,
      limit,
      search,
      status,
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.SUCCESS.FETCH,
      data: result.categories,
      pagination: result.pagination,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        message,
      });
  }
};

// --------------------
// GET CATEGORY DETAIL
// --------------------

export const getCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } =
      categoryIdSchema.validate(req.body);

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    const category =
      await getCategoryById(value.id);

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.SUCCESS.FETCH,
      data: category,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Category not found."
        ? HttpStatus.NOT_FOUND
        : HttpStatus.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};





export const updateCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } =
      updateCategorySchema.validate(req.body);

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    const files =
      (req.files as Express.Multer.File[]) || [];

    let removeImages: string[] = [];

    if (req.body.removeImages) {
      try {
        removeImages = JSON.parse(
          req.body.removeImages,
        );

        if (!Array.isArray(removeImages)) {
          throw new Error();
        }
      } catch {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message:
            "removeImages must be a valid JSON array.",
        });

        return;
      }
    }

    const category =
      await updateCategoryService({
        id: value.id,
        name: value.name,

        // only updates when provided
        description: value.description,

        status: value.status,

        files,
        removeImages,
      });

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.SUCCESS.UPDATE,
      data: category,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Category not found."
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};



export const updateCategoryStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } =
      updateCategoryStatusSchema.validate(
        req.body,
      );

    if (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    const category =
      await updateCategoryStatusService(
        value.id,
        value.status,
      );

    res.status(HttpStatus.OK).json({
      success: true,
      message:
        "Category status updated successfully.",
      data: category,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Category not found."
        ? HttpStatus.NOT_FOUND
        : HttpStatus.BAD_REQUEST;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};



export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { error, value } = categoryIdSchema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    await deleteCategoryService(value.id);

    res.status(200).json({
      success: true,
      message: MessageConstant.SUCCESS.DELETE,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Category not found." ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};


