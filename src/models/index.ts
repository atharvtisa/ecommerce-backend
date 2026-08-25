import Admin from "./Admin";
import User from "./User";
import Category from "./Category";
import CategoryImage from "./CategoryImage";

Category.hasMany(CategoryImage, {
  foreignKey: "categoryId",
  as: "images",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

CategoryImage.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

export {
  Admin,
  User,
  Category,
  CategoryImage,
};