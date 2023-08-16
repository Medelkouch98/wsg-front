import {
  IMaterial,
  IMaterialCategory,
  IMaterialDisplayCategory,
  IMaterialDisplaySubType,
  IMaterialDisplayType,
  IMaterialSearch,
  IMaterialSubType,
  IMaterialType,
  MATERIAL_CATEGORIES,
} from '../models';

/**
 * Retrieves materials grouped by category, type, and sub-type.
 * @param materials The list of materials.
 * @param typesList The list of material types.
 * @param subTypesList The list of material sub-types.
 * @returns An array of IMaterialDisplayCategory containing the materials grouped by category, type, and sub-type.
 */
export const getMaterialsByCategory = (
  materials: IMaterial[],
  typesList: IMaterialType[],
  subTypesList: IMaterialSubType[]
): IMaterialDisplayCategory[] => {
  // Create a map of categories using the MATERIAL_CATEGORIES array
  const categories = MATERIAL_CATEGORIES.reduce((acc, category) => {
    acc.set(category.id, category);
    return acc;
  }, new Map<number, IMaterialCategory>());

  // Create maps of types and sub-types using the provided lists
  const types = typesList.reduce((acc, type) => {
    acc.set(type.id, type);
    return acc;
  }, new Map<number, IMaterialType>());

  const subTypes = subTypesList.reduce((acc, subType) => {
    acc.set(subType.id, subType);
    return acc;
  }, new Map<number, IMaterialSubType>());

  // Group materials by category, type, and sub-type
  const materialDisplayCategory = materials.reduce(
    (acc: Map<number, IMaterialDisplayCategory>, material: IMaterial) => {
      const categoryId = material.materiel_categorie_id;
      const typeId = material.materiel_type_id;
      const subTypeId = material.materiel_sous_type_id;

      // Create a new category if necessary
      if (!acc.has(categoryId)) {
        const category = categories.get(categoryId);
        acc.set(categoryId, {
          id: categoryId,
          libelle: category.libelle,
          columns: category.columns,
          has_error: false,
          types: [],
        });
      }
      const category = acc.get(categoryId);
      category.has_error ||= material.has_error;

      // Find or create the type within the category
      let type: IMaterialDisplayType = category.types.find(
        ({ id }) => id === typeId
      );
      if (!type) {
        const typeData = types.get(typeId);
        type = {
          id: typeId,
          libelle: typeData.libelle,
          icon: typeData.libelle.toLowerCase(),
          has_error: false,
          subTypes: [],
        };
        category.types.push(type);
      }
      type.has_error ||= material.has_error;

      // Find or create the sub-type within the type
      let subType: IMaterialDisplaySubType = type.subTypes.find(
        ({ id }) => id === subTypeId
      );
      if (!subType) {
        const subTypeData = subTypes.get(subTypeId);
        subType = {
          id: subTypeId,
          libelle: subTypeData.libelle,
          materiel_categorie_id: subTypeData.materiel_categorie_id,
          materiel_caracteristiques: subTypeData.materiel_caracteristiques,
          materiel_evenement_types: subTypeData.materiel_evenement_types,
          materials: [],
        };
        type.subTypes.push(subType);
      }

      // Add the material to the sub-type
      subType.materials.push(material);

      return acc;
    },
    new Map<number, IMaterialDisplayCategory>()
  );

  return Array.from(materialDisplayCategory.values()).sort(
    (a, b) => a.id - b.id
  );
};

/**
 * Filters materials based on the provided search form.
 * @param materials The list of materials to be filtered.
 * @param searchCriteria The search form containing the filter criteria.
 * @returns An array of filtered materials.
 */
export function filterMaterials(
  materials: IMaterialDisplayCategory[],
  searchCriteria: IMaterialSearch
): IMaterialDisplayCategory[] {
  return materials
    .map((category) => ({
      ...category,
      types: category.types
        .map((_type) => ({
          ..._type,
          subTypes: _type.subTypes
            .map((subType) => ({
              ...subType,
              materials: subType.materials.filter(
                (material) =>
                  searchCriteria.actif === -1 ||
                  material.actif === !!searchCriteria.actif
              ),
            }))
            .filter(
              (subType) =>
                (searchCriteria.materiel_sous_type_id === -1 ||
                  subType.id === searchCriteria.materiel_sous_type_id) &&
                subType.materials.length > 0
            ),
        }))
        .filter(
          (_type) =>
            (searchCriteria.materiel_type_id === -1 ||
              _type.id === searchCriteria.materiel_type_id) &&
            _type.subTypes.length > 0
        ),
    }))
    .filter(
      (category) =>
        (searchCriteria.materiel_categorie_id === -1 ||
          category.id === searchCriteria.materiel_categorie_id) &&
        category.types.length > 0
    );
}

/**
 * Filters material display categories and their types and subtypes based on the given eventId.
 *
 * @param {IMaterialDisplayCategory[]} materialDisplayCategories - The array of material display categories.
 * @param {number} eventId - The ID of the event used for filtering subtypes.
 * @returns {IMaterialDisplayCategory[]} An array of filtered material display categories.
 */
export const filterSubTypesByEvenementType = (
  materialDisplayCategories: IMaterialDisplayCategory[],
  eventId: number
): IMaterialDisplayCategory[] => {
  // Map through each material display category
  return (
    materialDisplayCategories
      .map((category) => ({
        ...category,
        // Map through each type within the category
        types: category.types
          .map((type) => ({
            ...type,
            // Filter the subTypes based on whether their materiel_evenement_types include the given eventId
            subTypes: type.subTypes.filter((subType) =>
              subType.materiel_evenement_types.some(({ id }) => id === eventId)
            ),
          }))
          // Filter the types based on whether they have any subTypes remaining after filtering
          .filter((type) => type.subTypes.length),
      }))
      // Filter the categories based on whether they have any types remaining after filtering
      .filter((category) => category.types.length)
  );
};
