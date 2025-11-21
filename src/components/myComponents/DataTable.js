import { useState, useEffect } from "react";
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
} from "@coreui/react";

function DataTable({ columns, data, itemsPerPage = 10 }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Función segura para convertir cualquier valor a string
  const safeString = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  // Filtrar productos según searchTerm
  const filteredData = data.filter((row) =>
    columns.some((col) =>
      safeString(row[col.key]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Rango de páginas visibles
  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
  let endPage = startPage + maxVisible - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisible + 1, 1);
  }
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  // Resetear página si cambia searchTerm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div>
      <CFormInput
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />

      <CTable hover>
        <CTableHead>
          <CTableRow>
            {columns.map((col) => (
              <CTableHeaderCell key={col.key}>{col.label}</CTableHeaderCell>
            ))}
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {currentData.map((row, idx) => (
            <CTableRow key={idx}>
              {columns.map((col) => (
                <CTableDataCell key={col.key}>{safeString(row[col.key])}</CTableDataCell>
              ))}
            </CTableRow>
          ))}
          {currentData.length === 0 && (
            <CTableRow>
              <CTableDataCell colSpan={columns.length} style={{ textAlign: "center" }}>
                No se encontraron resultados.
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>

      {/* Paginación centrada */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
        <CPagination>
          <CPaginationItem
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </CPaginationItem>

          {startPage > 1 && (
            <>
              <CPaginationItem onClick={() => setCurrentPage(1)}>1</CPaginationItem>
              {startPage > 2 && <span style={{ padding: "0 5px" }}>...</span>}
            </>
          )}

          {pageNumbers.map((number) => (
            <CPaginationItem
              key={number}
              active={currentPage === number}
              onClick={() => setCurrentPage(number)}
            >
              {number}
            </CPaginationItem>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span style={{ padding: "0 5px" }}>...</span>}
              <CPaginationItem onClick={() => setCurrentPage(totalPages)}>
                {totalPages}
              </CPaginationItem>
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

export default DataTable;
