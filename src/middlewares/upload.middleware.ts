import multer from "multer";
import { CategoryConstant } from "../constants/category.constant";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/categories");
  },

  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}-${file.originalname}`;

    cb(null, uniqueName);
  },
});

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb,
) => {
  const extension = file.originalname
    .toLowerCase()
    .split(".")
    .pop();

  const isValidMimeType = allowedImageTypes.includes(file.mimetype);

  const isValidExtension =
    extension !== undefined &&
    ["jpg", "jpeg", "png", "webp"].includes(extension);

  if (isValidMimeType || isValidExtension) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only JPG, JPEG, PNG, and WEBP images are allowed.",
    ),
  );
};

export const categoryImageUpload = multer({
  storage,
  fileFilter,


  limits: {
    
    fileSize: CategoryConstant.MAX_IMAGE_SIZE,
    files: CategoryConstant.MAX_IMAGES,
  },
});




const adminProfileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/admin");
  },

  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}-${file.originalname}`;

    cb(null, uniqueName);
  },
});



export const adminProfileImageUpload = multer({
  storage: adminProfileStorage,
  fileFilter,
  limits: {
    fileSize: CategoryConstant.MAX_IMAGE_SIZE,
    files: 1,
  },
});





const settingsStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/settings");
  },

  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9,
    )}-${file.originalname}`;

    cb(null, uniqueName);
  },
});

const settingsAllowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];

const settingsFileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb,
) => {
  const extension = file.originalname
    .toLowerCase()
    .split(".")
    .pop();

  const isValidMimeType =
    settingsAllowedImageTypes.includes(
      file.mimetype,
    );

  const isValidExtension =
    extension !== undefined &&
    [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "ico",
    ].includes(extension);

  if (
    isValidMimeType ||
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