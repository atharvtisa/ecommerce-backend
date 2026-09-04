
import multer from "multer";
import path from "path";
import fs from "fs";
import { CategoryConstant } from "../constants/category.constant";

/*
|--------------------------------------------------------------------------
| Upload Directories
|--------------------------------------------------------------------------
*/

const categoryUploadPath = path.resolve(
  process.cwd(),
  "uploads",
  "categories",
);

const adminUploadPath = path.resolve(
  process.cwd(),
  "uploads",
  "admin",
);

const settingsUploadPath = path.resolve(
  process.cwd(),
  "uploads",
  "settings",
);

/*
|--------------------------------------------------------------------------
| Create Upload Folders Automatically
|--------------------------------------------------------------------------
*/

[
  categoryUploadPath,
  adminUploadPath,
  settingsUploadPath,
].forEach((folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, {
      recursive: true,
    });
  }
});

/*
|--------------------------------------------------------------------------
| Common Image Types
|--------------------------------------------------------------------------
*/

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const allowedImageExtensions = [
  "jpg",
  "jpeg",
  "png",
  "webp",
];

/*
|--------------------------------------------------------------------------
| Common Image Filter
|--------------------------------------------------------------------------
*/

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb,
) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase()
    .replace(".", "");

  const isValidMimeType =
    allowedImageTypes.includes(file.mimetype);

  const isValidExtension =
    allowedImageExtensions.includes(extension);

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only JPG, JPEG, PNG, and WEBP images are allowed.",
    ),
  );
};

/*
|--------------------------------------------------------------------------
| Generate Unique Filename
|--------------------------------------------------------------------------
*/

const generateFileName = (
  originalName: string,
) => {
  const extension = path
    .extname(originalName)
    .toLowerCase();

  const baseName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  const timestamp = Date.now();

  const randomNumber = Math.round(
    Math.random() * 1e9,
  );

  return `${timestamp}-${randomNumber}-${baseName}${extension}`;
};

/*
|--------------------------------------------------------------------------
| CATEGORY IMAGE UPLOAD
|--------------------------------------------------------------------------
*/

const categoryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, categoryUploadPath);
  },

  filename: (_req, file, cb) => {
    const uniqueName = generateFileName(
      file.originalname,
    );

    cb(null, uniqueName);
  },
});

export const categoryImageUpload = multer({
  storage: categoryStorage,

  fileFilter,

  limits: {
    fileSize:
      CategoryConstant.MAX_IMAGE_SIZE,

    files:
      CategoryConstant.MAX_IMAGES,
  },
});

/*
|--------------------------------------------------------------------------
| ADMIN PROFILE IMAGE UPLOAD
|--------------------------------------------------------------------------
*/

const adminProfileStorage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      cb,
    ) => {
      cb(null, adminUploadPath);
    },

    filename: (
      _req,
      file,
      cb,
    ) => {
      const uniqueName =
        generateFileName(
          file.originalname,
        );

      cb(null, uniqueName);
    },
  });

export const adminProfileImageUpload =
  multer({
    storage: adminProfileStorage,

    fileFilter,

    limits: {
      fileSize:
        CategoryConstant.MAX_IMAGE_SIZE,

      files: 1,
    },
  });

/*
|--------------------------------------------------------------------------
| SETTINGS IMAGE TYPES
|--------------------------------------------------------------------------
*/

const settingsAllowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];

const settingsAllowedExtensions = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "ico",
];

/*
|--------------------------------------------------------------------------
| SETTINGS FILE FILTER
|--------------------------------------------------------------------------
*/

const settingsFileFilter: multer.Options["fileFilter"] =
  (
    _req,
    file,
    cb,
  ) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase()
      .replace(".", "");

    const isValidMimeType =
      settingsAllowedImageTypes.includes(
        file.mimetype,
      );

    const isValidExtension =
      settingsAllowedExtensions.includes(
        extension,
      );

    if (
      isValidMimeType &&
      isValidExtension
    ) {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP, and ICO images are allowed.",
      ),
    );
  };

/*
|--------------------------------------------------------------------------
| SETTINGS IMAGE UPLOAD
|--------------------------------------------------------------------------
*/

const settingsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, settingsUploadPath);
  },

  filename: (_req, file, cb) => {
    const uniqueName = generateFileName(
      file.originalname,
    );

    cb(null, uniqueName);
  },
});

export const settingsImageUpload = multer({
  storage: settingsStorage,

  fileFilter: settingsFileFilter,

  limits: {
    fileSize:
      CategoryConstant.MAX_IMAGE_SIZE,

    // storeLogo + favicon
    files: 2,
  },
});