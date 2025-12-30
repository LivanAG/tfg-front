// src/components/myComponents/InventoryMovementCreate.js
import { useState, useEffect } from "react";
import {
  CForm,
  CFormInput,
  CFormTextarea,
  CButton,
  CRow,
  CCol
} from "@coreui/react";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

function InventoryMovementCreate() {
  const [movementType, setMovementType] = useState("IN");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [note, setNote] = useState("");
  const [warehouse, setWarehouse] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [details, setDetails] = useState([
    { product: null, quantity: 0, unitCost: 0, sellPriceUnit: 0, lotNumber: "", expirationDate: "" },
  ]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ---------- Helpers ----------
  const getProductName = (d, index) => d?.product?.label || `Línea #${index + 1}`;

  const joinNames = (names) => {
    if (names.length <= 1) return names[0] || "";
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  };

  const humanizeBackendError = (data) => {
    const raw = data?.backendMessage || data?.message || data?.error || "";

    if (data?.errors && !Array.isArray(data.errors) && typeof data.errors === "object") {
      const messages = Object.entries(data.errors).map(([path, msg]) => {
        const m = String(path).match(/^(entryDetails|exitDetails)\[(\d+)\]\.(.+)$/);
        if (!m) return String(msg);

        const idx = Number(m[2]);
        const field = m[3];
        const name = getProductName(details[idx], idx);

        if (field === "productId") return `${name}: selecciona un producto`;
        if (field === "quantity") return `${name}: la cantidad debe ser mayor que 0`;
        if (field === "unitCost") return `${name}: el costo unitario debe ser mayor o igual a 0`;
        if (field === "sellPriceUnit") return `${name}: el precio unitario de venta debe ser mayor o igual a 0`;

        return `${name}: ${String(msg)}`;
      });

      return messages[0] || "Error de validación";
    }

    if (Array.isArray(data?.errors)) {
      const msgs = data.errors.map((e) => String(e));
      return msgs[0] || "Error de validación";
    }

    const parts = String(raw).split(",").map((p) => p.trim()).filter(Boolean);
    const mapped = parts.map((p) => {
      const m = p.match(/^(entryDetails|exitDetails)\[(\d+)\]\.(.+?)\s*:\s*(.*)$/);
      if (!m) return p;

      const idx = Number(m[2]);
      const field = m[3];
      const name = getProductName(details[idx], idx);

      if (field === "productId") return `${name}: selecciona un producto`;
      if (field === "quantity") return `${name}: la cantidad debe ser mayor que 0`;
      if (field === "unitCost") return `${name}: el costo unitario debe ser mayor o igual a 0`;
      if (field === "sellPriceUnit") return `${name}: el precio unitario de venta debe ser mayor o igual a 0`;

      return `${name}: ${m[4]}`;
    });

    return mapped[0] || raw || "Error desconocido del servidor";
  };

  // ---------- Validación FRONT (solo errores generales, en orden) ----------
  const validateBeforeSubmit = () => {
    // 0) almacén
    if (!warehouse) {
      setError("Debes seleccionar un almacén.");
      return false;
    }

    // ✅ 1) documento de referencia obligatorio
    if (!referenceDocument || !referenceDocument.trim()) {
      setError("El documento de referencia es obligatorio.");
      return false;
    }

    // 2) producto seleccionado en todas las filas
    const missingProduct = details.some((d) => !d.product?.value);
    if (missingProduct) {
      setError("Debes seleccionar un producto en cada línea.");
      return false;
    }

    // 3) no duplicados
    const seen = new Set();
    for (let i = 0; i < details.length; i++) {
      const id = details[i]?.product?.value;
      if (id == null) continue;
      if (seen.has(id)) {
        const name = details[i]?.product?.label || "Ese producto";
        setError(`El producto "${name}" ya está añadido. No puedes repetirlo.`);
        return false;
      }
      seen.add(id);
    }

    // 4) cantidades > 0
    const badQty = details
      .map((d, i) => ({ d, i }))
      .filter(({ d }) => {
        const q = Number(d.quantity);
        return !Number.isFinite(q) || q <= 0;
      })
      .map(({ d, i }) => getProductName(d, i));

    if (badQty.length) {
      if (badQty.length === 1) {
        setError(`${badQty[0]}: la cantidad debe ser mayor que 0.`);
      } else {
        setError(`La cantidad debe ser mayor que 0 en: ${joinNames(badQty)}.`);
      }
      return false;
    }

    // 5) costos (según tipo)
    if (movementType === "IN") {
      const badCost = details
        .map((d, i) => ({ d, i }))
        .filter(({ d }) => {
          const c = Number(d.unitCost);
          return !Number.isFinite(c) || c < 0;
        })
        .map(({ d, i }) => getProductName(d, i));

      if (badCost.length) {
        if (badCost.length === 1) {
          setError(`${badCost[0]}: el costo unitario debe ser mayor o igual a 0.`);
        } else {
          setError(`El costo unitario debe ser mayor o igual a 0 en: ${joinNames(badCost)}.`);
        }
        return false;
      }
    }

    if (movementType === "OUT") {
      const badSell = details
        .map((d, i) => ({ d, i }))
        .filter(({ d }) => {
          const p = Number(d.sellPriceUnit);
          return !Number.isFinite(p) || p < 0;
        })
        .map(({ d, i }) => getProductName(d, i));

      if (badSell.length) {
        if (badSell.length === 1) {
          setError(`${badSell[0]}: el precio unitario de venta debe ser mayor o igual a 0.`);
        } else {
          setError(`El precio unitario de venta debe ser mayor o igual a 0 en: ${joinNames(badSell)}.`);
        }
        return false;
      }
    }

    setError(null);
    return true;
  };

  // --- Cargar productos y almacenes ---
  useEffect(() => {
    if (!token) return navigate("/login");

    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:8080/api/products", { headers })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.content || [];
        setProducts(list.map((p) => ({ value: p.id, label: p.name })));
      })
      .catch((err) => console.error(err));

    fetch("http://localhost:8080/api/warehouses", { headers })
      .then((res) => res.json())
      .then((data) =>
        setWarehouses(data.map((w) => ({ value: w.id, label: w.name })))
      )
      .catch((err) => console.error(err));
  }, [token, navigate]);

  // --- Añadir línea de detalle ---
  const addDetail = () => {
    setDetails([
      ...details,
      { product: null, quantity: 0, unitCost: 0, sellPriceUnit: 0, lotNumber: "", expirationDate: "" },
    ]);
  };

  // --- Eliminar línea ---
  const removeDetail = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  // --- Cambiar un valor de detalle ---
  const handleDetailChange = (index, field, value) => {
    const updated = [...details];

    // Bloquear producto duplicado en otra línea
    if (field === "product") {
      const newId = value?.value;
      if (newId != null) {
        const duplicated = details.some((d, i) => i !== index && d?.product?.value === newId);
        if (duplicated) {
          setError(`El producto "${value.label}" ya está añadido. Elige otro.`);
          return;
        }
      }
    }

    updated[index][field] = value;
    setDetails(updated);
  };

  // --- Enviar formulario ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const ok = validateBeforeSubmit();
    if (!ok) {
      setLoading(false);
      return;
    }

    const dto = {
      movementType,
      referenceDocument: referenceDocument.trim(),
      note,
      warehouseId: warehouse.value,
      entryDetails:
        movementType === "IN"
          ? details.map((d) => ({
              productId: d.product?.value,
              quantity: Number(d.quantity),
              unitCost: Number(d.unitCost),
              lotNumber: d.lotNumber || null,
              expirationDate: d.expirationDate || null,
            }))
          : null,
      exitDetails:
        movementType === "OUT"
          ? details.map((d) => ({
              productId: d.product?.value,
              quantity: Number(d.quantity),
              sellPriceUnit: Number(d.sellPriceUnit),
            }))
          : null,
    };

    fetch("http://localhost:8080/api/inventory-movements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    })
      .then(async (res) => {
        const text = await res.text();

        let data;
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }

        if (!res.ok) {
          throw new Error(humanizeBackendError(data));
        }

        // ✅ Redirigir al listado
        navigate("/movements", { replace: true });
        return data;
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // lista de productos disponibles por línea (quita los usados en otras líneas)
  const getOptionsForRow = (rowIndex) => {
    const usedIds = new Set(
      details
        .filter((_, i) => i !== rowIndex)
        .map((d) => d.product?.value)
        .filter((v) => v != null)
    );
    return products.filter((p) => !usedIds.has(p.value));
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto" }}>
      <h2>Registrar Movimiento de Inventario</h2>
      <CForm onSubmit={handleSubmit}>
        <CRow>
          <CCol md={4}>
            <label>Tipo de Movimiento</label>
            <Select
              options={[
                { value: "IN", label: "Entrada" },
                { value: "OUT", label: "Salida" },
              ]}
              value={{
                value: movementType,
                label: movementType === "IN" ? "Entrada" : "Salida",
              }}
              onChange={(opt) => setMovementType(opt.value)}
            />
          </CCol>

          <CCol md={4}>
            <CFormInput
              label="Documento de Referencia"
              value={referenceDocument}
              onChange={(e) => setReferenceDocument(e.target.value)}
            />
          </CCol>

          <CCol md={4}>
            <label>Almacén</label>
            <Select
              options={warehouses}
              value={warehouse}
              onChange={setWarehouse}
              placeholder="Seleccione un almacén"
            />
          </CCol>
        </CRow>

        <CFormTextarea
          label="Nota"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          style={{ marginTop: "1rem" }}
        />

        <h4 style={{ marginTop: "2rem" }}>
          Detalles de {movementType === "IN" ? "Entrada" : "Salida"}
        </h4>

        {details.map((d, i) => (
          <CRow key={i} className="align-items-end mb-3">
            <CCol md={3}>
              <label>Producto</label>
              <Select
                options={getOptionsForRow(i)}
                value={d.product}
                onChange={(val) => handleDetailChange(i, "product", val)}
              />
            </CCol>

            <CCol md={2}>
              <CFormInput
                type="number"
                label="Cantidad"
                value={d.quantity}
                onChange={(e) => handleDetailChange(i, "quantity", e.target.value)}
              />
            </CCol>

            {movementType === "IN" && (
              <>
                <CCol md={2}>
                  <CFormInput
                    type="number"
                    label="Costo Unitario"
                    value={d.unitCost}
                    onChange={(e) => handleDetailChange(i, "unitCost", e.target.value)}
                  />
                </CCol>

                <CCol md={2}>
                  <CFormInput
                    label="Lote"
                    value={d.lotNumber}
                    onChange={(e) => handleDetailChange(i, "lotNumber", e.target.value)}
                  />
                </CCol>

                <CCol md={2}>
                  <CFormInput
                    type="date"
                    label="Vencimiento"
                    value={d.expirationDate}
                    onChange={(e) => handleDetailChange(i, "expirationDate", e.target.value)}
                  />
                </CCol>
              </>
            )}

            {movementType === "OUT" && (
              <CCol md={2}>
                <CFormInput
                  type="number"
                  label="Precio Unitario Venta"
                  value={d.sellPriceUnit}
                  onChange={(e) => handleDetailChange(i, "sellPriceUnit", e.target.value)}
                />
              </CCol>
            )}

            <CCol md={1}>
              <CButton color="danger" onClick={() => removeDetail(i)}>
                X
              </CButton>
            </CCol>
          </CRow>
        ))}

        <CButton type="button" color="info" onClick={addDetail}>
          + Agregar Producto
        </CButton>

        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

        <div style={{ display: "flex", gap: "10px", marginTop: "2rem" }}>
          <CButton type="submit" color="primary" disabled={loading}>
            {loading ? "Guardando..." : "Guardar Movimiento"}
          </CButton>
          <CButton color="secondary" onClick={() => navigate("/movements")}>
            Cancelar
          </CButton>
        </div>
      </CForm>
    </div>
  );
}

export default InventoryMovementCreate;
