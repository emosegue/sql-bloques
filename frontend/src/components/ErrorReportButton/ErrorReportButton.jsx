import React from 'react'
import BugReportIcon from '@mui/icons-material/BugReport'
import './ErrorReportButton.css'
import Tooltip from '@mui/material/Tooltip'

const ErrorReportButton = () => {
  const handleClick = () => {
    const subject = encodeURIComponent('Reporte de error en SQLBloques')
    const body = encodeURIComponent('Hola,\n\nQuería reportar un error que ocurrió en la aplicación:\n\n[Especificá aquí el problema, adjuntando imágenes de ser posible]\n\nGracias.')
    window.open(`mailto:emanuelmosegue@gmail.com?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <Tooltip title="Reportar error" placement="right">
      <div className="error-report-button" onClick={handleClick}>
        <BugReportIcon className="icon" />
      </div>
    </Tooltip>
  )
}

export default ErrorReportButton