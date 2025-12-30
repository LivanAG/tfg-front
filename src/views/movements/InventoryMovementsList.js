import { useEffect, useState } from "react";
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CPagination, CPaginationItem, CFormInput, CFormSelect, CButton, CAlert
} from "@coreui/react";
import { useNavigate } from "react-router-dom";

function InventoryMovementList() {
  const [movements, setMovements] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 🔹 Filtros
  const [referenceDocument, setReferenceDocument] = useState("");
  const [movementType, setMovementType] = useState("");
  const [warehouseId, setWarehouseId] = useState("");

  // 🔹 Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Selección + errores
  const [selectedMovements, setSelectedMovements] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔹 Fetch movimientos
  const fetchMovements = () => {
    setErrorMessage("");

    const params = new URLSearchParams();
    params.append("page", currentPage - 1);
    params.append("size", itemsPerPage);

    if (referenceDocument) params.append("reference", referenceDocument);
    if (movementType) params.append("movementType", movementType);
    if (warehouseId) params.append("warehouseId", warehouseId);

    fetch(`http://localhost:8080/api/inventory-movements/paged?${params.toString()}`, {
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
            "Error al obtener movimientos";

          throw new Error(msg);
        }

        return data;
      })
      .then(data => {
        setMovements(data?.content || []);
        setTotalPages(data?.totalPages || 0);
        setTotalElements(data?.totalElements || 0);
        setSelectedMovements([]); // ✅ limpia selección al refrescar
      })
      .catch(err => {
        console.error(err);
        setErrorMessage(err.message || "Error al obtener movimientos");
      });
  };

  // 🔹 Fetch almacenes
  const fetchWarehouses = () => {
    fetch("http://localhost:8080/api/warehouses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setWarehouses(data || []))
      .catch(err => console.error(err));
  };

  // 🔹 useEffect para movimientos
  useEffect(() => {
    fetchMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, referenceDocument, movementType, warehouseId]);

  // 🔹 useEffect para cargar almacenes al montar
  useEffect(() => {
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Selección de movimientos
  const handleSelect = (id) => {
    setSelectedMovements(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMovements.length === (movements?.length || 0)) {
      setSelectedMovements([]);
    } else {
      setSelectedMovements(movements.map(m => m.id));
    }
  };

  // ✅ Eliminar seleccionados
  const handleDeleteSelected = () => {
    setErrorMessage("");

    if (!window.confirm("¿Estás seguro de eliminar los movimientos seleccionados?")) return;

    fetch("http://localhost:8080/api/inventory-movements/delete-multiple", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(selectedMovements),
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
            "Error eliminando movimientos";

          throw new Error(msg);
        }

        return;
      })
      .then(() => fetchMovements())
      .catch(err => {
        console.error(err);
        setErrorMessage(err.message || "Error eliminando movimientos");
      });
  };

  // 🔹 Paginación visual
  const pageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(currentPage - Math.floor(maxVisible / 2), 1);
  let endPage = startPage + maxVisible - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxVisible + 1, 1);
  }
  for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

  return (
    <div>
      <h2>Movimientos de Inventario</h2>

      {/* ✅ Alert de error */}
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
          placeholder="Buscar por referencia..."
          value={referenceDocument}
          onChange={(e) => setReferenceDocument(e.target.value)}
        />
        <CFormSelect value={movementType} onChange={(e) => setMovementType(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="IN">Entrada</option>
          <option value="OUT">Salida</option>
        </CFormSelect>
        <CFormSelect value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
          <option value="">Todos los almacenes</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </CFormSelect>
      </div>

      {/* ✅ Acciones */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "10px" }}>
        <CButton color="success" size="sm" onClick={() => navigate("/movement/create")}>
          Crear Movimiento
        </CButton>

        {selectedMovements.length > 0 && (
          <CButton color="danger" size="sm" onClick={handleDeleteSelected}>
            Eliminar seleccionados
          </CButton>
        )}
      </div>

      {/* 🔹 Tabla */}
      <CTable hover className="mt-3">
        <CTableHead>
          <CTableRow>
            {/* ✅ Checkbox header */}
            <CTableHeaderCell>
              <input
                type="checkbox"
                checked={selectedMovements.length === (movements?.length || 0) && (movements?.length || 0) > 0}
                onChange={handleSelectAll}
              />
            </CTableHeaderCell>

            <CTableHeaderCell>ID</CTableHeaderCell>
            <CTableHeaderCell>Tipo</CTableHeaderCell>
            <CTableHeaderCell>Documento Ref.</CTableHeaderCell>
            <CTableHeaderCell>Almacén</CTableHeaderCell>
            <CTableHeaderCell>Creado por</CTableHeaderCell>
            <CTableHeaderCell>Fecha</CTableHeaderCell>
            <CTableHeaderCell>Acciones</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {movements.length > 0 ? movements.map(m => (
            <CTableRow key={m.id}>
              {/* ✅ Checkbox fila */}
              <CTableDataCell>
                <input
                  type="checkbox"
                  checked={selectedMovements.includes(m.id)}
                  onChange={() => handleSelect(m.id)}
                />
              </CTableDataCell>

              <CTableDataCell>{m.id}</CTableDataCell>
              <CTableDataCell>{m.movementType}</CTableDataCell>
              <CTableDataCell>{m.referenceDocument}</CTableDataCell>
              <CTableDataCell>{m.warehouseName || "-"}</CTableDataCell>
              <CTableDataCell>{m.createdByName || "-"}</CTableDataCell>
              <CTableDataCell>{new Date(m.createdAt).toLocaleString()}</CTableDataCell>
              <CTableDataCell>
                <CButton
                  color="primary"
                  size="sm"
                  disabled={selectedMovements.length >= 1}
                  onClick={() => navigate(`/movement/${m.id}`)}
                >
                  Ver Detalles
                </CButton>
              </CTableDataCell>
            </CTableRow>
          )) : (
            <CTableRow>
              <CTableDataCell colSpan={8} style={{ textAlign: "center" }}>
                No se encontraron movimientos.
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

          {pageNumbers.map(num => (
            <CPaginationItem key={num} active={currentPage === num} onClick={() => setCurrentPage(num)}>
              {num}
            </CPaginationItem>
          ))}

          <CPaginationItem disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>
            Siguiente
          </CPaginationItem>
        </CPagination>
      </div>
    </div>
  );
}

export default InventoryMovementList;
