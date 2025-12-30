import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// Products 
const Products = React.lazy(() => import('./views/products/Products'))
const ProductsDetail = React.lazy(() => import('./views/products/ProductsDetail'))
const ProductsCreate = React.lazy(() => import('./views/products/ProductsCreate'))
const ProductsTecnicalsDetail = React.lazy(() => import('./views/products/ProductTecnicalDetailsForm'))

//Categories
const Categories = React.lazy(() => import('./views/categories/Categories'))
const CategoryCreate = React.lazy(() => import('./views/categories/CategoryCreate'))

//Warehouse
const WareHouseList = React.lazy(() => import('./views/warehouse/WareHouseList'))
const WareHouseCreate = React.lazy(() => import('./views/warehouse/WhCreate'))
const WarehouseDetail = React.lazy(() => import('./views/warehouse/WarehouseDetail'))


// Movements 
const MovementCreate = React.lazy(() => import('./views/movements/InventoryMovementCreate'))
const MovementList = React.lazy(() => import('./views/movements/InventoryMovementsList'))
const MovementDetail = React.lazy(() => import('./views/movements/InventoryMovementDetail'))

// Reports
const ReportCreate = React.lazy(() => import('./views/reports/ReportCreate'))



//Account
const EditUserForm = React.lazy(() => import('./views/account/EditUserForm'))
const ChangePasswordForm = React.lazy(() => import('./views/account/ChangePasswordForm'))
//Info Account
const MyAccount = React.lazy(() => import('./views/account/MyAccount'))



const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  // Products 
  { path: '/products', name: 'Products', element: Products },

  { path: '/products/create', name: 'ProductsCreate', element: ProductsCreate },
  { path: "/products/:id/edit", element: ProductsCreate },

  { path: '/products/:id', name: 'ProductsDetail', element: ProductsDetail },

  // Technical Details Form (Add/Edit)
  { path: '/products/:id/details/add', name: 'AddTechnicalDetails', element: ProductsTecnicalsDetail },
  { path: '/products/:id/details/edit', name: 'EditTechnicalDetails', element: ProductsTecnicalsDetail },


  // Categories
  { path: '/categories', name: 'Categories', element: Categories },
  { path: '/category/create', name: 'CategoryCreate', element: CategoryCreate },

  
  
  // Warehouse
  { path: '/warehouse', name: 'WareHouseList', element: WareHouseList },
  { path: '/warehouse/create', name: 'WareHouseCreate', element: WareHouseCreate },
  { path: '/warehouse/:id', name: 'WarehouseDetail', element: WarehouseDetail },
  // Movements
  { path: '/movement/create', name: 'MovementCreate', element: MovementCreate },
  { path: '/movements', name: 'MovementList', element: MovementList },
  { path: '/movement/:id', name: 'MovementDetail', element: MovementDetail },


 

  // Accounts
  { path: '/account', name: 'MyAccount', element: MyAccount },
  { path: '/account/edit', name: 'EditUserForm', element: EditUserForm },
  { path: '/account/password', name: 'ChangePasswordForm', element: ChangePasswordForm },

  // Reports
  { path: '/reports', name: 'ReportCreate', element: ReportCreate },

]

export default routes
