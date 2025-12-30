import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
  CFormInput, CFormSelect, CButton, CPagination, CPaginationItem
} from "@coreui/react";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- STATES ---
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [details, setDetails] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [movementsPage, setMovementsPage] = useState({ content: [], totalPages: 1 });

  // --- MOVEMENT PAGINATION ---
  const [currentMovementsPage, setCurrentMovementsPage] = useState(1);
  const itemsPerPage = 10;

  // --- MOVEMENT FILTERS ---
  const [search, setSearch] = useState("");
  const [movementTypeFilter, setMovementTypeFilter] = useState("");
  const [quantityFilter, setQuantityFilter] = useState("");
  const [unitCostFilter, setUnitCostFilter] = useState("");

  // --- FETCH PRODUCT ---
  useEffect(() => {
    setLoadingProduct(true);
    fetch(`http://localhost:8080/api/products/${id}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
      .then(res => { if (!res.ok) throw new Error("Error al obtener el producto"); return res.json(); })
      .then(data => setProduct(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingProduct(false));
  }, [id, token]);

  // --- FETCH DETAILS ---
  useEffect(() => {
    fetch(`http://localhost:8080/api/products/${id}/details`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setDetails(data))
      .catch(err => { console.error(err); setDetails(null); });
  }, [id, token]);

  // --- FETCH STOCKS ---
  useEffect(() => {
    fetch(`http://localhost:8080/api/products/${id}/stocks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setStocks(data))
      .catch(err => { console.error(err); setStocks([]); });
  }, [id, token]);

  // --- FETCH MOVEMENTS ---
  useEffect(() => {
    const params = new URLSearchParams();
    params.append("page", currentMovementsPage - 1);
    params.append("size", itemsPerPage);
    if (search) params.append("reference", search);
    if (movementTypeFilter) params.append("movementType", movementTypeFilter);
    if (quantityFilter) params.append("quantity", quantityFilter);
    if (unitCostFilter) params.append("unitCost", unitCostFilter);

    fetch(`http://localhost:8080/api/inventory-movements/product/${id}?${params.toString()}`, {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setMovementsPage(data))
      .catch(err => console.error(err));
  }, [id, currentMovementsPage, search, movementTypeFilter, quantityFilter, unitCostFilter, token]);

  // 🔹 Reset page when filters change
  useEffect(() => setCurrentMovementsPage(1), [search, movementTypeFilter, quantityFilter, unitCostFilter]);

  if (loadingProduct) return <p>Cargando detalles del producto...</p>;
  if (!product) return <p>No se encontró el producto.</p>;

  // --- PAGINATION CALCULATION ---
  const totalMovementPages = movementsPage.totalPages || 1;
  const movementPageNumbers = [];
  const maxVisible = 5;
  let startPage = Math.max(currentMovementsPage - Math.floor(maxVisible / 2), 1);
  let endPage = startPage + maxVisible - 1;
  if (endPage > totalMovementPages) { endPage = totalMovementPages; startPage = Math.max(endPage - maxVisible + 1, 1); }
  for (let i = startPage; i <= endPage; i++) movementPageNumbers.push(i);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Detalle del Producto</h2>
      <div style={{ marginBottom: "1.5rem", background: "#f8f9fa", padding: "1rem", borderRadius: "8px", position: "relative" }}>
        <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
          <CButton color="warning" size="sm" onClick={() => navigate(`/products/${id}/edit`)}>Editar Información</CButton>
        </div>
        <p><strong>ID:</strong> {product.id}</p>
        <p><strong>Nombre:</strong> {product.name}</p>
        <p><strong>SKU:</strong> {product.sku}</p>
        <p><strong>Código de barras:</strong> {product.barcode}</p>
        <p><strong>Categoría:</strong> {product.categoryName}</p>
        <p><strong>Descripción:</strong> {product.description || "Sin descripción"}</p>
      </div>

      {/* --- DETAILS --- */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4>Detalles técnicos</h4>
        {details ? (
          <>
            {/* ✅ NUEVO MODELO */}
            <p><strong>Peso:</strong> {details.weight} {details.weightUnit || ""}</p>
            <p>
              <strong>Dimensiones:</strong>{" "}
              Largo: {details.length} {details.dimensionUnit || ""} |{" "}
              Ancho: {details.width} {details.dimensionUnit || ""}
            </p>

            <CButton color="primary" size="sm" onClick={() => navigate(`/products/${id}/details/edit`)}>
              Editar Detalles Técnicos
            </CButton>
          </>
        ) : (
          <>
            <p>No hay detalles técnicos.</p>
            <CButton color="success" size="sm" onClick={() => navigate(`/products/${id}/details/add`)}>
              Agregar Detalles Técnicos
            </CButton>
          </>
        )}
      </div>

      {/* --- STOCKS --- */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h4>Stocks</h4>
        {stocks.length > 0 ? (
          <CTable hover responsive bordered>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>Cantidad</CTableHeaderCell>
                <CTableHeaderCell>Lote</CTableHeaderCell>
                <CTableHeaderCell>Fecha de expiración</CTableHeaderCell>
                <CTableHeaderCell>Almacén</CTableHeaderCell>
                <CTableHeaderCell>Costo Unitario</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {stocks.map(s => (
                <CTableRow key={s.id}>
                  <CTableDataCell>{s.quantity}</CTableDataCell>
                  <CTableDataCell>{s.lotNumber}</CTableDataCell>
                  <CTableDataCell>{s.expirationDate || "-"}</CTableDataCell>
                  <CTableDataCell>{s.warehouseId}</CTableDataCell>
                  <CTableDataCell>{s.unitCost || "-"}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        ) : <p>No hay stock registrado.</p>}
      </div>

      {/* --- MOVEMENTS --- */}
      <h4>Movimientos</h4>
      <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
        <CFormInput placeholder="Buscar movimientos..." value={search} onChange={e => setSearch(e.target.value)} />
        <CFormSelect value={movementTypeFilter} onChange={e => setMovementTypeFilter(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="IN">Entrada</option>
          <option value="OUT">Salida</option>
        </CFormSelect>
        <CFormInput type="number" placeholder="Cantidad..." value={quantityFilter} onChange={e => setQuantityFilter(e.target.value)} />
        <CFormInput type="number" placeholder="Costo unitario..." value={unitCostFilter} onChange={e => setUnitCostFilter(e.target.value)} />
      </div>

      {movementsPage.content.length > 0 ? (
        <CTable hover responsive bordered>
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell>Tipo</CTableHeaderCell>
              <CTableHeaderCell>Referencia</CTableHeaderCell>
              <CTableHeaderCell>Cantidad</CTableHeaderCell>
              <CTableHeaderCell>Costo Unitario</CTableHeaderCell>
              <CTableHeaderCell>Precio de venta x unidad</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {movementsPage.content.map((mov, index) =>
              mov.details.filter(item => item.productId === parseInt(id))
                .map((item, idx) => (
                  <CTableRow key={`${index}-${idx}`}>
                    <CTableDataCell>{mov.movementType}</CTableDataCell>
                    <CTableDataCell>{mov.referenceDocument}</CTableDataCell>
                    <CTableDataCell>{item.quantity}</CTableDataCell>
                    <CTableDataCell>{item.unitCost}</CTableDataCell>
                    <CTableDataCell>{item.sellPriceUnit}</CTableDataCell>
                  </CTableRow>
                ))
            )}
          </CTableBody>
        </CTable>
      ) : <p>No hay movimientos registrados para este producto.</p>}

      {/* --- PAGINATION --- */}
      {totalMovementPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <CPagination>
            <CPaginationItem disabled={currentMovementsPage === 1} onClick={() => setCurrentMovementsPage(currentMovementsPage - 1)}>Anterior</CPaginationItem>

            {startPage > 1 && (
              <>
                <CPaginationItem onClick={() => setCurrentMovementsPage(1)}>1</CPaginationItem>
                {startPage > 2 && <span style={{ padding: "0 5px" }}>...</span>}
              </>
            )}

            {movementPageNumbers.map(num => (
              <CPaginationItem key={num} active={currentMovementsPage === num} onClick={() => setCurrentMovementsPage(num)}>{num}</CPaginationItem>
            ))}

            {endPage < totalMovementPages && (
              <>
                {endPage < totalMovementPages - 1 && <span style={{ padding: "0 5px" }}>...</span>}
                <CPaginationItem onClick={() => setCurrentMovementsPage(totalMovementPages)}>{totalMovementPages}</CPaginationItem>
              </>
            )}

            <CPaginationItem disabled={currentMovementsPage === totalMovementPages} onClick={() => setCurrentMovementsPage(currentMovementsPage + 1)}>Siguiente</CPaginationItem>
          </CPagination>
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <CButton color="secondary" onClick={() => navigate("/products")}>Volver a la lista</CButton>
      </div>
    </div>
  );
}

export default ProductDetail;
