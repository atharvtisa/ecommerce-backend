import Setting from "../models/Setting";

interface UpdateSettingData {
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;
  storeAddress?: string;
  currency?: string;

  storeLogo?: string | null;
  favicon?: string | null;

  facebookUrl?: string | null;
  instagramUrl?: string | null;
  whatsappNumber?: string | null;

  storeDescription?: string | null;
  footerText?: string | null;
}

// --------------------
// GET SETTINGS
// --------------------

export const getSettings = async () => {
  let settings = await Setting.findOne();

  if (!settings) {
    settings = await Setting.create({
      storeName: "",
      storeEmail: "",
      storePhone: "",
      storeAddress: "",
      currency: "INR",

      storeLogo: null,
      favicon: null,

      facebookUrl: null,
      instagramUrl: null,
      whatsappNumber: null,

      storeDescription: null,
      footerText: null,
    });
  }

  return settings;
};

// --------------------
// UPDATE SETTINGS
// --------------------

export const updateSettings = async (
  data: UpdateSettingData,
) => {
  let settings = await Setting.findOne();

  if (!settings) {
    settings = await Setting.create({
      storeName: data.storeName ?? "",
      storeEmail: data.storeEmail ?? "",
      storePhone: data.storePhone ?? "",
      storeAddress: data.storeAddress ?? "",
      currency: data.currency ?? "INR",

      storeLogo: data.storeLogo ?? null,
      favicon: data.favicon ?? null,

      facebookUrl: data.facebookUrl ?? null,
      instagramUrl: data.instagramUrl ?? null,
      whatsappNumber:
        data.whatsappNumber ?? null,

      storeDescription:
        data.storeDescription ?? null,

      footerText:
        data.footerText ?? null,
    });

    return settings;
  }

  await settings.update({
    ...(data.storeName !== undefined
      ? { storeName: data.storeName }
      : {}),

    ...(data.storeEmail !== undefined
      ? { storeEmail: data.storeEmail }
      : {}),

    ...(data.storePhone !== undefined
      ? { storePhone: data.storePhone }
      : {}),

    ...(data.storeAddress !== undefined
      ? { storeAddress: data.storeAddress }
      : {}),

    ...(data.currency !== undefined
      ? { currency: data.currency }
      : {}),

    ...(data.storeLogo !== undefined
      ? { storeLogo: data.storeLogo }
      : {}),

    ...(data.favicon !== undefined
      ? { favicon: data.favicon }
      : {}),

    ...(data.facebookUrl !== undefined
      ? { facebookUrl: data.facebookUrl }
      : {}),

    ...(data.instagramUrl !== undefined
      ? { instagramUrl: data.instagramUrl }
      : {}),

    ...(data.whatsappNumber !== undefined
      ? {
          whatsappNumber:
            data.whatsappNumber,
        }
      : {}),

    ...(data.storeDescription !== undefined
      ? {
          storeDescription:
            data.storeDescription,
        }
      : {}),

    ...(data.footerText !== undefined
      ? { footerText: data.footerText }
      : {}),
  });

  return settings;
};