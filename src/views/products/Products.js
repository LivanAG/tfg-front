import { useEffect, useState } from "react";
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CPagination, CPaginationItem, CFormInput, CButton, CFormSelect, CAlert
} from "@coreui/react";
import { useNavigate } from "react-router-dom";

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔹 Fetch productos (con manejo de errores tipo Categories)
  const fetchProducts = () => {
    setErrorMessage("");

    const params = new URLSearchParams();
    params.append("page", currentPage - 1);
    params.append("size", itemsPerPage);

    if (searchTerm) params.append("search", searchTerm);
    if (sku) params.append("sku", sku);
    if (categoryId) params.append("categoryId", categoryId);

    fetch(`http://localhost:8080/api/products/paged?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg =
            data?.backendMessage ||
            data?.message ||
            data?.details ||
            data?.detail ||
            data?.title ||
            "Error al obtener productos";

          throw new Error(msg);
        }

        return data;
      })
      .then((data) => {
        setProducts(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
        setSelectedProducts([]);
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage(err.message || "Error al obtener productos");
      });
  };

  // 🔹 Fetch categorías (con manejo de errores)
  const fetchCategories = () => {
    fetch(`http://localhost:8080/api/categories`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg =
            data?.backendMessage ||
            data?.message ||
            data?.details ||
            data?.detail ||
            data?.title ||
            "Error al obtener categorías";

          throw new Error(msg);
        }

        return data;
      })
      .then((data) => setCategories(data || []))
      .catch((err) => {
        console.error(err);
        setErrorMessage(err.message || "Error al obtener categorías");
      });
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, sku, categoryId]);

  // 🔹 Selección de productos
  const handleSelect = (id) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === (products?.length || 0)) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.id));
    }
  };

  // 🔹 Eliminar seleccionados (con manejo de excepciones)
  const handleDeleteSelected = () => {
    setErrorMessage("");

    if (!window.confirm("¿Estás seguro de eliminar los productos seleccionados?")) return;

    fetch("http://localhost:8080/api/products/delete-multiple", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(selectedProducts),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          const msg =
            data?.backendMessage ||
            data?.message ||
            data?.details ||
            data?.detail ||
            data?.title ||
            "Error eliminando productos";

          throw new Error(msg);
        }

        return;
      })
      .then(() => fetchProducts())
      .catch((err) => {
        console.error(err);
        setErrorMessage(err.message || "Error eliminando productos");
      });
  };

  // 🔹 Paginación UI
  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
  let endPage = startPage + maxVisible - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisible + 1, 1);
  }
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  useEffect(() => setCurrentPage(1), [searchTerm, sku, categoryId]);

  return (
    <div>
      <h2>Productos</h2>

      {errorMessage && (
        <CAlert
          color="danger"
          dismissible
          onClose={() => setErrorMessage("")}
          style={{ marginBottom: "1rem" }}
        >
          {errorMessage}
        </CAlert>
      )}

      {/* 🔹 Filtros */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        <CFormInput
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <CFormInput
          type="text"
          placeholder="Buscar por SKU..."
          value={sku}
          onChange={(e) => setSku(e.target.value)}
        />
        <CFormSelect value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </CFormSelect>
      </div>

      {/* 🔹 Acciones */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "10px" }}>
        <CButton color="success" size="sm" onClick={() => navigate("/products/create")}>
          Crear Producto
        </CButton>
        {selectedProducts.length > 0 && (
          <CButton color="danger" size="sm" onClick={handleDeleteSelected}>
            Eliminar seleccionados
          </CButton>
        )}
      </div>

      {/* 🔹 Tabla */}
      <CTable hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>
              <input
                type="checkbox"
                checked={
                  selectedProducts.length === (products?.length || 0) &&
                  (products?.length || 0) > 0
                }
                onChange={handleSelectAll}
              />
            </CTableHeaderCell>
            <CTableHeaderCell>SKU</CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>BarCode</CTableHeaderCell>
            <CTableHeaderCell>Categoría</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {products.length > 0 ? (
            products.map((p) => (
              <CTableRow key={p.id}>
                <CTableDataCell>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(p.id)}
                    onChange={() => handleSelect(p.id)}
                  />
                </CTableDataCell>
                <CTableDataCell>{p.sku}</CTableDataCell>
                <CTableDataCell>{p.name}</CTableDataCell>
                <CTableDataCell>{p.barcode}</CTableDataCell>
                <CTableDataCell>{p.categoryName}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="primary"
                    size="sm"
                    disabled={selectedProducts.length >= 1}
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    Detalles
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={6} style={{ textAlign: "center" }}>
                No se encontraron productos.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {/* 🔹 Paginación */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
        <CPagination>
          <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
            Anterior
          </CPaginationItem>

          {startPage > 1 && (
            <>
              <CPaginationItem onClick={() => setCurrentPage(1)}>1</CPaginationItem>
              {startPage > 2 && <span style={{ padding: "0 5px" }}>...</span>}
            </>
          )}

          {pageNumbers.map((num) => (
            <CPaginationItem key={num} active={currentPage === num} onClick={() => setCurrentPage(num)}>
              {num}
            </CPaginationItem>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span style={{ padding: "0 5px" }}>...</span>}
              <CPaginationItem onClick={() => setCurrentPage(totalPages)}>{totalPages}</CPaginationItem>
            </>
          )}

          <CPaginationItem
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </CPaginationItem>
        </CPagination>
      </div>
    </div>
  );
}

export default ProductsList;
