import {Request, Response } from "express";

import { createCategory, getCategoryById } from "../../services/category.service";
import { HttpStatus } from "../../constants/http.constant";
import { MessageConstant } from "../../constants/message.constant";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

import {updateCategory as updateCategoryService,} from "../../services/category.service";

import {  deleteCategory as deleteCategoryService,} from "../../services/category.service";

import {  uploadCategoryImages as uploadCategoryImagesService,} from "../../services/categoryImage.service";
import { deleteCategoryImage as deleteCategoryImageService,}from "../../services/categoryImage.service";


import { categoryIdSchema,updateCategorySchema } from "../../validations/category.validation";


export const createCategoryController = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const category = await createCategory({
      name: req.body.name,
      description: req.body.description,
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




export const getCategory = async (
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

    const category = await getCategoryById(value.id);

    res.status(200).json({
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
      message === "Category not found." ? 404 : 500;

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
    const { error, value } = updateCategorySchema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

      return;
    }

    const category = await updateCategoryService(value);

    res.status(200).json({
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
      message === "Category not found." ? 404 : 400;

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




export const uploadCategoryImages = async (
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

    const files = req.files as Express.Multer.File[];

    const images = await uploadCategoryImagesService({
      categoryId: value.id,
      files,
    });

    res.status(201).json({
      success: true,
      message: MessageConstant.SUCCESS.CREATE,
      data: images,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Category not found." ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};





export const deleteCategoryImage = async (
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

    const result = await deleteCategoryImageService(value.id);

    res.status(200).json({
      success: true,
      message: MessageConstant.SUCCESS.DELETE,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : MessageConstant.ERROR.INTERNAL_SERVER;

    const statusCode =
      message === "Category image not found." ? 404 : 500;

    res.status(statusCode).json({
      success: false,
      message,
    });
  }
};