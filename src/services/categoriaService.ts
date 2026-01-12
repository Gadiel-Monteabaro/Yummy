import { CategoriaData } from "@/data/categoriaData.js";

const categoriaData = new CategoriaData();

export class CategoriaService {
  async listarCategorias() {
    return await categoriaData.findAll();
  }
}
