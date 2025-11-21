import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CFormSelect, CFormInput, CFormLabel } from "@coreui/react";
import { useState, useEffect } from "react";

function FilterModal({ visible, onClose, onApply, initialFilters = {} }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(initialFilters.category || "");
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || "");
  const [minStock, setMinStock] = useState(initialFilters.minStock || "");
  const [maxStock, setMaxStock] = useState(initialFilters.maxStock || "");
  const [backendMinPrice, setBackendMinPrice] = useState(0);
  const [backendMaxPrice, setBackendMaxPrice] = useState(0);
  const [backendMinStock, setBackendMinStock] = useState(0);
  const [backendMaxStock, setBackendMaxStock] = useState(0);

  // Reset valores cuando cambian los filtros iniciales
  useEffect(() => {
    setCategory(initialFilters.category || "");
    setMinPrice(initialFilters.minPrice || "");
    setMaxPrice(initialFilters.maxPrice || "");
    setMinStock(initialFilters.minStock || "");
    setMaxStock(initialFilters.maxStock || "");
  }, [initialFilters, visible]);

  const fetchFilters = (filters) => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8080/bff/products/filters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(filters),
    })
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setBackendMinPrice(data.minPrice || 0);
        setBackendMaxPrice(data.maxPrice || 0);
        setBackendMinStock(data.minStock || 0);
        setBackendMaxStock(data.maxStock || 0);
      })
      .catch(err => console.error("Error cargando filtros:", err));
  };

  useEffect(() => {
    if (!visible) return;
    fetchFilters({
      category: null,
      minPrice: null,
      maxPrice: null,
      minStock: null,
      maxStock: null
    });
  }, [visible]);

  const handleBlur = () => {
    fetchFilters({
      category: category ? Number(category) : null,
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
      minStock: minStock ? Number(minStock) : null,
      maxStock: maxStock ? Number(maxStock) : null,
    });
  };

  const handleApply = () => {
  const filtersToSend = {
    category: category ? Number(category) : null,
    minPrice: minPrice ? Number(minPrice) : null,
    maxPrice: maxPrice ? Number(maxPrice) : null,
    minStock: minStock ? Number(minStock) : null,
    maxStock: maxStock ? Number(maxStock) : null,
  };

  onApply(filtersToSend);
  onClose();
};

  const handleClear = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinStock("");
    setMaxStock("");
    // Traer todos los valores iniciales del backend
    fetchFilters({
      category: null,
      minPrice: null,
      maxPrice: null,
      minStock: null,
      maxStock: null
    });
  };

  return (
    <CModal visible={visible} onClose={onClose}>
      <CModalHeader>
        <CModalTitle>Filtrar productos</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormLabel>Categoría</CFormLabel>
        <CFormSelect
            value={category || ""}
            onChange={(e) => setCategory(e.target.value)}
            onBlur={handleBlur}
            >
            <option value="">Todas</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                {cat.name}  {/* <-- aquí mostramos el nombre */}
                </option>
            ))}
            </CFormSelect>

        <div style={{ marginTop: "15px" }}>
          <CFormLabel>Precio</CFormLabel>
          <div style={{ display: "flex", gap: "10px" }}>
            <CFormInput
              type="number"
              min={backendMinPrice}
              max={backendMaxPrice}
              placeholder={`Min: ${backendMinPrice}`}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              onBlur={handleBlur}
            />
            <CFormInput
              type="number"
              min={backendMinPrice}
              max={backendMaxPrice}
              placeholder={`Max: ${backendMaxPrice}`}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              onBlur={handleBlur}
            />
          </div>
        </div>

        <div style={{ marginTop: "15px" }}>
          <CFormLabel>Stock</CFormLabel>
          <div style={{ display: "flex", gap: "10px" }}>
            <CFormInput
              type="number"
              min={backendMinStock}
              max={backendMaxStock}
              placeholder={`Min: ${backendMinStock}`}
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              onBlur={handleBlur}
            />
            <CFormInput
              type="number"
              min={backendMinStock}
              max={backendMaxStock}
              placeholder={`Max: ${backendMaxStock}`}
              value={maxStock}
              onChange={(e) => setMaxStock(e.target.value)}
              onBlur={handleBlur}
            />
          </div>
        </div>
      </CModalBody>
      <CModalFooter style={{ display: "flex", justifyContent: "space-between" }}>
        <CButton color="warning" onClick={handleClear}>Limpiar filtros</CButton>
        <div>
          <CButton color="secondary" onClick={onClose} style={{ marginRight: "10px" }}>Cancelar</CButton>
          <CButton color="primary" onClick={handleApply}>Aplicar</CButton>
        </div>
      </CModalFooter>
    </CModal>
  );
}

export default FilterModal;
