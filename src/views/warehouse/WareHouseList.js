import { useEffect, useState } from "react";
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CPagination, CPaginationItem, CFormInput, CButton
} from "@coreui/react";
import { useNavigate } from "react-router-dom";

function WarehousesList() {
  const [warehouses, setWarehouses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // 🔹 Fetch warehouses
  const fetchWarehouses = () => {
    const params = new URLSearchParams();
    params.append("page", currentPage - 1);
    params.append("size", itemsPerPage);
    if (searchTerm) params.append("search", searchTerm);

    fetch(`http://localhost:8080/api/warehouses/paged?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setWarehouses(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
        setSelectedWarehouses([]);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  // 🔹 Selección de warehouses
  const handleSelect = (id) => {
    setSelectedWarehouses(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedWarehouses.length === (warehouses?.length || 0)) {
      setSelectedWarehouses([]);
    } else {
      setSelectedWarehouses(warehouses.map(p => p.id));
    }
  };

  const handleDeleteSelected = () => {
    if (!window.confirm("¿Estás seguro de eliminar los almacenes seleccionados?")) return;
    fetch("http://localhost:8080/api/warehouses/delete-multiple", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(selectedWarehouses),
    })
      .then(() => fetchWarehouses())
      .catch(err => console.error(err));
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

  useEffect(() => setCurrentPage(1), [searchTerm]);

  return (
    <div>
      <h2>Almacenes</h2>

      {/* 🔹 Filtro */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        <CFormInput
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 🔹 Acciones */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "10px" }}>
        <CButton color="success" size="sm" onClick={() => navigate("/warehouse/create")}>
          Crear Almacén
        </CButton>
        {selectedWarehouses.length > 0 && (
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
                checked={selectedWarehouses.length === (warehouses?.length || 0) && (warehouses?.length || 0) > 0}
                onChange={handleSelectAll}
              />
            </CTableHeaderCell>
            <CTableHeaderCell>Nombre</CTableHeaderCell>
            <CTableHeaderCell>Ubicación</CTableHeaderCell>
            <CTableHeaderCell>Descripción</CTableHeaderCell>
            <CTableHeaderCell>Propietario</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {warehouses.length > 0 ? warehouses.map(w => (
            <CTableRow key={w.id}>
              <CTableDataCell>
                <input type="checkbox" checked={selectedWarehouses.includes(w.id)} onChange={() => handleSelect(w.id)} />
              </CTableDataCell>
              <CTableDataCell>{w.name}</CTableDataCell>
              <CTableDataCell>{w.location}</CTableDataCell>
              <CTableDataCell>{w.description}</CTableDataCell>
              <CTableDataCell>{w.ownerUsername}</CTableDataCell>
              <CTableDataCell>
                <CButton color="primary" size="sm" disabled={selectedWarehouses.length >= 1} onClick={() => navigate(`/warehouse/${w.id}`)}>
                  Detalles
                </CButton>
              </CTableDataCell>
            </CTableRow>
          )) : (
            <CTableRow>
              <CTableDataCell colSpan={8} style={{ textAlign: "center" }}>No se encontraron almacenes.</CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {/* 🔹 Paginación */}
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
    </div>
  );
}

export default WarehousesList;
