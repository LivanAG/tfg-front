import { useEffect, useState } from "react";
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CPagination,
  CPaginationItem,
  CFormInput,
  CButton,
  CAlert,
} from "@coreui/react";
import { useNavigate } from "react-router-dom";

function CategoriesList() {
  const [categoriesPage, setCategoriesPage] = useState({ content: [], totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate(); // ✅
  const token = localStorage.getItem("token");
  const itemsPerPage = 10;

  // --- Fetch categories con paginación y búsqueda ---
  const fetchCategories = (page = 1, search = "") => {
    setErrorMessage("");

    fetch(
      `http://localhost:8080/api/categories/paged?page=${page - 1}&size=${itemsPerPage}&search=${encodeURIComponent(
        search
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
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
      .then((data) => setCategoriesPage(data))
      .catch((err) => {
        console.error(err);
        setErrorMessage(err.message || "Error al obtener categorías");
      });
  };

  useEffect(() => {
    fetchCategories(currentPage, searchTerm);
    setSelectedCategories([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  // --- Selección de categorías ---
  const handleSelect = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = categoriesPage.content.map((c) => c.id);
    const allVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedCategories.includes(id));

    if (allVisibleSelected) {
      setSelectedCategories((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedCategories((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // --- Eliminar seleccionadas ---
  const handleDeleteSelected = () => {
    setErrorMessage("");

    if (!window.confirm("¿Estás seguro de eliminar las categorías seleccionadas?")) return;

    fetch("http://localhost:8080/api/categories/delete-multiple", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(selectedCategories),
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
            "Error eliminando categorías";

          throw new Error(msg);
        }

        return;
      })
      .then(() => {
        fetchCategories(currentPage, searchTerm);
        setSelectedCategories([]);
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage(err.message || "Error eliminando categorías");
      });
  };

  // --- Paginación ---
  const totalPages = categoriesPage.totalPages;
  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
  let endPage = startPage + maxVisible - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisible + 1, 1);
  }
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const visibleIds = categoriesPage.content.map((c) => c.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedCategories.includes(id));

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Categorías</h2>

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

      <CFormInput
        type="text"
        placeholder="Buscar categorías..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />

      <div style={{ marginBottom: "1rem", display: "flex", gap: "10px" }}>
        <CButton color="success" size="sm" onClick={() => navigate("/category/create")}>
          Crear Categoría
        </CButton>

        {selectedCategories.length > 0 && (
          <CButton color="danger" size="sm" onClick={handleDeleteSelected}>
            Eliminar seleccionadas
          </CButton>
        )}
      </div>

      <CTable hover responsive bordered>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>
              <input type="checkbox" checked={allVisibleSelected} onChange={handleSelectAll} />
            </CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Nº de Productos</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {categoriesPage.content.length > 0 ? (
            categoriesPage.content.map((c) => (
              <CTableRow key={c.id}>
                <CTableDataCell>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(c.id)}
                    onChange={() => handleSelect(c.id)}
                  />
                </CTableDataCell>
                <CTableDataCell>{c.name}</CTableDataCell>
                <CTableDataCell>{c.totalProducts}</CTableDataCell>
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan={3} style={{ textAlign: "center" }}>
                No se encontraron categorías.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {totalPages > 1 && (
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
      )}
    </div>
  );
}

export default CategoriesList;
