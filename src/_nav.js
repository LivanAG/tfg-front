import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilInbox,
  cilAddressBook,
  cilDescription,
  cilUser,
  cilTags,
  cilListRich,
  cilArrowThickFromRight,
  cilArrowThickFromLeft,
  cilShortText,
  cilFullscreenExit,
  cilHouse
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info'
    },
  },

  {
    component: CNavItem,
    name: 'Productos',
    to: '/products',
    icon: <CIcon icon={cilInbox} customClassName="nav-icon" />,
  },

  {
    component: CNavItem,
    name: 'Categorias',
    to: '/categories',
    icon: <CIcon icon={cilListRich} customClassName="nav-icon" />,
  },


  {
    component: CNavItem,
    name: 'Almacen',
    to: '/warehouse',
    icon: <CIcon icon={cilHouse} customClassName="nav-icon" />,
  },

  

  {
    component: CNavTitle,
    name: 'Movimientos',
  },

  {
    component: CNavItem,
    name: 'Entradas y Salidas',
    to: '/movements',
    icon: <CIcon icon={cilFullscreenExit} customClassName="nav-icon" />,
  },

  {
    component: CNavTitle,
    name: 'Reportes',
  },

  {
    component: CNavItem,
    name: 'Generar Reporte',
    to: '/reports',
    icon: <CIcon icon={cilShortText} customClassName="nav-icon" />,
  },


  
  {
    component: CNavTitle,
    name: 'Cuenta y Seguridad',
  },
  
  {
    component: CNavItem,
    name: 'Cuenta',
    to: '/account',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },
  
]

export default _nav
