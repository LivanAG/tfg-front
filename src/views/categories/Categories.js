import { useEffect, useState } from "react";
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CPagination, CPaginationItem, CFormInput, CButton
} from "@coreui/react";

function CategoriesList() {
  const [categoriesPage, setCategoriesPage] = useState({ content: [], totalPages: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const token = localStorage.getItem("token");
  const itemsPerPage = 10;

  // --- Fetch categories con paginación y búsqueda ---
  const fetchCategories = (page = 1, search = "") => {
    fetch(`http://localhost:8080/api/categories/paged?page=${page - 1}&size=${itemsPerPage}&search=${search}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener categorías");
        return res.json();
      })
      .then(data => setCategoriesPage(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCategories(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  // --- Selección de categorías ---
  const handleSelect = (id) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategories.length === categoriesPage.content.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(categoriesPage.content.map(c => c.id));
    }
  };

  // --- Eliminar seleccionadas ---
  const handleDeleteSelected = () => {
    if (!window.confirm("¿Estás seguro de eliminar las categorías seleccionadas?")) return;
    fetch("http://localhost:8080/categories/delete-multiple", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(selectedCategories),
    })
      .then(res => res.json())
      .then(() => {
        fetchCategories(currentPage, searchTerm); // recarga la página actual
        setSelectedCategories([]);
      })
      .catch(err => console.error(err));
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

  // Reset página al cambiar la búsqueda
  useEffect(() => setCurrentPage(1), [searchTerm]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Categorías</h2>

      {/* Input de búsqueda */}
      <CFormInput
        type="text"
        placeholder="Buscar categorías..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />

      {/* Botones superiores */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "10px" }}>
        <CButton color="success" size="sm">
          Crear Categoría
        </CButton>
        {selectedCategories.length > 0 && (
          <CButton color="danger" size="sm" onClick={handleDeleteSelected}>
            Eliminar seleccionadas
          </CButton>
        )}
      </div>

      {/* Tabla de categorías */}
      <CTable hover responsive bordered>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>
              <input
                type="checkbox"
                checked={selectedCategories.length === categoriesPage.content.length && categoriesPage.content.length > 0}
                onChange={handleSelectAll}
              />
            </CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Nº de Productos</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {categoriesPage.content.length > 0 ? categoriesPage.content.map(c => (
            <CTableRow key={c.id}>
              <CTableDataCell>
                <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={() => handleSelect(c.id)} />
              </CTableDataCell>
              <CTableDataCell>{c.name}</CTableDataCell>
              <CTableDataCell>{c.totalProducts}</CTableDataCell>
            </CTableRow>
          )) : (
            <CTableRow>
              <CTableDataCell colSpan={3} style={{ textAlign: "center" }}>No se encontraron categorías.</CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <CPagination>
            <CPaginationItem disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</CPaginationItem>
            {startPage > 1 && (
              <>
                <CPaginationItem onClick={() => setCurrentPage(1)}>1</CPaginationItem>
                {startPage > 2 && <span style={{ padding: "0 5px" }}>...</span>}
              </>
            )}
            {pageNumbers.map(num => (
              <CPaginationItem key={num} active={currentPage === num} onClick={() => setCurrentPage(num)}>{num}</CPaginationItem>
            ))}
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span style={{ padding: "0 5px" }}>...</span>}
                <CPaginationItem onClick={() => setCurrentPage(totalPages)}>{totalPages}</CPaginationItem>
              </>
            )}
            <CPaginationItem disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</CPaginationItem>
          </CPagination>
        </div>
      )}
    </div>
  );
}

export default CategoriesList;
