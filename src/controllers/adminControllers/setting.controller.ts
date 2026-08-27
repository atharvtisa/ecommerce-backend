import { Request, Response } from "express";

import {
  getSettings,
  updateSettings,
} from "../../services/setting.service";

import {
  updateSettingSchema,
} from "../../validations/setting.validation";

import { HttpStatus } from "../../constants/http.constant";
import { MessageConstant } from "../../constants/message.constant";


// --------------------
// GET SETTINGS
// --------------------

export const getSettingsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const settings =
      await getSettings();

    res.status(HttpStatus.OK).json({
      success: true,
      message: MessageConstant.SUCCESS.FETCH,
      data: settings,
    });
  } catch (error) {
    res
      .status(
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
      .json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : MessageConstant.ERROR
                .INTERNAL_SERVER,
      });
  }
};


// --------------------
// UPDATE SETTINGS
// --------------------

export const updateSettingsController =
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const { error, value } =
        updateSettingSchema.validate(
          req.body,
        );

      if (error) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({
            success: false,
            message:
              error.details[0]?.message,
          });

        return;
      }

      const files =
        req.files as {
          [fieldname: string]:
            Express.Multer.File[];
        };

      const storeLogo =
        files?.storeLogo?.[0]
          ? files.storeLogo[0].path.replace(
              /\\/g,
              "/",
            )
          : undefined;

      const favicon =
        files?.favicon?.[0]
          ? files.favicon[0].path.replace(
              /\\/g,
              "/",
            )
          : undefined;

      const settings =
        await updateSettings({
          storeName: value.storeName,
          storeEmail: value.storeEmail,
          storePhone: value.storePhone,
          storeAddress:
            value.storeAddress,
          currency: value.currency,

          // uploaded files
          storeLogo,
          favicon,

          facebookUrl:
            value.facebookUrl,

          instagramUrl:
            value.instagramUrl,

          whatsappNumber:
            value.whatsappNumber,

          storeDescription:
            value.storeDescription,

          footerText:
            value.footerText,
        });

      res.status(HttpStatus.OK).json({
        success: true,
        message:
          "Settings updated successfully.",
        data: settings,
      });
    } catch (error) {
      res
        .status(
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
        .json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : MessageConstant.ERROR
                  .INTERNAL_SERVER,
        });
    }
  };