import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CProgress,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBasket, cilDollar, cilArrowTop, cilArrowBottom } from '@coreui/icons'
import { CChartPie, CChartBar, CChartLine } from '@coreui/react-chartjs'

const Dashboard = () => {
  const token = localStorage.getItem('token')

  const [summary, setSummary] = useState(null)
  const [categoryStock, setCategoryStock] = useState([])
  const [stockByWarehouse, setStockByWarehouse] = useState([])
  const [productsExpiring, setProductsExpiring] = useState([])
  const [monthlySalesPurchases, setMonthlySalesPurchases] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8080/api/reports/dashboard/summary', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setSummary(data))
      .catch(err => console.error(err))
  }, [token])

  useEffect(() => {
    fetch('http://localhost:8080/api/reports/dashboard/stock-by-category', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setCategoryStock(data))
      .catch(err => console.error(err))
  }, [token])

  useEffect(() => {
    fetch('http://localhost:8080/api/reports/dashboard/stock-value-by-warehouse', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setStockByWarehouse(data))
      .catch(err => console.error(err))
  }, [token])

  useEffect(() => {
    fetch('http://localhost:8080/api/reports/dashboard/products-expiring', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setProductsExpiring(data))
      .catch(err => console.error(err))
  }, [token])

  useEffect(() => {
    fetch('http://localhost:8080/api/reports/dashboard/monthly-sales-purchases', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => setMonthlySalesPurchases(data))
      .catch(err => console.error(err))
  }, [token])

  if (!summary) return <p>Cargando resumen del dashboard...</p>

  const cards = [
    {
      title: 'Productos en Stock',
      value: summary.totalProductsInStock,
      icon: cilBasket,
      color: 'info',
    },
    {
      title: 'Valor Total Inventario',
      value: `$${summary.totalInventoryValue.toLocaleString()}`,
      icon: cilDollar,
      color: 'success',
    },
    {
      title: 'Ventas del Mes',
      value: summary.salesThisMonth,
      icon: cilArrowTop,
      color: 'primary',
    },
    {
      title: 'Compras del Mes',
      value: summary.purchasesThisMonth,
      icon: cilArrowBottom,
      color: 'warning',
    },
  ]

  return (
    <>
      {/* --- CARDS --- */}
      <CRow className="mb-4">
        {cards.map((card, idx) => (
          <CCol key={idx} xs={12} sm={6} lg={3} className="mb-4">
            <CCard className="shadow-sm border-0 rounded-3 h-100">
              <CCardBody className="d-flex flex-column justify-content-between">
                <div className="d-flex align-items-center mb-3">
                  <CIcon icon={card.icon} className={`text-${card.color} fs-1 me-3`} />
                  <div>
                    <div className="text-secondary small">{card.title}</div>
                    <div className="fs-4 fw-bold">{card.value}</div>
                  </div>
                </div>
                <CProgress thin color={card.color} value={Math.floor(Math.random() * 100)} className="rounded-pill"/>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* --- GRAFICAS --- */}
      <CRow>
       

        {/* Valor total de stock por almacén */}
        <CCol xs={12} md={6} lg={6} className="mb-4">
          <CCard className="shadow-sm rounded-3">
            <CCardHeader className="fw-bold">Valor total de stock por Almacén</CCardHeader>
            <CCardBody>
              <CChartBar
                data={{
                  labels: stockByWarehouse.map(w => w.warehouseName),
                  datasets: [{
                    label: 'Valor Total',
                    data: stockByWarehouse.map(w => w.totalValue),
                    backgroundColor: '#36A2EB',
                    borderRadius: 5,
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>

        {/* Productos próximos a vencer */}
        <CCol xs={12} md={6} lg={6} className="mb-4">
          <CCard className="shadow-sm rounded-3">
            <CCardHeader className="fw-bold">Productos próximos a vencer</CCardHeader>
            <CCardBody>
              <CChartBar
                data={{
                  labels: productsExpiring.map(p => p.daysRange),
                  datasets: [{
                    label: 'Cantidad',
                    data: productsExpiring.map(p => p.count),
                    backgroundColor: '#FF6384',
                    borderRadius: 5,
                  }],
                }}
                options={{ responsive: true }}
              />
            </CCardBody>
          </CCard>
        </CCol>

        {/* Ventas y compras mensuales */}
        <CCol xs={12} md={6} lg={6} className="mb-4">
          <CCard className="shadow-sm rounded-3">
            <CCardHeader className="fw-bold">Ventas y Compras Mensuales</CCardHeader>
            <CCardBody>
              {monthlySalesPurchases && (
                <CChartLine
                  data={{
                    labels: monthlySalesPurchases.months,
                    datasets: [
                      {
                        label: 'Ventas',
                        data: monthlySalesPurchases.sales,
                        borderColor: '#36A2EB',
                        backgroundColor: 'rgba(54,162,235,0.2)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                      },
                      {
                        label: 'Compras',
                        data: monthlySalesPurchases.purchases,
                        borderColor: '#FF6384',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { position: 'top' } },
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
         {/* Stock por categoría */}
        <CCol xs={12} md={6} lg={6} className="mb-4">
          <CCard className="shadow-sm rounded-3">
            <CCardHeader className="fw-bold">Stock por Categoría</CCardHeader>
            <CCardBody>
              <CChartPie
                data={{
                  labels: categoryStock.map(c => c.categoryName),
                  datasets: [{
                    data: categoryStock.map(c => c.count),
                    backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#FFCE56', '#36A2EB'],
                  }],
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
