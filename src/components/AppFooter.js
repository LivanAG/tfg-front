import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a target="_blank" rel="noopener noreferrer">
          LoQueHay  <span className="ms-1">&copy; 2025</span>  Todos los derechos reservados. 
        </a>
       
       
      </div>
      <div className="ms-auto">
        <a  target="_blank" rel="noopener noreferrer">
          Gracias por visitarnos
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
