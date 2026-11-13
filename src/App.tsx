import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AccountPage } from './pages/AccountPage'
import { CartPage } from './pages/CartPage'
import { ContactMessagesAdminPage } from './pages/ContactMessagesAdminPage'
import { ContactPage } from './pages/ContactPage'
import { CustomersPage } from './pages/CustomersPage'
import { HomePage } from './pages/HomePage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { LoginPage } from './pages/LoginPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { OrdersAdminPage } from './pages/OrdersAdminPage'
import { ProductsAdminPage } from './pages/ProductsAdminPage'
import { ProductsPage } from './pages/ProductsPage'
import { RegisterPage } from './pages/RegisterPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="productos" element={<ProductsPage />} />
              <Route path="productos/:id" element={<ProductDetailPage />} />
              <Route path="carrito" element={<CartPage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="registro" element={<RegisterPage />} />
              <Route path="olvide-contrasena" element={<ForgotPasswordPage />} />
              <Route path="restablecer-contrasena" element={<ResetPasswordPage />} />
              <Route
                path="cuenta"
                element={
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/pedidos"
                element={
                  <ProtectedRoute adminOnly>
                    <OrdersAdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/productos"
                element={
                  <ProtectedRoute adminOnly>
                    <ProductsAdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/clientes"
                element={
                  <ProtectedRoute adminOnly>
                    <CustomersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/mensajes"
                element={
                  <ProtectedRoute adminOnly>
                    <ContactMessagesAdminPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
