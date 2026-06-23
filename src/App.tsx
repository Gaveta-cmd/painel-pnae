import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Escolas } from './pages/Escolas'
import { Alunos } from './pages/Alunos'
import { Alimentos } from './pages/Alimentos'
import { Cardapios } from './pages/Cardapios'
import { CardapioDetalhe } from './pages/CardapioDetalhe'
import { Estoque } from './pages/Estoque'
import { Fornecedores } from './pages/Fornecedores'
import { Relatorios } from './pages/Relatorios'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function AppRoutes() {
  const { loadFromStorage } = useAuthStore()

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="escolas" element={<Escolas />} />
        <Route path="alunos" element={<Alunos />} />
        <Route path="alimentos" element={<Alimentos />} />
        <Route path="cardapios" element={<Cardapios />} />
        <Route path="cardapios/:id" element={<CardapioDetalhe />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="fornecedores" element={<Fornecedores />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
