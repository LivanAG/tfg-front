import { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CRow, CCol, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBasket, cilDollar, cilArrowTop, cilArrowBottom } from '@coreui/icons'
import { CChartPie, CChartBar } from '@coreui/react-chartjs'
import { apiFetch } from '../../services/api'

const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  orange: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  pie: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'],
  expiringBars: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'],
}

const fmt = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

const fmtInt = (n) => (typeof n === 'number' ? n.toLocaleString('es-AR') : '—')

const EmptyChart = ({ message = 'Sin datos disponibles' }) => (
  <div
    style={{
      height: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9CA3AF',
      fontSize: '0.9rem',
    }}
  >
    {message}
  </div>
)

const SummaryCard = ({ title, value, icon, color, subtitle }) => (
  <CCol xs={12} sm={6} lg={3} className="mb-4">
    <CCard className="shadow-sm border-0 rounded-3 h-100">
      <CCardBody className="d-flex align-items-center gap-3 p-4">
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: `rgba(var(--cui-${color}-rgb, 59,130,246), 0.12)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <CIcon icon={icon} className={`text-${color}`} style={{ width: 26, height: 26 }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="text-secondary small text-truncate">{title}</div>
          <div className="fs-4 fw-bold text-truncate">{value}</div>
          {subtitle && (
            <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
              {subtitle}
            </div>
          )}
        </div>
      </CCardBody>
    </CCard>
  </CCol>
)

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    summary: null,
    categoryStock: [],
    stockByWarehouse: [],
    productsExpiring: [],
    monthlySalesPurchases: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const endpoints = [
      '/api/reports/dashboard/summary',
      '/api/reports/dashboard/stock-by-category',
      '/api/reports/dashboard/stock-value-by-warehouse',
      '/api/reports/dashboard/products-expiring',
      '/api/reports/dashboard/monthly-sales-purchases',
    ]
    Promise.all(
      endpoints.map((ep) =>
        apiFetch(ep).catch((err) => {
          console.error('Error fetching ' + ep + ':', err)
          return null
        })
      )
    ).then(([summary, categoryStock, stockByWarehouse, productsExpiring, monthlySalesPurchases]) => {
      if (!summary) setError(true)
      setDashboardData({
        summary,
        categoryStock: categoryStock || [],
        stockByWarehouse: stockByWarehouse || [],
        productsExpiring: productsExpiring || [],
        monthlySalesPurchases,
      })
      setLoading(false)
    })
  }, [])

  if (loading)
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <CSpinner color="primary" />
        <span className="ms-3 text-secondary">Cargando dashboard...</span>
      </div>
    )

  if (error || !dashboardData.summary)
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <span className="text-danger">No se pudo cargar el resumen del dashboard.</span>
      </div>
    )

  const { summary, categoryStock, stockByWarehouse, productsExpiring, monthlySalesPurchases } =
    dashboardData

  const cards = [
    {
      title: 'Productos en Stock',
      value: fmtInt(summary.totalProductsInStock),
      subtitle: 'variedades distintas',
      icon: cilBasket,
      color: 'info',
    },
    {
      title: 'Valor Total Inventario',
      value: '$' + fmt(summary.totalInventoryValue),
      subtitle: 'costo acumulado',
      icon: cilDollar,
      color: 'success',
    },
    {
      title: 'Ventas del Mes',
      value: fmtInt(summary.salesThisMonth),
      subtitle: 'movimientos de salida',
      icon: cilArrowTop,
      color: 'primary',
    },
    {
      title: 'Compras del Mes',
      value: fmtInt(summary.purchasesThisMonth),
      subtitle: 'movimientos de entrada',
      icon: cilArrowBottom,
      color: 'warning',
    },
  ]

  // Ventas y compras — barras agrupadas por mes
  const hasMonthlyData = monthlySalesPurchases?.months?.length > 0

  // Lotes por vencer — todos los períodos (incluidos en 0 para mostrar escala)
  const expiringLabels = ['0 – 60 días', '61 – 120 días', '121 – 180 días', 'Más de 180 días']
  const expiringCounts = productsExpiring.length === 4
    ? productsExpiring.map((p) => p.count)
    : [0, 0, 0, 0]
  const allZero = expiringCounts.every((c) => c === 0)

  // Stock por almacén
  const warehouseLabels = stockByWarehouse.map((w) => w.warehouseName)
  const warehouseValues = stockByWarehouse.map((w) => w.totalValue)

  // Categorías — solo las que tienen productos
  const categoryFiltered = categoryStock.filter((c) => c.count > 0)

  return (
    <>
      <CRow className="mb-2">
        {cards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </CRow>

      <CRow>
        {/* Ventas y Compras mensuales — barras agrupadas */}
        <CCol xs={12} md={8} className="mb-4">
          <CCard className="shadow-sm rounded-3 h-100">
            <CCardHeader className="fw-semibold py-3">Ventas y Compras — Últimos 6 meses</CCardHeader>
            <CCardBody>
              {!hasMonthlyData ? (
                <EmptyChart message="No hay movimientos en los últimos 6 meses" />
              ) : (
                <CChartBar
                  data={{
                    labels: monthlySalesPurchases.months,
                    datasets: [
                      {
                        label: 'Ventas',
                        data: monthlySalesPurchases.sales,
                        backgroundColor: COLORS.blue,
                        borderRadius: 4,
                        borderSkipped: false,
                      },
                      {
                        label: 'Compras',
                        data: monthlySalesPurchases.purchases,
                        backgroundColor: COLORS.green,
                        borderRadius: 4,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: { usePointStyle: true, padding: 16 },
                      },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` ${ctx.dataset.label}: $${fmt(ctx.parsed.y)}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { callback: (v) => '$' + fmtInt(v) },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                      },
                      x: { grid: { display: false } },
                    },
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Productos por categoría */}
        <CCol xs={12} md={4} className="mb-4">
          <CCard className="shadow-sm rounded-3 h-100">
            <CCardHeader className="fw-semibold py-3">Productos por Categoría</CCardHeader>
            <CCardBody>
              {categoryFiltered.length === 0 ? (
                <EmptyChart message="No hay productos registrados" />
              ) : (
                <CChartPie
                  data={{
                    labels: categoryFiltered.map((c) => c.categoryName),
                    datasets: [
                      {
                        data: categoryFiltered.map((c) => c.count),
                        backgroundColor: COLORS.pie,
                        borderWidth: 2,
                        hoverOffset: 8,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, padding: 12 },
                      },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
                            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0
                            return ` ${ctx.label}: ${fmtInt(ctx.parsed)} (${pct}%)`
                          },
                        },
                      },
                    },
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Valor de stock por almacén */}
        <CCol xs={12} md={6} className="mb-4">
          <CCard className="shadow-sm rounded-3 h-100">
            <CCardHeader className="fw-semibold py-3">Valor de Stock por Almacén</CCardHeader>
            <CCardBody>
              {warehouseLabels.length === 0 ? (
                <EmptyChart message="No hay stock registrado en ningún almacén" />
              ) : (
                <CChartBar
                  data={{
                    labels: warehouseLabels,
                    datasets: [
                      {
                        label: 'Valor ($)',
                        data: warehouseValues,
                        backgroundColor: warehouseLabels.map(
                          (_, i) => COLORS.pie[i % COLORS.pie.length]
                        ),
                        borderRadius: 6,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => ` $${fmt(ctx.parsed.y)}`,
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { callback: (v) => '$' + fmtInt(v) },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                      },
                      x: { grid: { display: false } },
                    },
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>

        {/* Lotes por vencer */}
        <CCol xs={12} md={6} className="mb-4">
          <CCard className="shadow-sm rounded-3 h-100">
            <CCardHeader className="fw-semibold py-3">Lotes por Vencer</CCardHeader>
            <CCardBody>
              {allZero ? (
                <EmptyChart message="No hay lotes próximos a vencer" />
              ) : (
                <>
                  <CChartBar
                    data={{
                      labels: expiringLabels,
                      datasets: [
                        {
                          label: 'Lotes',
                          data: expiringCounts,
                          backgroundColor: COLORS.expiringBars,
                          borderRadius: 6,
                          borderSkipped: false,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => ` ${fmtInt(ctx.parsed.y)} lote${ctx.parsed.y !== 1 ? 's' : ''}`,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { stepSize: 1, precision: 0 },
                          grid: { color: 'rgba(0,0,0,0.05)' },
                        },
                        x: { grid: { display: false } },
                      },
                    }}
                  />
                  {/* Leyenda de colores */}
                  <div className="d-flex flex-wrap gap-3 mt-3" style={{ fontSize: '0.8rem' }}>
                    {expiringLabels.map((label, i) => (
                      <div key={label} className="d-flex align-items-center gap-1">
                        <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: COLORS.expiringBars[i], flexShrink: 0 }} />
                        <span className="text-secondary">{label}: <strong>{fmtInt(expiringCounts[i])}</strong></span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
