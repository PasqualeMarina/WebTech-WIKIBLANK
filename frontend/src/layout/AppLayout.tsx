import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import styles from './AppLayout.module.css'

export function AppLayout() {
  return (
    <main className={styles.appShell}>
      <Sidebar />
      <Outlet />
    </main>
  )
}
