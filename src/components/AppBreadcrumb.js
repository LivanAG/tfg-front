import React from 'react'
import { useLocation, useNavigate, matchPath } from 'react-router-dom'
import routes from '../routes'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname
  const navigate = useNavigate()

  // ✅ Ahora matchea /movement/:id con /movement/20
  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) =>
      matchPath({ path: route.path, end: true }, pathname)
    )
    return currentRoute ? currentRoute.name : false
  }

  const getBreadcrumbs = (location) => {
    const breadcrumbs = []
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`
      const routeName = getRouteName(currentPathname, routes)

      if (routeName) {
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length,
        })
      }
      return currentPathname
    })
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs(currentLocation)

  const CrumbButton = ({ to, children }) => (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="breadcrumb-item-link"
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        color: 'inherit',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      {children}
    </button>
  )

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem>
        <CrumbButton to="/dashboard">Home</CrumbButton>
      </CBreadcrumbItem>

      {breadcrumbs.map((b, idx) => (
        <CBreadcrumbItem key={idx} active={b.active}>
          {b.active ? b.name : <CrumbButton to={b.pathname}>{b.name}</CrumbButton>}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
