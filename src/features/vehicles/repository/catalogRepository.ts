import { isDatabaseConfigured } from "@/db";
import { mysqlCatalogRepository } from "@/features/vehicles/repository/mysqlCatalogRepository";

function requireMysql() {
  if (!isDatabaseConfigured()) {
    throw new Error("MySQL is required for catalog management.");
  }
}

export const catalogRepository = {
  async createBrand(input: { id: string; name: string; slug: string }) {
    requireMysql();
    return mysqlCatalogRepository.createBrand(input);
  },
  async updateBrand(id: string, input: { name: string; slug: string }) {
    requireMysql();
    return mysqlCatalogRepository.updateBrand(id, input);
  },
  async deleteBrand(id: string) {
    requireMysql();
    return mysqlCatalogRepository.deleteBrand(id);
  },
  async createModel(input: {
    id: string;
    brandId: string;
    name: string;
    slug: string;
  }) {
    requireMysql();
    return mysqlCatalogRepository.createModel(input);
  },
  async updateModel(
    id: string,
    input: { brandId: string; name: string; slug: string },
  ) {
    requireMysql();
    return mysqlCatalogRepository.updateModel(id, input);
  },
  async deleteModel(id: string) {
    requireMysql();
    return mysqlCatalogRepository.deleteModel(id);
  },
  async createCategory(input: { id: string; name: string; slug: string }) {
    requireMysql();
    return mysqlCatalogRepository.createCategory(input);
  },
  async updateCategory(id: string, input: { name: string; slug: string }) {
    requireMysql();
    return mysqlCatalogRepository.updateCategory(id, input);
  },
  async deleteCategory(id: string) {
    requireMysql();
    return mysqlCatalogRepository.deleteCategory(id);
  },
};
