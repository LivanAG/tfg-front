import React from 'react'

const ForgotPassword = React.lazy(() => import('./views/pages/forgotPassword/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./views/pages/resetPassword/ResetPassword'))

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Products
const Products = React.lazy(() => import('./views/products/Products'))
const ProductsDetail = React.lazy(() => import('./views/products/ProductsDetail'))
const ProductsCreate = React.lazy(() => import('./views/products/ProductsCreate'))
const ProductsTechnicalsDetail = React.lazy(() => import('./views/products/ProductTecnicalDetailsForm'))

// Categories
const Categories = React.lazy(() => import('./views/categories/Categories'))
const CategoryCreate = React.lazy(() => import('./views/categories/CategoryCreate'))

// Warehouse
const WareHouseList = React.lazy(() => import('./views/warehouse/WareHouseList'))
const WareHouseCreate = React.lazy(() => import('./views/warehouse/WhCreate'))
const WareHouseDetail = React.lazy(() => import('./views/warehouse/WareHouseDetail'))

// Movements
const MovementCreate = React.lazy(() => import('./views/movements/InventoryMovementCreate'))
const MovementList = React.lazy(() => import('./views/movements/InventoryMovementsList'))
const MovementDetail = React.lazy(() => import('./views/movements/InventoryMovementDetail'))

// Reports
const ReportCreate = React.lazy(() => import('./views/reports/ReportCreate'))

// Account
const MyAccount = React.lazy(() => import('./views/account/MyAccount'))
const EditUserForm = React.lazy(() => import('./views/account/EditUserForm'))
const ChangePasswordForm = React.lazy(() => import('./views/account/ChangePasswordForm'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  // Products
  { path: '/products', name: 'Products', element: Products },
  { path: '/products/create', name: 'ProductsCreate', element: ProductsCreate },
  { path: '/products/:id/edit', element: ProductsCreate },
  { path: '/products/:id', name: 'ProductsDetail', element: ProductsDetail },
  { path: '/products/:id/details/add', name: 'AddTechnicalDetails', element: ProductsTechnicalsDetail },
  { path: '/products/:id/details/edit', name: 'EditTechnicalDetails', element: ProductsTechnicalsDetail },

  // Categories
  { path: '/categories', name: 'Categories', element: Categories },
  { path: '/categories/create', name: 'CategoryCreate', element: CategoryCreate },

  // Warehouse
  { path: '/warehouse', name: 'WareHouseList', element: WareHouseList },
  { path: '/warehouse/create', name: 'WareHouseCreate', element: WareHouseCreate },
  { path: '/warehouse/:id', name: 'WareHouseDetail', element: WareHouseDetail },

  // Movements
  { path: '/movement/create', name: 'MovementCreate', element: MovementCreate },
  { path: '/movements', name: 'MovementList', element: MovementList },
  { path: '/movement/:id', name: 'MovementDetail', element: MovementDetail },

  // Account
  { path: '/account', name: 'MyAccount', element: MyAccount },
  { path: '/account/edit', name: 'EditUserForm', element: EditUserForm },
  { path: '/account/password', name: 'ChangePasswordForm', element: ChangePasswordForm },

  // Reports
  { path: '/reports', name: 'ReportCreate', element: ReportCreate },

  // Auth (públicas — manejadas en App.js)
  { path: '/forgot-password', name: 'ForgotPassword', element: ForgotPassword },
  { path: '/reset-password', name: 'ResetPassword', element: ResetPassword },
]

export default routes
